import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSession, resolveSession } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  BatchPromoteInput,
  EnrollStudentInput,
  LinkParentInput,
  PromoteStudentInput,
  StudentQuery,
  UpdateStudentInput,
} from '../middlewares/student-validation.js';

const studentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      banned: true,
      createdAt: true,
    },
  },
  parents: {
    include: {
      parent: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  },
  enrollments: {
    where: { isActive: true },
    include: {
      classArm: {
        include: { arm: true, classLevel: true },
      },
      session: true,
    },
    take: 1,
  },
} as const;

const enrollmentInclude = {
  classArm: {
    include: { arm: true, classLevel: true },
  },
  session: true,
} as const;

type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof studentInclude;
}>;

interface Assignment {
  studentId: string;
  classArmId: string;
  sessionId: string; // same toSessionId for every assignment in one call
}

// Deactivate every currently-active enrollment for these students (across
// ANY session — a student only ever has one active enrollment at a time),
// then create or update their enrollment for the target session.
async function deactivateAndAssign(
  tx: Prisma.TransactionClient,
  toSessionId: string,
  assignments: Assignment[],
) {
  const studentIds = assignments.map((a) => a.studentId);

  await tx.studentEnrollment.updateMany({
    where: { studentId: { in: studentIds }, isActive: true },
    data: { isActive: false },
  });

  const existing = await tx.studentEnrollment.findMany({
    where: { studentId: { in: studentIds }, sessionId: toSessionId },
    select: { studentId: true },
  });
  const existingIds = new Set(existing.map((e) => e.studentId));

  const toCreate = assignments.filter((a) => !existingIds.has(a.studentId));
  const toUpdate = assignments.filter((a) => existingIds.has(a.studentId));

  if (toCreate.length > 0) {
    await tx.studentEnrollment.createMany({
      data: toCreate.map((a) => ({ ...a, isActive: true })),
    });
  }

  await Promise.all(
    toUpdate.map((a) =>
      tx.studentEnrollment.update({
        where: {
          studentId_sessionId: {
            studentId: a.studentId,
            sessionId: a.sessionId,
          },
        },
        data: { classArmId: a.classArmId, isActive: true },
      }),
    ),
  );
}

// Student Service

export const studentService = {
  async listStudents(
    { page = 1, limit = 20 }: PaginationQuery,
    query: StudentQuery,
  ): Promise<PaginatedResponse<StudentWithDetails>> {
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          {
            user: {
              name: { contains: query.search, mode: 'insensitive' as const },
            },
          },
          {
            admissionNumber: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(query.classArmId && {
        enrollments: {
          some: {
            classArmId: query.classArmId,
            isActive: true,
            ...(query.sessionId
              ? { sessionId: query.sessionId }
              : { session: { isActive: true } }),
          },
        },
      }),
      ...(query.section && {
        enrollments: {
          some: {
            isActive: true,
            classArm: { classLevel: { section: query.section } },
          },
        },
      }),
    };

    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { name: 'asc' } },
        include: studentInclude,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getStudentById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        ...studentInclude,
        enrollments: {
          include: enrollmentInclude,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!student) throw createError('Student not found', 404);
    return student;
  },

  async getStudentByUserId(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: studentInclude,
    });
    if (!student) throw createError('Student not found', 404);
    return student;
  },

  async updateStudent(
    id: string,
    data: UpdateStudentInput,
  ): Promise<StudentWithDetails> {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw createError('Student not found', 404);

    return prisma.student.update({
      where: { id },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.gender && { gender: data.gender }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
        ...(data.bloodGroup !== undefined && {
          bloodGroup: data.bloodGroup ?? null,
        }),
        ...(data.genotype !== undefined && { genotype: data.genotype ?? null }),
        ...(data.medicalConditions !== undefined && {
          medicalConditions: data.medicalConditions ?? null,
        }),
      },
      include: studentInclude,
    });
  },

  async deactivateStudent(id: string): Promise<void> {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw createError('Student not found', 404);

    await prisma.$transaction([
      prisma.student.update({ where: { id }, data: { isActive: false } }),
      prisma.user.update({
        where: { id: student.userId },
        data: { banned: true },
      }),
      prisma.studentEnrollment.updateMany({
        where: { studentId: id, isActive: true },
        data: { isActive: false },
      }),
    ]);
  },

  // Enrollment
  async enrollStudent(id: string, data: EnrollStudentInput) {
    const [student, session] = await Promise.all([
      prisma.student.findUnique({ where: { id } }),
      getActiveSession(),
    ]);
    if (!student) throw createError('Student not found', 404);
    if (!student.isActive)
      throw createError('Cannot enroll an inactive student', 400);

    const classArm = await prisma.classArm.findUnique({
      where: { id: data.classArmId },
      include: { classLevel: true },
    });
    if (!classArm) throw createError('Class arm not found', 404);

    const existing = await prisma.studentEnrollment.findUnique({
      where: { studentId_sessionId: { studentId: id, sessionId: session.id } },
    });
    if (existing) {
      throw createError(
        'Student is already enrolled for the current session. Use update to change class arm.',
        409,
      );
    }

    return prisma.studentEnrollment.create({
      data: {
        studentId: id,
        classArmId: data.classArmId,
        sessionId: session.id,
      },
      include: enrollmentInclude,
    });
  },

  async updateEnrollment(id: string, data: EnrollStudentInput) {
    const session = await getActiveSession();

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { studentId_sessionId: { studentId: id, sessionId: session.id } },
    });
    if (!enrollment) {
      throw createError(
        'Student is not enrolled for the current session.',
        404,
      );
    }

    const classArm = await prisma.classArm.findUnique({
      where: { id: data.classArmId },
    });
    if (!classArm) throw createError('Class arm not found', 404);

    return prisma.studentEnrollment.update({
      where: { studentId_sessionId: { studentId: id, sessionId: session.id } },
      data: { classArmId: data.classArmId },
      include: enrollmentInclude,
    });
  },

  async getEnrollmentHistory(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw createError('Student not found', 404);

    return prisma.studentEnrollment.findMany({
      where: { studentId: id },
      include: enrollmentInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  // ─── Parent Linking
  async linkParent(id: string, data: LinkParentInput) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw createError('Student not found', 404);

    const parent = await prisma.parent.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) throw createError('Parent not found', 404);

    const existing = await prisma.studentParent.findUnique({
      where: {
        studentId_parentId: {
          studentId: id,
          parentId: data.parentId,
        },
      },
    });
    if (existing)
      throw createError('This parent is already linked to this student', 409);

    // If isPrimary, unset any existing primary parent first
    if (data.isPrimary) {
      await prisma.studentParent.updateMany({
        where: { studentId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.studentParent.create({
      data: {
        studentId: id,
        parentId: data.parentId,
        relationship: data.relationship,
        isPrimary: data.isPrimary,
      },
      include: {
        parent: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  },

  async unlinkParent(id: string, parentId: string): Promise<void> {
    const link = await prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId: id, parentId } },
    });
    if (!link)
      throw createError('This parent is not linked to this student', 404);

    await prisma.studentParent.delete({
      where: { studentId_parentId: { studentId: id, parentId } },
    });
  },

  // Students by Class Arm
  async getStudentsByClassArm(
    classArmId: string,
    {
      page = 1,
      limit = 20,
      sessionId,
    }: PaginationQuery & { sessionId?: string },
  ): Promise<PaginatedResponse<StudentWithDetails>> {
    const session = await resolveSession(sessionId);
    const skip = (page - 1) * limit;

    const classArm = await prisma.classArm.findUnique({
      where: { id: classArmId },
    });
    if (!classArm) throw createError('Class arm not found', 404);

    const where: Prisma.StudentWhereInput = {
      isActive: true,
      enrollments: {
        some: { classArmId, sessionId: session.id, isActive: true },
      },
    };

    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { name: 'asc' } },
        include: studentInclude,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async promoteStudent(id: string, data: PromoteStudentInput) {
    const [student, session, classArm] = await Promise.all([
      prisma.student.findUnique({ where: { id } }),
      prisma.academicSession.findUnique({ where: { id: data.toSessionId } }),
      prisma.classArm.findUnique({ where: { id: data.toClassArmId } }),
    ]);

    if (!student) throw createError('Student not found', 404);
    if (!student.isActive)
      throw createError('Cannot promote an inactive student', 400);
    if (!session) throw createError('Target session not found', 404);
    if (!classArm) throw createError('Target class arm not found', 404);

    await prisma.$transaction((tx) =>
      deactivateAndAssign(tx, data.toSessionId, [
        {
          studentId: id,
          classArmId: data.toClassArmId,
          sessionId: data.toSessionId,
        },
      ]),
    );
    return prisma.studentEnrollment.findUnique({
      where: {
        studentId_sessionId: { studentId: id, sessionId: data.toSessionId },
      },
      include: enrollmentInclude,
    });
  },

  async batchPromote(data: BatchPromoteInput) {
    const studentIds = data.students.map((s) => s.studentId);
    const classArmIds = [...new Set(data.students.map((s) => s.toClassArmId))];

    const [session, students, classArms] = await Promise.all([
      prisma.academicSession.findUnique({ where: { id: data.toSessionId } }),
      prisma.student.findMany({ where: { id: { in: studentIds } } }),
      prisma.classArm.findMany({ where: { id: { in: classArmIds } } }),
    ]);

    if (!session) throw createError('Target session not found', 404);

    const foundStudentIds = new Set(students.map((s) => s.id));
    const missingStudent = studentIds.find((id) => !foundStudentIds.has(id));
    if (missingStudent)
      throw createError(`Student not found: ${missingStudent}`, 404);

    const inactiveStudent = students.find((s) => !s.isActive);
    if (inactiveStudent) {
      throw createError(
        `Cannot promote inactive student: ${inactiveStudent.id}`,
        400,
      );
    }

    const foundClassArmIds = new Set(classArms.map((c) => c.id));
    const missingClassArm = classArmIds.find((id) => !foundClassArmIds.has(id));
    if (missingClassArm)
      throw createError(`Class arm not found: ${missingClassArm}`, 404);

    const assignments: Assignment[] = data.students.map((s) => ({
      studentId: s.studentId,
      classArmId: s.toClassArmId,
      sessionId: data.toSessionId,
    }));

    await prisma.$transaction((tx) =>
      deactivateAndAssign(tx, data.toSessionId, assignments),
    );

    return { promotedCount: assignments.length };
  },
};

import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  AssignClassTeacherInput,
  AssignSubjectTeacherInput,
} from '../middlewares/teacher-assignment-validation.js';
import type {
  ClassArmTeacherWithDetails,
  SubjectTeacherWithDetails,
} from '../types/teacher-assignment.types.js';

// Helpers
const classArmTeacherInclude = {
  teacher: {
    select: { id: true, name: true, email: true, userRole: true },
  },
  classArm: {
    include: { arm: true, classLevel: true },
  },
  session: true,
};

const subjectTeacherInclude = {
  teacher: {
    select: { id: true, name: true, email: true, userRole: true },
  },
  subject: true,
  classArm: {
    include: { arm: true, classLevel: true },
  },
  session: true,
};

// Resolves active session - used across all assignments
const getActiveSession = async () => {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session)
    throw createError(
      'No active session found. Set an active session first.',
      400,
    );
  return session;
};

// Validates teacher exists and has teacher role
const validateTeacher = async (teacherId: string) => {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher) throw createError('Teacher not found', 404);
  if (teacher.userRole !== 'teacher') {
    throw createError('The specified user is not a teacher', 400);
  }
  return teacher;
};

// Validates class arm exists
const validateClassArm = async (classArmId: string) => {
  const classArm = await prisma.classArm.findUnique({
    where: { id: classArmId },
    include: { arm: true, classLevel: true },
  });
  if (!classArm) throw createError('Class arm not found', 404);
  return classArm;
};

// Teacher Assignment Service
export const teacherAssignmentService = {
  // Assign Class Teacher
  async assignClassTeacher(
    classArmId: string,
    data: AssignClassTeacherInput,
  ): Promise<ClassArmTeacherWithDetails> {
    const [session] = await Promise.all([
      getActiveSession(),
      validateClassArm(classArmId),
      validateTeacher(data.teacherId),
    ]);

    const existing = await prisma.classArmTeacher.findUnique({
      where: {
        classArmId_teacherId_sessionId: {
          classArmId,
          teacherId: data.teacherId,
          sessionId: session.id,
        },
      },
    });

    if (existing) {
      throw createError(
        'This teacher is already assigned to this class arm for the current session',
        409,
      );
    }

    return prisma.classArmTeacher.create({
      data: { classArmId, teacherId: data.teacherId, sessionId: session.id },
      include: classArmTeacherInclude,
    });
  },

  //   Get Class Teachers
  async getClassTeachers(
    classArmId: string,
  ): Promise<ClassArmTeacherWithDetails[]> {
    await validateClassArm(classArmId);
    const session = await getActiveSession();

    return prisma.classArmTeacher.findMany({
      where: { classArmId, sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      include: classArmTeacherInclude,
    });
  },

  //   Remove Class Teacher
  async removeClassTeacher(
    classArmId: string,
    teacherId: string,
  ): Promise<void> {
    await validateClassArm(classArmId);
    const session = await getActiveSession();

    const existing = await prisma.classArmTeacher.findUnique({
      where: {
        classArmId_teacherId_sessionId: {
          classArmId,
          teacherId,
          sessionId: session.id,
        },
      },
    });

    if (!existing)
      throw createError('This teacher is not assigned to this class arm', 404);

    await prisma.classArmTeacher.delete({
      where: {
        classArmId_teacherId_sessionId: {
          classArmId,
          teacherId,
          sessionId: session.id,
        },
      },
    });
  },

  // Assign subject teacher
  async assignSubjectTeacher(
    classArmId: string,
    subjectId: string,
    data: AssignSubjectTeacherInput,
  ): Promise<SubjectTeacherWithDetails> {
    const [session, classArm] = await Promise.all([
      getActiveSession(),
      validateClassArm(classArmId),
      validateTeacher(data.teacherId),
    ]);

    const subjectAssignment = await prisma.subjectAssignment.findUnique({
      where: {
        subjectId_classLevelId: {
          subjectId,
          classLevelId: classArm.classLevelId,
        },
      },
    });

    if (!subjectAssignment) {
      throw createError(
        'This subject is not assigned to the class level of this arm. Assign the subject to the class level first',
        400,
      );
    }

    const existing = await prisma.subjectTeacher.findUnique({
      where: {
        classArmId_subjectId_teacherId_sessionId: {
          classArmId,
          subjectId,
          teacherId: data.teacherId,
          sessionId: session.id,
        },
      },
    });

    if (existing) {
      throw createError(
        'This teacher is already assigned to this subject in this arm for the current session',
        409,
      );
    }

    return prisma.subjectTeacher.create({
      data: {
        classArmId,
        subjectId,
        teacherId: data.teacherId,
        sessionId: session.id,
      },
      include: subjectTeacherInclude,
    });
  },

  //   Remove subject teacher
  async removeSubjectTeacher(
    classArmId: string,
    subjectId: string,
    teacherId: string,
  ): Promise<void> {
    await validateClassArm(classArmId);
    const session = await getActiveSession();

    const existing = await prisma.subjectTeacher.findUnique({
      where: {
        classArmId_subjectId_teacherId_sessionId: {
          classArmId,
          subjectId,
          teacherId,
          sessionId: session.id,
        },
      },
    });

    if (!existing) {
      throw createError(
        'This teacher is not assigned to this subject in this arm',
        404,
      );
    }

    await prisma.subjectTeacher.delete({
      where: {
        classArmId_subjectId_teacherId_sessionId: {
          classArmId,
          subjectId,
          teacherId,
          sessionId: session.id,
        },
      },
    });
  },

  //   Get all teachers for a class arm
  async getArmTeachers(classArmId: string): Promise<{
    classTeachers: ClassArmTeacherWithDetails[];
    subjectTeachers: SubjectTeacherWithDetails[];
  }> {
    await validateClassArm(classArmId);
    const session = await getActiveSession();

    const [classTeachers, subjectTeachers] = await Promise.all([
      prisma.classArmTeacher.findMany({
        where: { classArmId, sessionId: session.id },
        orderBy: { createdAt: 'asc' },
        include: classArmTeacherInclude,
      }),
      prisma.subjectTeacher.findMany({
        where: { classArmId, sessionId: session.id },
        orderBy: { subject: { name: 'asc' } },
        include: subjectTeacherInclude,
      }),
    ]);

    return { classTeachers, subjectTeachers };
  },
};

import prisma from '../../../config/prisma.js';
import { getActiveSession, resolveSession } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import { assertHasClassArmAccess } from '../lib/utils.js';

interface ClassArmStudent {
  studentId: string;
  admissionNumber: string;
  name: string;
  photoUrl: string | null;
}

interface ClassArmSubject {
  subjectId: string;
  name: string;
  code: string;
}

export const teacherClassArmSubjectsService = {
  async getClassArmStudents(
    teacherId: string,
    classArmId: string,
    sessionId?: string,
  ): Promise<ClassArmStudent[]> {
    const session = await resolveSession(sessionId);

    await assertHasClassArmAccess(teacherId, classArmId, session.id);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classArmId,
        sessionId: session.id,
        isActive: true,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: {
        student: { user: { name: 'asc' } },
      },
    });

    return enrollments.map((enrollment) => ({
      studentId: enrollment.student.id,
      admissionNumber: enrollment.student.admissionNumber,
      name: enrollment.student.user.name,
      photoUrl: enrollment.student.photoUrl,
    }));
  },

  async getClassArmSubjects(
    teacherId: string,
    classArmId: string,
  ): Promise<ClassArmSubject[]> {
    const session = await getActiveSession();

    await assertHasClassArmAccess(teacherId, classArmId, session.id);

    const classArm = await prisma.classArm.findUnique({
      where: { id: classArmId },
      select: { classLevelId: true },
    });

    if (!classArm) throw createError('Class arm not found', 404);

    const assignments = await prisma.subjectAssignment.findMany({
      where: { classLevelId: classArm.classLevelId },
      select: {
        subject: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    return assignments.map((a) => ({
      subjectId: a.subject.id,
      name: a.subject.name,
      code: a.subject.code,
    }));
  },
};

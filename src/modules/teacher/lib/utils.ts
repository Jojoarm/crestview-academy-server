import type { Request } from 'express';
import { createError } from '../../../middlewares/error-handler.js';
import prisma from '../../../config/prisma.js';

export function requireTeacherId(req: Request): string {
  if (!req.teacherId) {
    throw createError(
      'Teacher context missing — is loadTeacherContext mounted on this route?',
      500,
    );
  }
  return req.teacherId;
}

export async function assertHasClassArmAccess(
  teacherId: string,
  classArmId: string,
  sessionId: string,
) {
  const [isClassTeacher, teachesSubjectHere] = await Promise.all([
    prisma.classArmTeacher.findUnique({
      where: {
        classArmId_teacherId_sessionId: { classArmId, teacherId, sessionId },
      },
    }),
    prisma.subjectTeacher.findFirst({
      where: { classArmId, teacherId, sessionId },
    }),
  ]);

  if (!isClassTeacher && !teachesSubjectHere) {
    throw createError(
      'You are not assigned to this class arm as class teacher or subject teacher',
      403,
    );
  }
}

export async function assertStudentEnrolled(
  studentId: string,
  classArmId: string,
  sessionId: string,
) {
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: { studentId, classArmId, sessionId, isActive: true },
  });

  if (!enrollment) {
    throw createError(
      'Student was not enrolled in this class arm for the given session',
      404,
    );
  }
}

export async function assertClassTeacher(
  teacherId: string,
  classArmId: string,
  sessionId: string,
) {
  const assignment = await prisma.classArmTeacher.findUnique({
    where: {
      classArmId_teacherId_sessionId: { classArmId, teacherId, sessionId },
    },
  });

  if (!assignment) {
    throw createError(
      'You are not the class teacher for this class arm in the given session',
      403,
    );
  }
}

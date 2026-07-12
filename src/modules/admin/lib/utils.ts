import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';

// Validates teacher exists and has teacher role
export const validateTeacher = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw createError('Teacher not found', 404);
  return teacher;
};

// Validates class arm exists
export const validateClassArm = async (classArmId: string) => {
  const classArm = await prisma.classArm.findUnique({
    where: { id: classArmId },
    include: { arm: true, classLevel: true },
  });
  if (!classArm) throw createError('Class arm not found', 404);
  return classArm;
};

export const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  userRole: true,
  banned: true,
  forcePasswordChange: true,
  createdAt: true,
  updatedAt: true,
  student: { select: { id: true, admissionNumber: true, isActive: true } },
  teacher: { select: { id: true, employeeId: true, isActive: true } },
  parent: { select: { id: true, isActive: true } },
  admin: { select: { id: true, isActive: true } },
};

import type { Request } from 'express';
import { createError } from '../../../middlewares/error-handler.js';
import prisma from '../../../config/prisma.js';

export function requireParentId(req: Request): string {
  if (!req.parentId) {
    throw createError('Parent context missing', 500);
  }
  return req.parentId;
}

export async function assertParentOfStudent(
  parentId: string,
  studentId: string,
) {
  const link = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId } },
  });

  if (!link) {
    throw createError('This student is not linked to your account', 403);
  }

  return link;
}

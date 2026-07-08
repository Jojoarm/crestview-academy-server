import prisma from '../config/prisma.js';
import { createError } from '../middlewares/error-handler.js';

export const getActiveSession = async () => {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session) throw createError('No active session found', 400);
  return session;
};

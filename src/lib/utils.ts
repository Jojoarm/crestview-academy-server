import prisma from '../config/prisma.js';
import { createError } from '../middlewares/error-handler.js';

export const getActiveSession = async () => {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session) throw createError('No active session found', 400);
  return session;
};

export async function getActiveSessionAndTerm() {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session) throw createError('No active session found', 400);

  const term = await prisma.term.findFirst({
    where: { sessionId: session.id, isActive: true },
  });
  if (!term) throw createError('No active term found', 400);

  return { session, term };
}

export const JS_DAY_TO_ENUM: Record<number, string | null> = {
  0: null,
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: null,
};

export function todayDateOnly(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function normalizeDate(dateInput: string): Date {
  const date = new Date(dateInput);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

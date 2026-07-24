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

export const activeSession = await prisma.academicSession.findFirst({
  where: { isActive: true },
});

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

// Resolves the session to use: the explicitly requested sessionId
// (validated to exist) or the currently active session if none was given.
export async function resolveSession(sessionId?: string) {
  if (sessionId) {
    const session = await prisma.academicSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw createError('Session not found', 404);
    return session;
  }

  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session) throw createError('No active academic session found', 400);
  return session;
}

export async function resolveTerm(sessionId: string, termId?: string) {
  if (termId) {
    const term = await prisma.term.findUnique({ where: { id: termId } });
    if (!term || term.sessionId !== sessionId) {
      throw createError('Invalid term for the given session', 400);
    }
    return term;
  }

  const term = await prisma.term.findFirst({
    where: { sessionId, isActive: true },
  });
  if (!term) {
    throw createError(
      'No active term for this session — please specify termId explicitly',
      400,
    );
  }
  return term;
}

import prisma from '../../../config/prisma.js';
import { resolveSession } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import { assertParentOfStudent } from '../lib/utils.js';

export async function getChildContext(
  parentId: string,
  studentId: string,
  sessionId?: string,
) {
  await assertParentOfStudent(parentId, studentId);

  const session = await resolveSession(sessionId);

  const enrollment = await prisma.studentEnrollment.findFirst({
    where: { studentId, sessionId: session.id, isActive: true },
    select: {
      classArmId: true,
      classArm: {
        select: {
          classLevel: { select: { id: true, name: true } },
          arm: { select: { name: true } },
        },
      },
    },
  });

  if (!enrollment) {
    throw createError(
      'This child was not enrolled in any class for the given session',
      404,
    );
  }

  return { session, enrollment };
}

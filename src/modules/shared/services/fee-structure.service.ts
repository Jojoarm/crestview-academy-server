import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSession } from '../../../lib/utils.js';

const feeStructureInclude = {
  feeType: true,
  classLevel: true,
  session: true,
  term: true,
};

export type FeeStructureQueryResult = Prisma.FeeStructureGetPayload<{
  include: typeof feeStructureInclude;
}>;

export async function getAllApplicableFees(classLevelId: string): Promise<{
  oneTime: FeeStructureQueryResult[];
  annual: FeeStructureQueryResult[];
  perTerm: FeeStructureQueryResult[];
}> {
  const session = await getActiveSession();

  const activeTerm = await prisma.term.findFirst({
    where: { sessionId: session.id, isActive: true },
  });

  const [oneTime, annual, perTerm] = await Promise.all([
    prisma.feeStructure.findMany({
      where: {
        isActive: true,
        feeType: { frequency: 'OneTime', isActive: true },
        OR: [{ classLevelId: null }, { classLevelId }],
      },
      include: feeStructureInclude,
    }),
    prisma.feeStructure.findMany({
      where: {
        isActive: true,
        sessionId: session.id,
        feeType: { frequency: 'Annual', isActive: true },
        OR: [{ classLevelId: null }, { classLevelId }],
      },
      include: feeStructureInclude,
    }),
    activeTerm
      ? prisma.feeStructure.findMany({
          where: {
            isActive: true,
            sessionId: session.id,
            termId: activeTerm.id,
            feeType: { frequency: 'PerTerm', isActive: true },
            OR: [{ classLevelId: null }, { classLevelId }],
          },
          include: feeStructureInclude,
        })
      : prisma.feeStructure.findMany({
          where: { id: 'none' },
          include: feeStructureInclude,
        }),
  ]);

  return { oneTime, annual, perTerm };
}

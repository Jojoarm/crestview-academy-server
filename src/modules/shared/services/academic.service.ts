import prisma from '../../../config/prisma.js';

interface TermSummary {
  id: string;
  name: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}

interface SessionSummary {
  id: string;
  name: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  terms: TermSummary[];
}

export const academicService = {
  async listSessions(): Promise<SessionSummary[]> {
    return prisma.academicSession.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        startDate: true,
        endDate: true,
        terms: {
          select: {
            id: true,
            name: true,
            isActive: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  },
};

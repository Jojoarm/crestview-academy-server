import { updateSession } from 'better-auth/api';
import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  CreateSessionInput,
  CreateTermInput,
  UpdateSessionInput,
  UpdateTermInput,
} from '../middlewares/session-validation.js';
import type { AcademicSessionWithTerms } from '../types/session.types.js';

export const sessionService = {
  // Create Session
  async createSession(data: CreateSessionInput) {
    const existing = await prisma.academicSession.findUnique({
      where: { name: data.name },
    });
    if (existing)
      throw createError('A session with this name already exists', 409);

    return prisma.academicSession.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      include: { terms: true },
    });
  },

  //   List All Sessions
  async listSessions({
    page = 1,
    limit = 20,
  }: PaginationQuery): Promise<PaginatedResponse<AcademicSessionWithTerms>> {
    const skip = (page - 1) * limit;

    const [sessions, total] = await prisma.$transaction([
      prisma.academicSession.findMany({
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          terms: {
            orderBy: { startDate: 'asc' },
          },
        },
      }),
      prisma.academicSession.count(),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get active session
  async getActiveSession() {
    const session = await prisma.academicSession.findFirst({
      where: { isActive: true },
      include: { terms: { orderBy: { startDate: 'asc' } } },
    });

    if (!session) throw createError('Now active session found', 404);

    return session;
  },

  //   Get session by id
  async getSessionById(id: string) {
    const session = await prisma.academicSession.findUnique({
      where: { id },
      include: { terms: { orderBy: { startDate: 'asc' } } },
    });

    if (!session) throw createError('Academic session not found', 404);

    return session;
  },

  async updateSession(id: string, data: UpdateSessionInput) {
    if (data.name) {
      const conflict = await prisma.academicSession.findFirst({
        where: { name: data.name, NOT: { id } },
      });

      if (conflict)
        throw createError('An academic session with this name already exists');

      return prisma.academicSession.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
        },
        include: { terms: { orderBy: { startDate: 'asc' } } },
      });
    }
  },

  //   Activate Session
  async activateSession(id: string) {
    const [, session] = await prisma.$transaction([
      prisma.academicSession.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      }),

      prisma.academicSession.update({
        where: { id },
        data: {
          isActive: true,
        },
        include: {
          terms: {
            orderBy: {
              startDate: 'asc',
            },
          },
        },
      }),
    ]);

    return session;
  },

  //   Delete Session
  async deleteSession(id: string) {
    const session = await sessionService.getSessionById(id);
    if (session.isActive)
      throw createError('Cannot delete the active session', 400);

    // Add linked-data guards here as other modules are built:
    // const feeCount = await prisma.feeStructure.count({ where: { sessionId: id } });
    // if (feeCount > 0) throw httpError("Session has linked fee structures", 400);

    await prisma.academicSession.delete({ where: { id } });
  },

  //   create term
  async createTerm(sessionId: string, data: CreateTermInput) {
    const existing = await prisma.term.findUnique({
      where: { sessionId_name: { sessionId, name: data.name } },
    });

    if (existing) {
      throw createError(
        `A ${data.name} term already exists for this session`,
        409,
      );
    }

    return prisma.term.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        sessionId,
      },
    });
  },

  //   update term
  async updateTerm(sessionId: string, termId: string, data: UpdateTermInput) {
    const term = await prisma.term.findFirst({
      where: { id: termId, sessionId },
    });

    if (!term) throw createError('Term not found', 404);

    return prisma.term.update({
      where: { id: termId },
      data: {
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
      },
    });
  },

  //   activate term
  async activateTerm(sessionId: string, termId: string) {
    const session = await sessionService.getSessionById(sessionId);

    if (!session.isActive) {
      throw createError(
        'Cannot activate a term in an inactive session. Activate the session first.',
        400,
      );
    }

    const term = await prisma.term.findFirst({
      where: { id: termId, sessionId },
    });

    if (!term) throw createError('Term not found', 404);

    const [, activated] = await prisma.$transaction([
      prisma.term.updateMany({
        where: { sessionId, isActive: true },
        data: { isActive: false },
      }),

      prisma.term.update({
        where: { id: termId },
        data: { isActive: true },
      }),
    ]);

    return activated;
  },

  //   delete term
  async deleteTerm(sessionId: string, termId: string) {
    const term = await prisma.term.findFirst({
      where: { id: termId, sessionId },
    });

    if (!term) throw createError('Term not found', 404);
    if (term.isActive) throw createError('Cannot delete the active term', 400);

    // Add linked-data guards here as other modules are built.

    await prisma.term.delete({ where: { id: termId } });
  },
};

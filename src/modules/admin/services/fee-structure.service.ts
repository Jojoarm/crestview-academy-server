// Helpers

import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  CreateFeeStructureInput,
  CreateFeeStructureItemInput,
  CreateFeeTypeInput,
  FeeStructureQuery,
  UpdateFeeStructureItemInput,
  UpdateFeeTypeInput,
} from '../middlewares/fee-structure-validation.js';
import type { FeeStructureWithSummary } from '../types/fee-structure.types.js';

const feeStructureInclude = {
  classLevel: true,
  term: true,
  session: true,
  items: {
    include: { feeType: true },
    orderBy: { feeType: { name: 'asc' as const } },
  },
};

type FeeStructureQueryResult = Prisma.FeeStructureGetPayload<{
  include: typeof feeStructureInclude;
}>;

const withTotalAmount = (
  structure: FeeStructureQueryResult,
): FeeStructureWithSummary => ({
  ...structure,
  totalAmount: structure.items.reduce(
    (sum, item) => sum.add(item.amount),
    new Prisma.Decimal(0),
  ),
});

const getActiveSession = async () => {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session)
    throw createError(
      'No active session found. Set an active session first.',
      400,
    );
  return session;
};

// Fee Type Service

export const feeService = {
  async createFeeType(data: CreateFeeTypeInput) {
    const existing = await prisma.feeType.findUnique({
      where: { name: data.name },
    });

    if (existing)
      throw createError('A fee type with this name already exists', 409);

    return prisma.feeType.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        isOptional: data.isOptional,
      },
    });
  },

  async listFeeTypes({ page = 1, limit = 20 }: PaginationQuery) {
    const skip = (page - 1) * limit;

    const [feeTypes, total] = await prisma.$transaction([
      prisma.feeType.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),

      prisma.feeType.count(),
    ]);

    return {
      data: feeTypes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateFeeType(id: string, data: UpdateFeeTypeInput) {
    const feeType = await prisma.feeType.findUnique({ where: { id } });
    if (!feeType) throw createError('Fee type not found', 404);

    if (data.name) {
      const conflict = await prisma.feeType.findFirst({
        where: { name: data.name, NOT: { id } },
      });

      if (conflict)
        throw createError('A fee type with this name already exists', 409);
    }

    return prisma.feeType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.isOptional !== undefined && { isOptional: data.isOptional }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  async deleteFeeType(id: string) {
    const feeType = await prisma.feeType.findUnique({ where: { id } });
    if (!feeType) throw createError('Fee type not found', 404);

    const usageCount = await prisma.feeStructureItem.count({
      where: { feeTypeId: id },
    });

    if (usageCount > 0) {
      throw createError(
        'Cannot delete a fee type that is used in one or more fee structures. Remove it from all structures first',
        400,
      );
    }

    await prisma.feeType.delete({ where: { id } });
  },

  //   Fee Structure Service

  async createFeeStructure(
    data: CreateFeeStructureInput,
  ): Promise<FeeStructureWithSummary> {
    const session = await getActiveSession();

    const [classLevel, term] = await Promise.all([
      prisma.classLevel.findUnique({ where: { id: data.classLevelId } }),
      prisma.term.findUnique({ where: { id: data.termId } }),
    ]);

    if (!classLevel) throw createError('Class level not found', 404);
    if (!term) throw createError('Term not found', 404);

    // Ensure term belongs to active session
    if (term.sessionId !== session.id) {
      throw createError(
        'The selected term does not belong to the active session',
        400,
      );
    }

    const existing = await prisma.feeStructure.findUnique({
      where: {
        classLevelId_termId_sessionId: {
          classLevelId: data.classLevelId,
          termId: data.termId,
          sessionId: session.id,
        },
      },
    });

    if (existing) {
      throw createError(
        'A fee structure already exists for this class and term in the current session',
        409,
      );
    }

    const structure = await prisma.feeStructure.create({
      data: {
        classLevelId: data.classLevelId,
        termId: data.termId,
        sessionId: session.id,
      },
      include: feeStructureInclude,
    });

    return withTotalAmount(structure);
  },

  async listFeeStructures(
    { page = 1, limit = 20 }: PaginationQuery,
    query: FeeStructureQuery,
  ): Promise<PaginatedResponse<FeeStructureWithSummary>> {
    const skip = (page - 1) * limit;

    const where = {
      ...(query.classLevelId && { classLevelId: query.classLevelId }),
      ...(query.termId && { termId: query.termId }),
      ...(query.sessionId && { sessionId: query.sessionId }),
    };

    const [structures, total] = await prisma.$transaction([
      prisma.feeStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: feeStructureInclude,
      }),
      prisma.feeStructure.count({ where }),
    ]);

    return {
      data: structures.map(withTotalAmount),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getFeeStructureById(id: string): Promise<FeeStructureWithSummary> {
    const structure = await prisma.feeStructure.findUnique({
      where: { id },
      include: feeStructureInclude,
    });
    if (!structure) throw createError('Fee structure not found', 404);
    return withTotalAmount(structure);
  },

  async deleteFeeStructure(id: string) {
    const structure = await prisma.feeStructure.findUnique({ where: { id } });
    if (!structure) throw createError('Fee structure not found', 404);

    // Guard: no payments linked (add when payment module is built)
    // const paymentCount = await prisma.payment.count({ where: { feeStructureId: id } });
    // if (paymentCount > 0) throw createError('Cannot delete a fee structure with recorded payments', 400);

    await prisma.feeStructure.delete({ where: { id } });
  },

  //   Fee structure Item Services
  async addFeeStructureItem(
    feeStructureId: string,
    data: CreateFeeStructureItemInput,
  ): Promise<FeeStructureWithSummary> {
    const structure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
    });
    if (!structure) throw createError('Fee structure not found', 404);

    const feeType = await prisma.feeType.findUnique({
      where: { id: data.feeTypeId },
    });

    if (!feeType) throw createError('Fee type not found', 404);
    if (!feeType.isActive)
      throw createError('Cannot add an inactive fee type', 400);

    const existing = await prisma.feeStructureItem.findUnique({
      where: {
        feeStructureId_feeTypeId: { feeStructureId, feeTypeId: data.feeTypeId },
      },
    });

    if (existing) {
      throw createError(
        'This fee type is already added to this fee structure',
        409,
      );
    }

    await prisma.feeStructureItem.create({
      data: {
        feeStructureId,
        feeTypeId: data.feeTypeId,
        amount: new Prisma.Decimal(data.amount),
      },
    });

    // Return the full updated structure
    return feeService.getFeeStructureById(feeStructureId);
  },

  async updateFeeStructureItem(
    feeStructureId: string,
    itemId: string,
    data: UpdateFeeStructureItemInput,
  ): Promise<FeeStructureWithSummary> {
    const item = await prisma.feeStructureItem.findFirst({
      where: { id: itemId, feeStructureId },
    });

    if (!item) throw createError('Fee structure item not found', 404);

    await prisma.feeStructureItem.update({
      where: { id: itemId },
      data: { amount: new Prisma.Decimal(data.amount) },
    });

    return feeService.getFeeStructureById(feeStructureId);
  },

  async removeFeeStructureItem(
    feeStructureId: string,
    itemId: string,
  ): Promise<FeeStructureWithSummary> {
    const item = await prisma.feeStructureItem.findFirst({
      where: { id: itemId, feeStructureId },
    });
    if (!item) throw createError('Fee structure item not found', 404);

    // Guard: no payments linked to this item (add when payment module is built)

    await prisma.feeStructureItem.delete({ where: { id: itemId } });

    return feeService.getFeeStructureById(feeStructureId);
  },
};

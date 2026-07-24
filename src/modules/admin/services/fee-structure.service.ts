import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  CreateFeeTypeInput,
  UpdateFeeTypeInput,
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
  FeeStructureQuery,
} from '../middlewares/fee-structure-validation.js';
import type { FeeTypeWithStructures } from '../types/fee-structure.types.js';

// Helpers

const feeStructureInclude = {
  feeType: true,
  classLevel: true,
  session: true,
  term: true,
};

type FeeStructureQueryResult = Prisma.FeeStructureGetPayload<{
  include: typeof feeStructureInclude;
}>;

// Uniqueness check (enforced in service since constraints are conditional)

const checkDuplicate = async (
  data: CreateFeeStructureInput,
  feeType: { frequency: string; scope: string },
  excludeId?: string,
) => {
  const where: Record<string, any> = { feeTypeId: data.feeTypeId };

  if (feeType.scope === 'PerClass') where.classLevelId = data.classLevelId;
  if (feeType.frequency !== 'OneTime') where.sessionId = data.sessionId;
  if (feeType.frequency === 'PerTerm') where.termId = data.termId;
  if (excludeId) where.NOT = { id: excludeId };

  return prisma.feeStructure.findFirst({ where });
};

//  Fee Type Service

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
        frequency: data.frequency,
        scope: data.scope,
        isOptional: data.isOptional,
      },
    });
  },

  async listFeeTypes({
    page = 1,
    limit = 50,
  }: PaginationQuery): Promise<PaginatedResponse<FeeTypeWithStructures>> {
    const skip = (page - 1) * limit;

    const [feeTypes, total] = await prisma.$transaction([
      prisma.feeType.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          feeStructures: {
            include: { classLevel: true, session: true, term: true },
          },
        },
      }),
      prisma.feeType.count(),
    ]);

    return {
      data: feeTypes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getFeeTypeById(id: string): Promise<FeeTypeWithStructures> {
    const feeType = await prisma.feeType.findUnique({
      where: { id },
      include: {
        feeStructures: {
          include: { classLevel: true, session: true, term: true },
        },
      },
    });
    if (!feeType) throw createError('Fee type not found', 404);
    return feeType;
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

    const newFrequency = data.frequency ?? feeType.frequency;
    const newScope = data.scope ?? feeType.scope;

    const frequencyChanged =
      data.frequency && data.frequency !== feeType.frequency;
    const scopeChanged = data.scope && data.scope !== feeType.scope;

    // If frequency or scope changed, clean up existing structures
    // that have fields which no longer make sense
    if (frequencyChanged || scopeChanged) {
      const nullifyData: Record<string, null> = {};

      if (newScope === 'SchoolWide') nullifyData.classLevelId = null;
      if (newFrequency === 'OneTime') {
        nullifyData.sessionId = null;
        nullifyData.termId = null;
      }
      if (newFrequency === 'Annual') nullifyData.termId = null;

      if (Object.keys(nullifyData).length > 0) {
        await prisma.feeStructure.updateMany({
          where: { feeTypeId: id },
          data: nullifyData,
        });
      }
    }

    return prisma.feeType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.scope && { scope: data.scope }),
        ...(data.isOptional !== undefined && { isOptional: data.isOptional }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  },

  async deleteFeeType(id: string) {
    const feeType = await prisma.feeType.findUnique({ where: { id } });
    if (!feeType) throw createError('Fee type not found', 404);

    const usageCount = await prisma.feeStructure.count({
      where: { feeTypeId: id },
    });
    if (usageCount > 0) {
      throw createError(
        'Cannot delete a fee type that has fee structures. Remove all structures first.',
        400,
      );
    }

    await prisma.feeType.delete({ where: { id } });
  },

  // Fee Structure Service

  async createFeeStructure(
    data: CreateFeeStructureInput,
  ): Promise<FeeStructureQueryResult> {
    const feeType = await prisma.feeType.findUnique({
      where: { id: data.feeTypeId },
    });
    if (!feeType) throw createError('Fee type not found', 404);
    if (!feeType.isActive)
      throw createError(
        'Cannot create a structure for an inactive fee type',
        400,
      );

    // Validate required fields based on frequency + scope

    if (feeType.scope === 'PerClass') {
      if (!data.classLevelId)
        throw createError(
          'Class level is required for PerClass fee types',
          400,
        );
      const classLevel = await prisma.classLevel.findUnique({
        where: { id: data.classLevelId },
      });
      if (!classLevel) throw createError('Class level not found', 404);
    }

    if (feeType.frequency !== 'OneTime') {
      if (!data.sessionId)
        throw createError(
          'Session is required for Annual and PerTerm fee types',
          400,
        );
      const session = await prisma.academicSession.findUnique({
        where: { id: data.sessionId },
      });
      if (!session) throw createError('Session not found', 404);
    }

    if (feeType.frequency === 'PerTerm') {
      if (!data.termId)
        throw createError('Term is required for PerTerm fee types', 400);
      const term = await prisma.term.findUnique({ where: { id: data.termId } });
      if (!term) throw createError('Term not found', 404);

      // Ensure term belongs to the specified session
      if (data.sessionId && term.sessionId !== data.sessionId) {
        throw createError(
          'The selected term does not belong to the specified session',
          400,
        );
      }
    }

    // Duplicate check
    const duplicate = await checkDuplicate(data, feeType);
    if (duplicate) {
      throw createError(
        'A fee structure already exists for this fee type with the same class/session/term combination',
        409,
      );
    }

    return prisma.feeStructure.create({
      data: {
        feeTypeId: data.feeTypeId,
        amount: new Prisma.Decimal(data.amount),
        classLevelId:
          feeType.scope === 'PerClass' ? (data.classLevelId ?? null) : null,
        sessionId:
          feeType.frequency !== 'OneTime' ? (data.sessionId ?? null) : null,
        termId: feeType.frequency === 'PerTerm' ? (data.termId ?? null) : null,
      },
      include: feeStructureInclude,
    });
  },

  async listFeeStructures(
    { page = 1, limit = 400 }: PaginationQuery,
    query: FeeStructureQuery,
  ): Promise<PaginatedResponse<FeeStructureQueryResult>> {
    const skip = (page - 1) * limit;

    const where = {
      ...(query.feeTypeId && { feeTypeId: query.feeTypeId }),
      ...(query.classLevelId && { classLevelId: query.classLevelId }),
      ...(query.sessionId && { sessionId: query.sessionId }),
      ...(query.termId && { termId: query.termId }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.frequency && { feeType: { frequency: query.frequency } }),
      ...(query.scope && { feeType: { scope: query.scope } }),
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
      data: structures,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getAllFeeStructures(query: FeeStructureQuery) {
    return prisma.feeStructure.findMany({
      where: {
        ...(query.feeTypeId && { feeTypeId: query.feeTypeId }),
        ...(query.classLevelId && { classLevelId: query.classLevelId }),
        ...(query.sessionId && { sessionId: query.sessionId }),
        ...(query.termId && { termId: query.termId }),
        ...(query.frequency && { feeType: { frequency: query.frequency } }),
        ...(query.scope && { feeType: { scope: query.scope } }),
        ...(query.isActive !== undefined && { isActive: query.isActive }),
      },
      orderBy: [
        { feeType: { frequency: 'asc' } },
        { feeType: { name: 'asc' } },
      ],
      include: feeStructureInclude,
    });
  },

  async getFeeStructureById(id: string): Promise<FeeStructureQueryResult> {
    const structure = await prisma.feeStructure.findUnique({
      where: { id },
      include: feeStructureInclude,
    });
    if (!structure) throw createError('Fee structure not found', 404);
    return structure;
  },

  async updateFeeStructure(
    id: string,
    data: UpdateFeeStructureInput,
  ): Promise<FeeStructureQueryResult> {
    await feeService.getFeeStructureById(id);

    return prisma.feeStructure.update({
      where: { id },
      data: { amount: new Prisma.Decimal(data.amount) },
      include: feeStructureInclude,
    });
  },

  async deleteFeeStructure(id: string): Promise<void> {
    await feeService.getFeeStructureById(id);

    // Guard: no payments linked (add when payment module is built)
    // const paymentCount = await prisma.payment.count({ where: { feeStructureId: id } });
    // if (paymentCount > 0) throw createError('Cannot delete a fee structure with recorded payments', 400);

    await prisma.feeStructure.delete({ where: { id } });
  },
};

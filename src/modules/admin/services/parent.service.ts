import prisma from '../../../config/prisma.js';
import type {
  PaginationQuery,
  PaginatedResponse,
} from '../../../types/common.types.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  ParentQuery,
  UpdateParentInput,
} from '../middlewares/parent-validation.js';

// Includes

const parentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      banned: true,
      createdAt: true,
    },
  },
  students: {
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          enrollments: {
            where: { session: { isActive: true }, isActive: true },
            include: { classArm: { include: { arm: true, classLevel: true } } },
            take: 1,
          },
        },
      },
    },
  },
} as const;

type ParentWithDetails = Prisma.ParentGetPayload<{
  include: typeof parentInclude;
}>;

// Parent Service

export const parentService = {
  async listParents(
    { page = 1, limit = 20 }: PaginationQuery,
    query: ParentQuery,
  ): Promise<PaginatedResponse<ParentWithDetails>> {
    const skip = (page - 1) * limit;

    const where: Prisma.ParentWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        user: {
          name: { contains: query.search, mode: 'insensitive' as const },
        },
      }),
    };

    const [parents, total] = await prisma.$transaction([
      prisma.parent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { name: 'asc' } },
        include: parentInclude,
      }),
      prisma.parent.count({ where }),
    ]);

    return {
      data: parents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getParentById(id: string): Promise<ParentWithDetails> {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: parentInclude,
    });
    if (!parent) throw createError('Parent not found', 404);
    return parent;
  },

  async getParentByUserId(userId: string): Promise<ParentWithDetails> {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: parentInclude,
    });
    if (!parent) throw createError('Parent not found', 404);
    return parent;
  },

  async updateParent(
    id: string,
    data: UpdateParentInput,
  ): Promise<ParentWithDetails> {
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) throw createError('Parent not found', 404);

    return prisma.parent.update({
      where: { id },
      data: {
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
        ...(data.occupation !== undefined && {
          occupation: data.occupation ?? null,
        }),
      },
      include: parentInclude,
    });
  },

  async deactivateParent(id: string): Promise<void> {
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) throw createError('Parent not found', 404);

    await prisma.$transaction([
      prisma.parent.update({ where: { id }, data: { isActive: false } }),
      prisma.user.update({
        where: { id: parent.userId },
        data: { banned: true },
      }),
    ]);
  },
};

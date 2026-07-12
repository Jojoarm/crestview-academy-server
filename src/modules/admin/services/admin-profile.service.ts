import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  AdminQuery,
  UpdateAdminInput,
} from '../middlewares/admin-profile-validation.js';

// Includes

const adminInclude = {
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
} as const;

type AdminWithUser = Prisma.AdminGetPayload<{ include: typeof adminInclude }>;

// Admin Profile Service

export const adminProfileService = {
  async listAdmins(
    { page = 1, limit = 20 }: PaginationQuery,
    query: AdminQuery,
  ): Promise<PaginatedResponse<AdminWithUser>> {
    const skip = (page - 1) * limit;

    const where: Prisma.AdminWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        user: {
          name: { contains: query.search, mode: 'insensitive' as const },
        },
      }),
    };

    const [admins, total] = await prisma.$transaction([
      prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { name: 'asc' } },
        include: adminInclude,
      }),
      prisma.admin.count({ where }),
    ]);

    return {
      data: admins,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getAdminById(id: string): Promise<AdminWithUser> {
    const admin = await prisma.admin.findUnique({
      where: { id },
      include: adminInclude,
    });
    if (!admin) throw createError('Admin not found', 404);
    return admin;
  },

  async getAdminByUserId(userId: string): Promise<AdminWithUser> {
    const admin = await prisma.admin.findUnique({
      where: { userId },
      include: adminInclude,
    });
    if (!admin) throw createError('Admin not found', 404);
    return admin;
  },

  async updateAdmin(
    id: string,
    data: UpdateAdminInput,
  ): Promise<AdminWithUser> {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) throw createError('Admin not found', 404);

    return prisma.admin.update({
      where: { id },
      data: {
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl ?? null }),
      },
      include: adminInclude,
    });
  },
};

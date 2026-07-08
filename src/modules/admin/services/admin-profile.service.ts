import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { createError } from '../../../middlewares/error-handler.js';
import type { UpdateAdminInput } from '../middlewares/admin-profile-validation.js';

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

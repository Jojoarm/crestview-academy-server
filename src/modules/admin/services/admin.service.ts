import prisma from '../../../config/prisma.js';
import { AdminRole } from '../../../generated/prisma/enums.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  AdminWithUser,
  CreateAdminInput,
  UpdateAdminInput,
} from '../types/admin.types.js';

export const getAllAdmins = async ({
  page = 1,
  limit = 20,
}: PaginationQuery): Promise<PaginatedResponse<AdminWithUser>> => {
  const skip = (page - 1) * limit;

  const [admins, total] = await prisma.$transaction([
    prisma.admin.findMany({
      skip,
      take: limit,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.admin.count(),
  ]);

  return {
    data: admins,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get a single admin by their userId
export const getAdminByUserId = async (
  userId: string,
): Promise<AdminWithUser | null> => {
  return prisma.admin.findUnique({
    where: { userId },
    include: { user: true },
  });
};

// Get a single admin by their admin Id
export const getAdminById = async (
  id: string,
): Promise<AdminWithUser | null> => {
  return prisma.admin.findUnique({
    where: { id },
    include: { user: true },
  });
};

// Create a new admin — creates the User record first, then the Admin record
// This is used by SUPER_ADMIN to invite a new admin by email
export const createAdmin = async (
  input: CreateAdminInput,
): Promise<AdminWithUser> => {
  return prisma.$transaction(async (tx) => {
    // Upsert the user — if they already have a User record
    // just link the Admin to that existing user
    const user = await tx.user.upsert({
      where: { email: input.email },
      update: {},
      create: {
        email: input.email,
        name: input.name,
        emailVerified: false,
      },
    });

    const admin = await tx.admin.create({
      data: {
        userId: user.id,
        role: input.role ?? AdminRole.ADMIN,
      },
      include: { user: true },
    });

    return admin;
  });
};

// Update an existing admin's role or active status
export const updateAdmin = async (
  id: string,
  input: UpdateAdminInput,
): Promise<AdminWithUser> => {
  return prisma.admin.update({
    where: { id },
    data: {
      ...(input.role !== undefined && { role: input.role }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.name !== undefined && {
        user: { update: { name: input.name } },
      }),
    },
    include: { user: true },
  });
};

// soft deactivate an admin
export const deactivateAdmin = async (id: string): Promise<AdminWithUser> => {
  return prisma.admin.update({
    where: { id },
    data: { isActive: false },
    include: { user: true },
  });
};

// Hard delete — only use when absolutely necessary
export const deleteAdmin = async (id: string): Promise<void> => {
  await prisma.admin.delete({ where: { id } });
};

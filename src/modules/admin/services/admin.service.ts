import type { IncomingHttpHeaders } from 'node:http';
import prisma from '../../../config/prisma.js';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '../../../types/common.types.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  ManagedUser,
} from '../types/admin.types.js';
import { auth } from '../../../config/better.auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { sendInviteEmail } from '../../../utils/mailer.js';
import { convertRole } from '../../../utils/convert-role.js';
import type { UserRole } from '../../../generated/prisma/enums.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  userRole: true,
  banned: true,
  forcePasswordChange: true,
  createdAt: true,
  updatedAt: true,
};

// Get all users (optionally filter by role)
export const getAllUsers = async (
  { page = 1, limit = 20 }: PaginationQuery,
  userRole?: UserRole,
): Promise<PaginatedResponse<ManagedUser>> => {
  const skip = (page - 1) * limit;
  const where = userRole ? { userRole } : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// get a user by id
export const getUserById = async (id: string): Promise<ManagedUser | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

// Create a user (any role) via Better Auth admin plugin
export const createUser = async (
  input: CreateUserInput,
  headers: IncomingHttpHeaders,
): Promise<ManagedUser> => {
  // Better auth creates the user + hashes the password
  const result = await auth.api.createUser({
    body: {
      email: input.email,
      password: input.temporaryPassword,
      name: input.name,
      // better auth uses two roles: user or admin
      role: convertRole(input.userRole),
    },
    headers: fromNodeHeaders(headers),
  });

  // Flag for forced password change on first login
  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: {
      userRole: input.userRole,
      forcePasswordChange: true,
    },
  });

  // Send invite email with temporary credentials
  await sendInviteEmail({
    to: input.email,
    name: input.name,
    temporaryPassword: input.temporaryPassword,
  });

  return user;
};

// Update user name or role
export const updateUser = async (
  id: string,
  input: UpdateUserInput,
  headers: IncomingHttpHeaders,
): Promise<ManagedUser> => {
  // Update Better Auth role only if admin privileges changed
  if (input.userRole) {
    await auth.api.setRole({
      body: {
        userId: id,
        role: convertRole(input.userRole),
      },
      headers: fromNodeHeaders(headers),
    });
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.userRole && { userRole: input.userRole }),
    },
    select: userSelect,
  });
};

// Ban a user
export const banUser = async (
  id: string,
  reason: string,
  headers: IncomingHttpHeaders,
): Promise<void> => {
  await auth.api.banUser({
    body: { userId: id, banReason: reason },
    headers: fromNodeHeaders(headers),
  });
};

// Hard delete
export const deleteUser = async (
  id: string,
  headers: IncomingHttpHeaders,
): Promise<void> => {
  await auth.api.removeUser({
    body: { userId: id },
    headers: fromNodeHeaders(headers),
  });
};

// clear forcePasswordChange after user sets own password
export const clearForcePasswordChange = async (
  userId: string,
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { forcePasswordChange: false },
  });
};

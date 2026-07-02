import prisma from '../../../config/prisma.js';
import type { ManagedUser } from '../../../types/common.types.js';

// helper
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

// clear forcePasswordChange after user sets own password
export const clearForcePasswordChange = async (
  userId: string,
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { forcePasswordChange: false },
  });
};

// get a user by id
export const getUserById = async (id: string): Promise<ManagedUser | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

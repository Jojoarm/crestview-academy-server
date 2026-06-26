import type { UserRole } from '../../../generated/prisma/enums.js';

export type CreateUserInput = {
  email: string;
  name: string;
  temporaryPassword: string;
  userRole: UserRole;
};

export type UpdateUserInput = {
  name?: string;
  userRole?: UserRole;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  userRole: UserRole | null;
  banned: boolean | null;
  forcePasswordChange: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

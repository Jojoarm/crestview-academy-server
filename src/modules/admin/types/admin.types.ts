import type {
  Admin,
  AdminRole,
  User,
} from '../../../generated/prisma/client.js';

export type AdminWithUser = Admin & {
  user: User;
};

export type CreateAdminInput = {
  email: string;
  name: string;
  role?: AdminRole;
};

export type UpdateAdminInput = {
  name?: string;
  role?: AdminRole;
  isActive?: boolean;
};

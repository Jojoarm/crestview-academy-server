import type { UserRole } from '../generated/prisma/enums.js';

export type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

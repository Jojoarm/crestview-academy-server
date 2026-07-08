import type {
  Admin,
  Parent,
  Student,
  Teacher,
  UserRole,
} from '../../../generated/prisma/client.js';

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
  // role record — only one will be non-null depending on userRole
  student: Pick<Student, 'id' | 'admissionNumber' | 'isActive'> | null;
  teacher: Pick<Teacher, 'id' | 'employeeId' | 'isActive'> | null;
  parent: Pick<Parent, 'id' | 'isActive'> | null;
  admin: Pick<Admin, 'id' | 'isActive'> | null;
};

import type { UserRole } from '../generated/prisma/enums.js';

export const convertRole = (userRole: UserRole): 'admin' | 'user' => {
  switch (userRole) {
    case 'admin':
    case 'super_admin':
      return 'admin';

    case 'teacher':
    case 'parent':
    case 'student':
    default:
      return 'user';
  }
};

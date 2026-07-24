import type { Prisma } from '../../../generated/prisma/client.js';

export const parentInclude = {
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
};

export type ParentWithUser = Prisma.ParentGetPayload<{
  include: typeof parentInclude;
}>;

export interface ChildSummary {
  studentId: string;
  admissionNumber: string;
  name: string;
  photoUrl: string | null;
  relationship: string;
  isPrimary: boolean;
  currentClass: { classLevel: string; arm: string } | null;
}

export interface ChildProfile extends ChildSummary {
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  bloodGroup: string | null;
  genotype: string | null;
  medicalConditions: string | null;
}

import type { Prisma } from '../../../generated/prisma/client.js';

export type ClassLevelWithArms = Prisma.ClassLevelGetPayload<{
  include: {
    classArms: {
      include: {
        arm: true;
      };
    };
  };
}>;

export type ClassArmWithDetails = Prisma.ClassArmGetPayload<{
  include: {
    arm: true;
    classLevel: true;
  };
}>;

// Derived type with computed totalCapacity field
export type ClassLevelWithSummary = ClassLevelWithArms & {
  totalCapacity: number;
};

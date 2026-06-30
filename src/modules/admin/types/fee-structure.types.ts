import type { Prisma } from '../../../generated/prisma/client.js';

export type FeeStructureWithItems = Prisma.FeeStructureGetPayload<{
  include: {
    classLevel: true;
    term: true;
    session: true;
    items: {
      include: {
        feeType: true;
      };
    };
  };
}>;

export type FeeStructureWithSummary = FeeStructureWithItems & {
  totalAmount: Prisma.Decimal;
};

export type FeeStructureWithDetails = Prisma.FeeStructureItemGetPayload<{
  include: {
    feeType: true;
    feeStructure: {
      include: {
        classLevel: true;
        term: true;
        session: true;
      };
    };
  };
}>;

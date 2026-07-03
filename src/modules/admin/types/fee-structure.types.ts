import { Prisma } from '../../../generated/prisma/client.js';

export type FeeTypeWithStructures = Prisma.FeeTypeGetPayload<{
  include: {
    feeStructures: {
      include: {
        classLevel: true;
        session: true;
        term: true;
      };
    };
  };
}>;

import { Prisma } from '../../../generated/prisma/client.js';

export type AcademicSessionWithTerms = Prisma.AcademicSessionGetPayload<{
  include: {
    terms: true;
  };
}>;

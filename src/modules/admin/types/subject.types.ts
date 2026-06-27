import type { Prisma } from '../../../generated/prisma/client.js';

export type SubjectWithAssignments = Prisma.SubjectGetPayload<{
  include: {
    classAssignments: {
      include: {
        classLevel: true;
      };
    };
  };
}>;

export type SubjectAssignmentWithDetails = Prisma.SubjectAssignmentGetPayload<{
  include: {
    subject: true;
    classLevel: true;
  };
}>;

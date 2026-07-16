import type { Prisma } from '../../../generated/prisma/client.js';

export const assignmentInclude = {
  classArm: {
    include: {
      classLevel: true,
      arm: true,
    },
  },
  subject: true,
  teacher: {
    include: { user: { select: { id: true, name: true } } },
  },
  session: true,
  term: true,
  _count: {
    select: { submissions: true },
  },
} satisfies Prisma.AssignmentInclude;

export type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: typeof assignmentInclude;
}>;

export const submissionInclude = {
  student: {
    include: {
      user: { select: { id: true, name: true } },
    },
  },
  gradedBy: {
    include: { user: { select: { id: true, name: true } } },
  },
} satisfies Prisma.AssignmentSubmissionInclude;

export type SubmissionWithRelations = Prisma.AssignmentSubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

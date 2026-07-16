import type { Prisma } from '../../../generated/prisma/client.js';

export const attendanceInclude = {
  student: {
    include: {
      user: { select: { id: true, name: true } },
    },
  },
  classArm: {
    include: {
      classLevel: true,
      arm: true,
    },
  },
  markedBy: {
    include: {
      user: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.AttendanceInclude;

export type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: typeof attendanceInclude;
}>;

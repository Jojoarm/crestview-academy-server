import type { Prisma } from '../../../generated/prisma/client.js';

export type TimetableEntryWithDetails = Prisma.TimetableEntryGetPayload<{
  include: {
    periodSlot: true;
    subject: true;
    classArm: {
      include: {
        arm: true;
        classLevel: true;
      };
    };
    session: true;
  };
}>;

export type PeriodSlotType = Prisma.PeriodSlotGetPayload<{}>;

// Grouped shape returned by getTimetable: day -> ordered list of entries
export type GroupedTimetable = Record<string, TimetableEntryWithDetails[]>;

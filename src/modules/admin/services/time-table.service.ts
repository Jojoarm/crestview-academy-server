import prisma from '../../../config/prisma.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  CreatePeriodSlotInput,
  CreateTimetableEntryInput,
  PeriodSlotQuery,
  UpdatePeriodSlotInput,
  UpdateTimetableEntryInput,
} from '../middlewares/time-table-validation.js';
import type {
  GroupedTimetable,
  TimetableEntryWithDetails,
} from '../types/time-table.types.js';

// Helpers
const timetableEntryInclude = {
  periodSlot: true,
  subject: true,
  classArm: { include: { arm: true, classLevel: true } },
  session: true,
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getActiveSession = async () => {
  const session = await prisma.academicSession.findFirst({
    where: { isActive: true },
  });
  if (!session)
    throw createError(
      'No active session found. Set an active session first.',
      400,
    );
  return session;
};

const validateClassArm = async (classArmId: string) => {
  const classArm = await prisma.classArm.findUnique({
    where: { id: classArmId },
    include: { classLevel: true },
  });
  if (!classArm) throw createError('Class arm not found', 404);
  return classArm;
};

// Timetable Service

export const timetableService = {
  // Period slot service
  async createPeriodSlot(data: CreatePeriodSlotInput) {
    const orderConflict = await prisma.periodSlot.findUnique({
      where: { section_order: { section: data.section, order: data.order } },
    });

    if (orderConflict) {
      throw createError(
        `A period slot already exists at order ${data.order} for this section`,
        409,
      );
    }

    return prisma.periodSlot.create({
      data: {
        section: data.section,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        order: data.order,
        isBreak: data.isBreak,
      },
    });
  },

  async listPeriodSlots(query: PeriodSlotQuery) {
    return prisma.periodSlot.findMany({
      where: { section: query.section },
      orderBy: { order: 'asc' },
    });
  },

  async updatePeriodSlot(id: string, data: UpdatePeriodSlotInput) {
    const slot = await prisma.periodSlot.findUnique({ where: { id } });
    if (!slot) throw createError('Period slot not found', 404);

    if (data.order !== undefined && data.order !== slot.order) {
      const orderConflict = await prisma.periodSlot.findUnique({
        where: { section_order: { section: slot.section, order: data.order } },
      });
      if (orderConflict) {
        throw createError(
          `A period slot already exists at order ${data.order} for this section`,
          409,
        );
      }
    }

    return prisma.periodSlot.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isBreak !== undefined && { isBreak: data.isBreak }),
      },
    });
  },

  async deletePeriodSlot(id: string) {
    const slot = await prisma.periodSlot.findUnique({ where: { id } });
    if (!slot) throw createError('Period slot not found', 404);

    const usageCount = await prisma.timetableEntry.count({
      where: { periodSlotId: id },
    });
    if (usageCount > 0) {
      throw createError(
        'Cannot delete a period slot that has timetable entries. Remove those entries first.',
        400,
      );
    }

    await prisma.periodSlot.delete({ where: { id } });
  },

  //   Timetable Entry Service
  async createTimetableEntry(
    classArmId: string,
    data: CreateTimetableEntryInput,
  ): Promise<TimetableEntryWithDetails> {
    const [session, classArm] = await Promise.all([
      getActiveSession(),
      validateClassArm(classArmId),
    ]);

    const periodSlot = await prisma.periodSlot.findUnique({
      where: { id: data.periodSlotId },
    });
    if (!periodSlot) throw createError('Period slot not found', 404);

    if (periodSlot.section !== classArm.classLevel.section) {
      throw createError(
        'This period slot belongs to a different section than this class arm',
        400,
      );
    }

    // Break slots cannot have a subject; non-break slots must have one
    if (periodSlot.isBreak && data.subjectId) {
      throw createError(
        'A break/lunch period slot cannot have a subject assigned',
        400,
      );
    }
    if (!periodSlot.isBreak && !data.subjectId) {
      throw createError(
        'A subject is required for a non-break period slot',
        400,
      );
    }

    if (data.subjectId) {
      const subjectAssignment = await prisma.subjectAssignment.findUnique({
        where: {
          subjectId_classLevelId: {
            subjectId: data.subjectId,
            classLevelId: classArm.classLevelId,
          },
        },
      });
      if (!subjectAssignment) {
        throw createError(
          'This subject is not assigned to the class level of this arm',
          400,
        );
      }
    }

    const existing = await prisma.timetableEntry.findUnique({
      where: {
        classArmId_periodSlotId_dayOfWeek_sessionId: {
          classArmId,
          periodSlotId: data.periodSlotId,
          dayOfWeek: data.dayOfWeek,
          sessionId: session.id,
        },
      },
    });
    if (existing) {
      throw createError(
        'A timetable entry already exists for this class arm, day, and period in the current session',
        409,
      );
    }

    return prisma.timetableEntry.create({
      data: {
        classArmId,
        periodSlotId: data.periodSlotId,
        dayOfWeek: data.dayOfWeek,
        subjectId: data.subjectId ?? null,
        sessionId: session.id,
      },
      include: timetableEntryInclude,
    });
  },

  async updateTimetableEntry(
    classArmId: string,
    entryId: string,
    data: UpdateTimetableEntryInput,
  ): Promise<TimetableEntryWithDetails> {
    const entry = await prisma.timetableEntry.findFirst({
      where: { id: entryId, classArmId },
      include: {
        periodSlot: true,
        classArm: { include: { classLevel: true } },
      },
    });
    if (!entry) throw createError('Timetable entry not found', 404);

    if (entry.periodSlot.isBreak && data.subjectId !== null) {
      throw createError(
        'A break/lunch period slot cannot have a subject assigned',
        400,
      );
    }
    if (!entry.periodSlot.isBreak && data.subjectId === null) {
      throw createError(
        'A subject is required for a non-break period slot',
        400,
      );
    }

    if (data.subjectId) {
      const subjectAssignment = await prisma.subjectAssignment.findUnique({
        where: {
          subjectId_classLevelId: {
            subjectId: data.subjectId,
            classLevelId: entry.classArm.classLevelId,
          },
        },
      });
      if (!subjectAssignment) {
        throw createError(
          'This subject is not assigned to the class level of this arm',
          400,
        );
      }
    }

    return prisma.timetableEntry.update({
      where: { id: entryId },
      data: { subjectId: data.subjectId },
      include: timetableEntryInclude,
    });
  },

  async removeTimetableEntry(
    classArmId: string,
    entryId: string,
  ): Promise<void> {
    const entry = await prisma.timetableEntry.findFirst({
      where: { id: entryId, classArmId },
    });
    if (!entry) throw createError('Timetable entry not found', 404);

    await prisma.timetableEntry.delete({ where: { id: entryId } });
  },

  async getTimetable(classArmId: string): Promise<GroupedTimetable> {
    await validateClassArm(classArmId);
    const session = await getActiveSession();

    const entries = await prisma.timetableEntry.findMany({
      where: { classArmId, sessionId: session.id },
      include: timetableEntryInclude,
      orderBy: { periodSlot: { order: 'asc' } },
    });

    const grouped: GroupedTimetable = {};
    for (const day of dayOrder) {
      grouped[day] = entries.filter((entry) => entry.dayOfWeek === day);
    }

    return grouped;
  },
};

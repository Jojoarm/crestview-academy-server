import prisma from '../../../config/prisma.js';
import { getChildContext } from './child-access.service.js';

export const parentTimetableService = {
  async getChildTimetable(
    parentId: string,
    studentId: string,
    sessionId?: string,
  ) {
    const { session, enrollment } = await getChildContext(
      parentId,
      studentId,
      sessionId,
    );

    const entries = await prisma.timetableEntry.findMany({
      where: { classArmId: enrollment.classArmId, sessionId: session.id },
      select: {
        id: true,
        dayOfWeek: true,
        subject: { select: { name: true, code: true } },
        periodSlot: {
          select: {
            name: true,
            startTime: true,
            endTime: true,
            isBreak: true,
            order: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodSlot: { order: 'asc' } }],
    });

    return {
      classArm: {
        classLevel: enrollment.classArm.classLevel.name,
        arm: enrollment.classArm.arm.name,
      },
      session: { id: session.id, name: session.name },
      entries: entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        subject: e.subject
          ? { name: e.subject.name, code: e.subject.code }
          : null,
        periodSlot: {
          name: e.periodSlot.name,
          startTime: e.periodSlot.startTime,
          endTime: e.periodSlot.endTime,
          isBreak: e.periodSlot.isBreak,
        },
      })),
    };
  },
};

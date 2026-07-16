import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { resolveSession } from '../lib/utils.js';

type TimetableRole = 'ClassTeacher' | 'SubjectTeacher';

interface TimetableEntrySummary {
  id: string;
  dayOfWeek: string;
  classArm: { classLevel: string; arm: string };
  subject: { name: string; code: string } | null; // null for break periods
  periodSlot: {
    name: string;
    startTime: string;
    endTime: string;
    isBreak: boolean;
  };
  // Why this entry appears on the teacher's timetable. Can carry both if
  // they teach a subject in their own homeroom class.
  roles: TimetableRole[];
}

export const teacherTimetableService = {
  async getTimetable(
    teacherId: string,
    sessionId?: string,
  ): Promise<TimetableEntrySummary[]> {
    const session = await resolveSession(sessionId);

    const [subjectAssignments, homeroomAssignments] = await Promise.all([
      prisma.subjectTeacher.findMany({
        where: { teacherId, sessionId: session.id },
        select: { classArmId: true, subjectId: true },
      }),
      prisma.classArmTeacher.findMany({
        where: { teacherId, sessionId: session.id },
        select: { classArmId: true },
      }),
    ]);

    const homeroomClassArmIds = homeroomAssignments.map((c) => c.classArmId);

    if (subjectAssignments.length === 0 && homeroomClassArmIds.length === 0) {
      return [];
    }

    const orConditions: Prisma.TimetableEntryWhereInput[] = [];

    if (subjectAssignments.length > 0) {
      orConditions.push(
        ...subjectAssignments.map((a) => ({
          classArmId: a.classArmId,
          subjectId: a.subjectId,
        })),
      );
    }

    if (homeroomClassArmIds.length > 0) {
      // Full schedule for homeroom class arms — every period, every
      // subject, including breaks (subjectId null) — not just periods
      // this teacher personally teaches.
      orConditions.push({ classArmId: { in: homeroomClassArmIds } });
    }

    const entries = await prisma.timetableEntry.findMany({
      where: { sessionId: session.id, OR: orConditions },
      select: {
        id: true,
        dayOfWeek: true,
        classArmId: true,
        subjectId: true,
        classArm: {
          select: {
            classLevel: { select: { name: true } },
            arm: { select: { name: true } },
          },
        },
        subject: { select: { name: true, code: true } },
        periodSlot: {
          select: {
            name: true,
            startTime: true,
            endTime: true,
            order: true,
            isBreak: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodSlot: { order: 'asc' } }],
    });

    const subjectAssignmentKeys = new Set(
      subjectAssignments.map((a) => `${a.classArmId}:${a.subjectId}`),
    );
    const homeroomSet = new Set(homeroomClassArmIds);

    return entries.map((entry) => {
      const roles: TimetableRole[] = [];

      if (
        entry.subjectId &&
        subjectAssignmentKeys.has(`${entry.classArmId}:${entry.subjectId}`)
      ) {
        roles.push('SubjectTeacher');
      }
      if (homeroomSet.has(entry.classArmId)) {
        roles.push('ClassTeacher');
      }

      return {
        id: entry.id,
        dayOfWeek: entry.dayOfWeek,
        classArm: {
          classLevel: entry.classArm.classLevel.name,
          arm: entry.classArm.arm.name,
        },
        subject: entry.subject
          ? { name: entry.subject.name, code: entry.subject.code }
          : null,
        periodSlot: {
          name: entry.periodSlot.name,
          startTime: entry.periodSlot.startTime,
          endTime: entry.periodSlot.endTime,
          isBreak: entry.periodSlot.isBreak,
        },
        roles,
      };
    });
  },
};

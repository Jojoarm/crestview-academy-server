// Attendance is a class-teacher (homeroom) responsibility, so ownership is

import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSessionAndTerm, normalizeDate } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import {
  attendanceInclude,
  type AttendanceWithRelations,
} from '../types/attendance.types.js';
import type {
  ListAttendanceQuery,
  MarkAttendanceInput,
  UpdateAttendanceInput,
} from '../validations/attendance.validation.js';

// checked against ClassArmTeacher — not SubjectTeacher like Assignments.
async function assertClassTeacher(
  teacherId: string,
  classArmId: string,
  sessionId: string,
) {
  const assignment = await prisma.classArmTeacher.findUnique({
    where: {
      classArmId_teacherId_sessionId: {
        classArmId,
        teacherId,
        sessionId,
      },
    },
  });

  if (!assignment) {
    throw createError('You are not the class teacher for this class arm', 403);
  }
}

export const teacherAttendanceService = {
  async markAttendance(
    teacherId: string,
    input: MarkAttendanceInput,
  ): Promise<void> {
    const { session, term } = await getActiveSessionAndTerm();

    await assertClassTeacher(teacherId, input.classArmId, session.id);

    const studentIds = input.records.map((r) => r.studentId);

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId: { in: studentIds },
        classArmId: input.classArmId,
        sessionId: session.id,
        isActive: true,
      },
      select: {
        studentId: true,
      },
    });

    const enrolledIds = new Set(enrollments.map((e) => e.studentId));

    const invalidIds = studentIds.filter((id) => !enrolledIds.has(id));

    if (invalidIds.length > 0) {
      throw createError(
        `These students are not enrolled in this class arm: ${invalidIds.join(', ')}`,
        400,
      );
    }

    const date = normalizeDate(input.date);

    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: {
          classArmId: input.classArmId,
          date,
        },
      }),

      prisma.attendance.createMany({
        data: input.records.map((record) => ({
          studentId: record.studentId,
          classArmId: input.classArmId,
          date,
          status: record.status,
          termId: term.id,
          sessionId: session.id,
          markedById: teacherId,
        })),
      }),
    ]);
  },

  async getAttendance(teacherId: string, query: ListAttendanceQuery) {
    const { session } = await getActiveSessionAndTerm();

    await assertClassTeacher(teacherId, query.classArmId, session.id);

    const where: Prisma.AttendanceWhereInput = {
      classArmId: query.classArmId,
      sessionId: session.id,
      ...(query.date ? { date: normalizeDate(query.date) } : {}),
    };

    const [total, data] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        include: attendanceInclude,
        orderBy: [{ date: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async updateAttendance(
    teacherId: string,
    attendanceId: string,
    input: UpdateAttendanceInput,
  ): Promise<AttendanceWithRelations> {
    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existing) throw createError('Attendance record not found', 404);

    await assertClassTeacher(
      teacherId,
      existing.classArmId,
      existing.sessionId,
    );

    return prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: input.status },
      include: attendanceInclude,
    });
  },
};

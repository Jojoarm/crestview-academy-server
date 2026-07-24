import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { resolveTerm } from '../../../lib/utils.js';
import type { ParentAttendanceQuery } from '../validations/attendance.validation.js';
import { getChildContext } from './child-access.service.js';

export const parentAttendanceService = {
  async getChildAttendance(
    parentId: string,
    studentId: string,
    query: ParentAttendanceQuery,
  ) {
    const { sessionId, termId, page, limit } = query;

    const { session, enrollment } = await getChildContext(
      parentId,
      studentId,
      sessionId,
    );
    const term = await resolveTerm(session.id, termId);

    const where: Prisma.AttendanceWhereInput = {
      studentId,
      classArmId: enrollment.classArmId,
      termId: term.id,
      sessionId: session.id,
    };
    const [total, records, statusCounts] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const summary = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    for (const row of statusCounts) {
      summary[row.status] = row._count.status;
    }

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary,
      session: { id: session.id, name: session.name },
      term: { id: term.id, name: term.name },
    };
  },
};

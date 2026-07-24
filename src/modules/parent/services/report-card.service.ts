import prisma from '../../../config/prisma.js';
import { resolveTerm } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import type { ParentReportCardQuery } from '../validations/report-card.validation.js';
import { getChildContext } from './child-access.service.js';

export const parentReportCardService = {
  async getChildReportCard(
    parentId: string,
    studentId: string,
    query: ParentReportCardQuery,
  ) {
    const { sessionId, termId } = query;

    const { session, enrollment } = await getChildContext(
      parentId,
      studentId,
      sessionId,
    );
    const term = await resolveTerm(session.id, termId);

    const [reportCard, scores, attendanceGrouped] = await Promise.all([
      prisma.reportCard.findUnique({
        where: {
          studentId_termId_sessionId: {
            studentId,
            termId: term.id,
            sessionId: session.id,
          },
        },
        select: { remark: true, status: true, publishedAt: true },
      }),
      prisma.score.findMany({
        where: { studentId, termId: term.id, sessionId: session.id },
        select: {
          caScore: true,
          examScore: true,
          total: true,
          grade: true,
          subject: { select: { name: true, code: true } },
        },
        orderBy: { subject: { name: 'asc' } },
      }),
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          studentId,
          classArmId: enrollment.classArmId,
          termId: term.id,
          sessionId: session.id,
        },
        _count: true,
      }),
    ]);

    if (!reportCard || reportCard.status !== 'Published') {
      throw createError('Report card not yet published for this term', 404);
    }

    const attendanceSummary = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    for (const row of attendanceGrouped) {
      attendanceSummary[row.status] = row._count;
    }

    const totalDaysMarked = Object.values(attendanceSummary).reduce(
      (a, b) => a + b,
      0,
    );

    return {
      classArm: {
        classLevel: enrollment.classArm.classLevel.name,
        arm: enrollment.classArm.arm.name,
      },
      term: { id: term.id, name: term.name },
      session: { id: session.id, name: session.name },
      remark: reportCard.remark,
      status: reportCard.status,
      publishedAt: reportCard.publishedAt,
      scores,
      attendance: {
        summary: attendanceSummary,
        totalDaysMarked,
      },
    };
  },
};

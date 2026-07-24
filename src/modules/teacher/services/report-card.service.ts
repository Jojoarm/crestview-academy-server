import prisma from '../../../config/prisma.js';
import { resolveSession, resolveTerm } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import { assertClassTeacher, assertStudentEnrolled } from '../lib/utils.js';
import type { UpsertRemarkInput } from '../validations/report-card.validation.js';

export const teacherReportCardService = {
  async getReportCard(
    teacherId: string,
    classArmId: string,
    studentId: string,
    termId?: string,
    sessionId?: string,
  ) {
    const session = await resolveSession(sessionId);
    const term = await resolveTerm(session.id, termId);

    await assertClassTeacher(teacherId, classArmId, session.id);
    await assertStudentEnrolled(studentId, classArmId, session.id);

    const [student, reportCard, scores, attendanceGrouped] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          admissionNumber: true,
          user: { select: { name: true } },
        },
      }),
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
          classArmId,
          termId: term.id,
          sessionId: session.id,
        },
        _count: true,
      }),
    ]);

    if (!student) throw createError('Student not found', 404);

    const attendanceSummary = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    for (const row of attendanceGrouped) {
      attendanceSummary[row.status] = row._count;
    }
    const totalDaysMarked = Object.values(attendanceSummary).reduce(
      (a, b) => a + b,
      0,
    );

    return {
      student: {
        admissionNumber: student.admissionNumber,
        name: student.user.name,
      },
      term: { id: term.id, name: term.name },
      session: { id: session.id, name: session.name },
      remark: reportCard?.remark ?? null,
      status: reportCard?.status ?? 'Draft',
      publishedAt: reportCard?.publishedAt ?? null,
      scores,
      attendance: {
        summary: attendanceSummary,
        totalDaysMarked,
      },
    };
  },

  async upsertRemark(
    teacherId: string,
    classArmId: string,
    studentId: string,
    input: UpsertRemarkInput,
  ) {
    const session = await resolveSession(input.sessionId);
    const term = await resolveTerm(session.id, input.termId);

    await assertClassTeacher(teacherId, classArmId, session.id);
    await assertStudentEnrolled(studentId, classArmId, session.id);

    const existing = await prisma.reportCard.findUnique({
      where: {
        studentId_termId_sessionId: {
          studentId,
          termId: term.id,
          sessionId: session.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existing?.status === 'Published') {
      throw createError(
        'This report card is published and cannot be edited. Unpublish it first.',
        400,
      );
    }

    return prisma.reportCard.upsert({
      where: {
        studentId_termId_sessionId: {
          studentId,
          termId: term.id,
          sessionId: session.id,
        },
      },
      create: {
        studentId,
        classArmId,
        termId: term.id,
        sessionId: session.id,
        remark: input.remark,
        createdById: teacherId,
      },
      update: {
        remark: input.remark,
        createdById: teacherId,
      },
      select: { id: true, remark: true, status: true, publishedAt: true },
    });
  },

  async publish(
    teacherId: string,
    classArmId: string,
    studentId: string,
    termId?: string,
    sessionId?: string,
  ) {
    const session = await resolveSession(sessionId);
    const term = await resolveTerm(session.id, termId);

    await assertClassTeacher(teacherId, classArmId, session.id);
    await assertStudentEnrolled(studentId, classArmId, session.id);

    const existing = await prisma.reportCard.findUnique({
      where: {
        studentId_termId_sessionId: {
          studentId,
          termId: term.id,
          sessionId: session.id,
        },
      },
    });

    if (!existing) throw createError('Add a remark before publishing', 400);
    if (existing.status === 'Published') {
      throw createError('This report card is already published', 400);
    }

    return prisma.reportCard.update({
      where: { id: existing.id },
      data: { status: 'Published', publishedAt: new Date() },
      select: { id: true, remark: true, status: true, publishedAt: true },
    });
  },

  async unpublish(
    teacherId: string,
    classArmId: string,
    studentId: string,
    termId?: string,
    sessionId?: string,
  ) {
    const session = await resolveSession(sessionId);
    const term = await resolveTerm(session.id, termId);

    await assertClassTeacher(teacherId, classArmId, session.id);
    await assertStudentEnrolled(studentId, classArmId, session.id);

    const existing = await prisma.reportCard.findUnique({
      where: {
        studentId_termId_sessionId: {
          studentId,
          termId: term.id,
          sessionId: session.id,
        },
      },
    });

    if (!existing) throw createError('Report card not found', 404);
    if (existing.status === 'Draft') {
      throw createError('This report card is already a draft', 400);
    }

    return prisma.reportCard.update({
      where: { id: existing.id },
      data: { status: 'Draft', publishedAt: null },
      select: { id: true, remark: true, status: true, publishedAt: true },
    });
  },
};

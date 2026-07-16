// A teacher can enter/view scores for a class arm + subject if they EITHER
// teach that specific subject in that arm (SubjectTeacher) OR are the
// class teacher for that arm (ClassArmTeacher — can enter scores across all subjects for their own class

import prisma from '../../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSessionAndTerm } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import type {
  ListScoresQuery,
  MarkScoresInput,
  UpdateScoreInput,
} from '../validations/score.validation.js';

async function assertScoreAccess(
  teacherId: string,
  classArmId: string,
  subjectId: string,
  sessionId: string,
) {
  const [teachesSubject, isClassTeacher] = await Promise.all([
    prisma.subjectTeacher.findUnique({
      where: {
        classArmId_subjectId_teacherId_sessionId: {
          classArmId,
          subjectId,
          teacherId,
          sessionId,
        },
      },
    }),
    prisma.classArmTeacher.findUnique({
      where: {
        classArmId_teacherId_sessionId: {
          classArmId,
          teacherId,
          sessionId,
        },
      },
    }),
  ]);

  if (!teachesSubject && !isClassTeacher) {
    throw createError('You are not assigned to this subject or class arm', 403);
  }
}

function computeGrade(total: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

export const teacherScoreService = {
  async markScores(teacherId: string, input: MarkScoresInput): Promise<void> {
    const { session, term } = await getActiveSessionAndTerm();

    await assertScoreAccess(
      teacherId,
      input.classArmId,
      input.subjectId,
      session.id,
    );

    const studentIds = input.records.map((r) => r.studentId);

    if (new Set(studentIds).size !== studentIds.length) {
      throw createError('Duplicate studentId in records', 400);
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId: { in: studentIds },
        classArmId: input.classArmId,
        sessionId: session.id,
        isActive: true,
      },
      select: { studentId: true },
    });

    const enrolledIds = new Set(enrollments.map((e) => e.studentId));
    const invalidIds = studentIds.filter((id) => !enrolledIds.has(id));

    if (invalidIds.length > 0) {
      throw createError(
        `These students are not enrolled in this class arm: ${invalidIds.join(', ')}`,
        400,
      );
    }

    const rows = input.records.map((record) => {
      const total = record.caScore + record.examScore;

      return {
        studentId: record.studentId,
        subjectId: input.subjectId,
        classArmId: input.classArmId,
        caScore: record.caScore,
        examScore: record.examScore,
        total,
        grade: computeGrade(total),
        termId: term.id,
        sessionId: session.id,
        markedById: teacherId,
      };
    });

    await prisma.$transaction([
      prisma.score.deleteMany({
        where: {
          classArmId: input.classArmId,
          subjectId: input.subjectId,
          termId: term.id,
          sessionId: session.id,
          studentId: { in: studentIds },
        },
      }),
      prisma.score.createMany({ data: rows }),
    ]);
  },

  async getScores(teacherId: string, query: ListScoresQuery) {
    const { session } = await getActiveSessionAndTerm();

    // If a specific subject is requested, enforce the same access check as
    // marking. If viewing across all subjects for the class arm, only
    // class-teacher access makes sense (a subject teacher shouldn't see
    // scores for subjects they don't teach) — checked directly here.
    if (query.subjectId) {
      await assertScoreAccess(
        teacherId,
        query.classArmId,
        query.subjectId,
        session.id,
      );
    } else {
      const isClassTeacher = await prisma.classArmTeacher.findUnique({
        where: {
          classArmId_teacherId_sessionId: {
            classArmId: query.classArmId,
            teacherId,
            sessionId: session.id,
          },
        },
      });

      if (!isClassTeacher) {
        throw createError(
          'Only the class teacher can view scores across all subjects — filter by subjectId instead',
          403,
        );
      }
    }

    const where: Prisma.ScoreWhereInput = {
      classArmId: query.classArmId,
      sessionId: session.id,
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
    };
    const [total, data] = await Promise.all([
      prisma.score.count({ where }),
      prisma.score.findMany({
        where,
        select: {
          id: true,
          caScore: true,
          examScore: true,
          total: true,
          grade: true,
          studentId: true,
          subjectId: true,
          student: {
            select: { user: { select: { name: true } } },
          },
          subject: {
            select: { name: true, code: true },
          },
        },
        orderBy: [{ student: { user: { name: 'asc' } } }],
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

  async updateScore(
    teacherId: string,
    scoreId: string,
    input: UpdateScoreInput,
  ) {
    const existing = await prisma.score.findUnique({ where: { id: scoreId } });
    if (!existing) throw createError('Score record not found', 404);

    await assertScoreAccess(
      teacherId,
      existing.classArmId,
      existing.subjectId,
      existing.sessionId,
    );

    const total = input.caScore + input.examScore;

    return prisma.score.update({
      where: { id: scoreId },
      data: {
        caScore: input.caScore,
        examScore: input.examScore,
        total,
        grade: computeGrade(total),
      },
      select: {
        id: true,
        caScore: true,
        examScore: true,
        total: true,
        grade: true,
        studentId: true,
        subjectId: true,
      },
    });
  },
};

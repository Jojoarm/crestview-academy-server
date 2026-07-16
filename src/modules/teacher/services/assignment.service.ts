import prisma from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { getActiveSessionAndTerm } from '../../../lib/utils.js';
import { createError } from '../../../middlewares/error-handler.js';
import {
  assignmentInclude,
  submissionInclude,
} from '../types/assignment.types.js';
import type {
  CreateAssignmentInput,
  GradeSubmissionInput,
  ListAssignmentsQuery,
  UpdateAssignmentInput,
} from '../validations/assignment.validation.js';

async function assertTeacherAssignment(
  teacherId: string,
  classArmId: string,
  subjectId: string,
  sessionId: string,
) {
  const assignment = await prisma.subjectTeacher.findUnique({
    where: {
      classArmId_subjectId_teacherId_sessionId: {
        classArmId,
        subjectId,
        teacherId,
        sessionId,
      },
    },
  });

  if (!assignment) {
    throw createError(
      'You are not assigned to teach this subject for this class',
      403,
    );
  }
}

async function getOwnedAssignment(teacherId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: assignmentInclude,
  });

  if (!assignment) throw createError('Assignment not found', 404);
  if (assignment.teacherId !== teacherId)
    throw createError('You do not own this assignment', 403);

  return assignment;
}

export async function createAssignment(
  teacherId: string,
  input: CreateAssignmentInput,
) {
  const { session, term } = await getActiveSessionAndTerm();

  await assertTeacherAssignment(
    teacherId,
    input.classArmId,
    input.subjectId,
    session.id,
  );

  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      classArmId: input.classArmId,
      subjectId: input.subjectId,
      teacherId,
      dueDate: input.dueDate,
      sessionId: session.id,
      termId: term.id,
      isPublished: input.isPublished ?? false,
    },
    include: assignmentInclude,
  });

  return assignment;
}

export async function listAssignments(
  teacherId: string,
  query: ListAssignmentsQuery,
) {
  const where: Prisma.AssignmentWhereInput = {
    teacherId,
    ...(query.classArmId ? { classArmId: query.classArmId } : {}),
    ...(query.subjectId ? { subjectId: query.subjectId } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.assignment.count({ where }),
    prisma.assignment.findMany({
      where,
      include: assignmentInclude,
      orderBy: { dueDate: 'desc' },
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
}

export async function getAssignmentById(
  teacherId: string,
  assignmentId: string,
) {
  return getOwnedAssignment(teacherId, assignmentId);
}

export async function updateAssignment(
  teacherId: string,
  assignmentId: string,
  input: UpdateAssignmentInput,
) {
  const existing = await getOwnedAssignment(teacherId, assignmentId);

  if (input.classArmId || input.subjectId) {
    await assertTeacherAssignment(
      teacherId,
      input.classArmId ?? existing.classArmId,
      input.subjectId ?? existing.subjectId,
      existing.sessionId,
    );
  }

  const assignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.classArmId !== undefined && {
        classArmId: input.classArmId,
      }),
      ...(input.subjectId !== undefined && {
        subjectId: input.subjectId,
      }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate,
      }),
      ...(input.isPublished !== undefined && {
        isPublished: input.isPublished,
      }),
    },
    include: assignmentInclude,
  });

  return assignment;
}

export async function deleteAssignment(
  teacherId: string,
  assignmentId: string,
) {
  await getOwnedAssignment(teacherId, assignmentId);

  await prisma.assignment.delete({ where: { id: assignmentId } });
}

export async function getSubmissions(teacherId: string, assignmentId: string) {
  await getOwnedAssignment(teacherId, assignmentId);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    include: submissionInclude,
    orderBy: { submittedAt: 'desc' },
  });

  return submissions;
}

export async function gradeSubmission(
  teacherId: string,
  assignmentId: string,
  submissionId: string,
  input: GradeSubmissionInput,
) {
  await getOwnedAssignment(teacherId, assignmentId);

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || submission.assignmentId !== assignmentId) {
    throw createError('Submission not found', 404);
  }

  const graded = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score: new Prisma.Decimal(input.score),
      feedback: input.feedback ?? null,
      gradedById: teacherId,
      gradedAt: new Date(),
    },
    include: submissionInclude,
  });

  return graded;
}

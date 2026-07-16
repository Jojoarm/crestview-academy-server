import { createError } from '../../../middlewares/error-handler.js';
import { sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireTeacherId } from '../lib/utils.js';
import * as assignmentService from '../services/assignment.service.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  listAssignmentsQuerySchema,
  gradeSubmissionSchema,
} from '../validations/assignment.validation.js';

export const createAssignment = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);

  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const assignment = await assignmentService.createAssignment(
    teacherId,
    parsed.data,
  );
  sendSuccess(res, assignment, 'Assignment created', 201);
});

export const listAssignments = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);

  const parsed = listAssignmentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw createError(parsed.error.issues[0]?.message ?? 'Invalid query', 400);
  }

  const result = await assignmentService.listAssignments(
    teacherId,
    parsed.data,
  );

  sendSuccess(res, result, 'Assignments fetched', 200);
});

export const getAssignment = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const assignmentId = requireParam(req, 'id');

  const assignment = await assignmentService.getAssignmentById(
    teacherId,
    assignmentId,
  );

  sendSuccess(res, assignment, 'Assignment fetched', 200);
});

export const updateAssignment = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const assignmentId = requireParam(req, 'id');

  const parsed = updateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const assignment = await assignmentService.updateAssignment(
    teacherId,
    assignmentId,
    parsed.data,
  );

  sendSuccess(res, assignment, 'Assignment updated', 200);
});

export const deleteAssignment = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const assignmentId = requireParam(req, 'id');
  await assignmentService.deleteAssignment(teacherId, assignmentId);

  sendSuccess(res, null, 'Assignment deleted', 200);
});

export const getSubmissions = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const assignmentId = requireParam(req, 'id');

  const submissions = await assignmentService.getSubmissions(
    teacherId,
    assignmentId,
  );

  sendSuccess(res, submissions, 'Submissions fetched', 200);
});

export const gradeSubmission = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const assignmentId = requireParam(req, 'id');
  const submissionId = requireParam(req, 'submissionId');

  const parsed = gradeSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const submission = await assignmentService.gradeSubmission(
    teacherId,
    assignmentId,
    submissionId,
    parsed.data,
  );

  sendSuccess(res, submission, 'Submission graded', 200);
});

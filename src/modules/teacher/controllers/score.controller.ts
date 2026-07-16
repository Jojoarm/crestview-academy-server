import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherScoreService } from '../services/score.service.js';
import {
  listScoresQuerySchema,
  markScoresSchema,
  updateScoreSchema,
} from '../validations/score.validation.js';

export const markScores = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const parsed = markScoresSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  await teacherScoreService.markScores(teacherId, parsed.data);

  return sendSuccess(res, null, 'Scores recorded successfully');
});

export const listScores = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const parsed = listScoresQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await teacherScoreService.getScores(teacherId, parsed.data);

  return sendSuccess(res, result, 'Scores retrieved successfully');
});

export const updateScore = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const scoreId = requireParam(req, 'id');
  const parsed = updateScoreSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const score = await teacherScoreService.updateScore(
    teacherId,
    scoreId,
    parsed.data,
  );

  return sendSuccess(res, score, 'Score updated successfully');
});

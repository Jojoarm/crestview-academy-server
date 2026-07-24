import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentTimetableQuerySchema } from '../validations/timetable.validation.js';
import { parentTimetableService } from '../services/timetable.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const getChildTimetable = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const parsed = parentTimetableQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await parentTimetableService.getChildTimetable(
    parentId,
    studentId,
    parsed.data.sessionId,
  );

  return sendSuccess(res, result, 'Timetable retrieved successfully');
});

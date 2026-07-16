import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherTimetableService } from '../services/timetable.service.js';
import { timetableQuerySchema } from '../validations/timetable.validation.js';

export const getTimetable = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);

  const parsed = timetableQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const timetable = await teacherTimetableService.getTimetable(
    teacherId,
    parsed.data.sessionId,
  );

  return sendSuccess(res, timetable, 'Timetable retrieved successfully');
});

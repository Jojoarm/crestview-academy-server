import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentAttendanceQuerySchema } from '../validations/attendance.validation.js';
import { parentAttendanceService } from '../services/attendance.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const getChildAttendance = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const parsed = parentAttendanceQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await parentAttendanceService.getChildAttendance(
    parentId,
    studentId,
    parsed.data,
  );

  return sendSuccess(res, result, 'Attendance retrieved successfully');
});

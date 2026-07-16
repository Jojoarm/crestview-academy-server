import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherAttendanceService } from '../services/attendance.service.js';
import {
  listAttendanceQuerySchema,
  markAttendanceSchema,
  updateAttendanceSchema,
} from '../validations/attendance.validation.js';

export const markAttendance = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const parsed = markAttendanceSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  await teacherAttendanceService.markAttendance(teacherId, parsed.data);

  return sendSuccess(res, null, 'Attendance marked successfully');
});

export const listAttendance = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const parsed = listAttendanceQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await teacherAttendanceService.getAttendance(
    teacherId,
    parsed.data,
  );

  return sendSuccess(res, result, 'Attendance retrieved successfully');
});

export const updateAttendance = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const attendanceId = requireParam(req, 'id');
  const parsed = updateAttendanceSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const attendance = await teacherAttendanceService.updateAttendance(
    teacherId,
    attendanceId,
    parsed.data,
  );

  return sendSuccess(res, attendance, 'Attendance record updated successfully');
});

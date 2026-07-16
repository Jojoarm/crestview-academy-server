import { sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { teacherAcademicService } from '../services/academic.service.js';

export const listSessions = catchAsync(async (_req, res) => {
  const sessions = await teacherAcademicService.listSessions();

  return sendSuccess(res, sessions, 'Sessions retrieved successfully');
});

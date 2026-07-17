import { sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherDashboardService } from '../services/dashboard.service.js';

export const getDashboard = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);

  const dashboard = await teacherDashboardService.getDashboard(teacherId);

  return sendSuccess(res, dashboard, 'Dashboard retrieved successfully');
});

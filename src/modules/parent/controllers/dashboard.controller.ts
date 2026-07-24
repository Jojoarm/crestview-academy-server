import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentDashboardService } from '../services/dashboard.service.js';

export const getDashboard = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const result = await parentDashboardService.getDashboard(parentId);
  return sendSuccess(res, result, 'Dashboard retrieved successfully');
});

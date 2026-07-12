import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess } from '../../../utils/api-response.js';
import { analyticsService } from '../services/analytics.service.js';

export const getDashboardStats = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await analyticsService.getDashboardStats();
    return sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
  },
);

import type { Request, Response } from 'express';
import { sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import * as authService from '../services/auth.service.js';

// GET /admin/me — get currently signed-in admin's own profile
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);

  return sendSuccess(res, user, 'Profile retrieved');
});

// POST /api/admin/me/clear-force-password — called after first password change
export const clearForcePassword = catchAsync(
  async (req: Request, res: Response) => {
    await authService.clearForcePasswordChange(req.user!.id);

    return sendSuccess(res, null, 'Password flag cleared');
  },
);

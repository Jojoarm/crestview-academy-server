import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { adminProfileService } from '../services/admin-profile.service.js';
import {
  adminQuerySchema,
  updateAdminSchema,
} from '../middlewares/admin-profile-validation.js';

export const listAdmins = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const queryParsed = adminQuerySchema.safeParse(req.query);
  if (!queryParsed.success)
    return sendError(res, queryParsed.error.issues[0]?.message, 400);

  const result = await adminProfileService.listAdmins(
    { page, limit },
    queryParsed.data,
  );
  return sendSuccess(res, result, 'Admins retrieved successfully');
});

export const getAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const admin = await adminProfileService.getAdminById(
      req.params.id as string,
    );
    return sendSuccess(res, admin, 'Admin profile retrieved successfully');
  },
);

export const updateAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const admin = await adminProfileService.updateAdmin(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(res, admin, 'Admin profile updated successfully');
  },
);

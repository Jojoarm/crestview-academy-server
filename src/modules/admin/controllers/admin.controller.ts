import type { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

// get all admins (SUPER_ADMIN only)
export const getAdmins = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await adminService.getAllAdmins({ page, limit });
  return sendSuccess(res, result, 'Admins retrieved');
});

// GET /admin/me — get currently signed-in admin's own profile
export const getMe = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, req.admin, 'Profile retrieved');
});

// Get /admin/:id - get a single admin by Id (SUPER_ADMIN only)
export const getAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await adminService.getAdminById(req.params.id as string);

  if (!admin) {
    return sendError(res, 'Admin not found', 404);
  }

  return sendSuccess(res, admin, 'Admin retrieved');
});

// Post /admin - create a new admin (SUPER_ADMIN only)
export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, name, role } = req.body;

  const admin = await adminService.createAdmin({ email, name, role });

  return sendSuccess(res, admin, 'Admin created successfully', 201);
});

// PATCH /admin/:id — update role or status (SUPER_ADMIN only)
export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { name, role, isActive } = req.body;

  const admin = await adminService.updateAdmin(req.params.id as string, {
    name,
    role,
    isActive,
  });

  return sendSuccess(res, admin, 'Admin updated successfully');
});

// PATCH /admin/:id/deactivate — deactivate without deleting (SUPER_ADMIN only)
export const deactivateAdmin = catchAsync(
  async (req: Request, res: Response) => {
    // Prevent a super admin from deactivating themselves
    if (req.params.id === req.admin?.id) {
      return sendError(res, 'You cannot deactivate your own account', 400);
    }

    const admin = await adminService.deactivateAdmin(req.params.id as string);
    return sendSuccess(res, admin, 'Admin deactivated');
  },
);

// DELETE /admin/:id — hard delete (SUPER_ADMIN only)
export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  if (req.params.id === req.admin?.id) {
    return sendError(res, 'You cannot delete your own account', 400);
  }

  await adminService.deleteAdmin(req.params.id as string);
  return sendSuccess(res, null, 'Admin deleted');
});

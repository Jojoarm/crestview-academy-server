import type { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import type { UserRole } from '../../../generated/prisma/enums.js';

// GET /admin/me — get currently signed-in admin's own profile
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.getUserById(req.user!.id);

  return sendSuccess(res, user, 'Profile retrieved');
});

// POST /api/admin/me/clear-force-password — called after first password change
export const clearForcePassword = catchAsync(
  async (req: Request, res: Response) => {
    await adminService.clearForcePasswordChange(req.user!.id);

    return sendSuccess(res, null, 'Password flag cleared');
  },
);

// GET /api/admin/users — list all users, optional ?role= filter
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const userRole = req.query.userRole as UserRole;

  const result = await adminService.getAllUsers({ page, limit }, userRole);
  return sendSuccess(res, result, 'Users retrieved');
});

// GET /api/admin/users/:id — single user
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 'User ID is required', 400);
  }

  const user = await adminService.getUserById(id as string);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, user, 'User retrieved');
});

// POST /api/admin/users — create any user (role specified in body)
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, name, temporaryPassword, userRole } = req.body;

  // Only super_admin can create admin or super_admin accounts
  if (
    ['admin', 'super_admin'].includes(userRole) &&
    req.user?.userRole !== 'super_admin'
  ) {
    return sendError(res, 'Only super admins can create admin accounts', 403);
  }

  const user = await adminService.createUser(
    { email, name, temporaryPassword, userRole },
    req.headers,
  );

  return sendSuccess(res, user, 'Account created. Invite email sent.', 201);
});

// PATCH /api/admin/users/:id — update name or role
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 'User ID is required', 400);
  }

  const { name, userRole } = req.body;

  // Only super_admin can promote someone to admin or super_admin
  if (
    userRole &&
    ['admin', 'super_admin'].includes(userRole) &&
    req.user?.userRole !== 'super_admin'
  ) {
    return sendError(res, 'Only super admins can assign admin roles', 403);
  }

  const user = await adminService.updateUser(
    id as string,
    { name, userRole },
    req.headers,
  );
  return sendSuccess(res, user, 'User updated');
});

// PATCH /api/admin/users/:id/ban — ban a user
export const banUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 'User ID is required', 400);
  }

  if (id === req.user?.id) {
    return sendError(res, 'You cannot ban your own account', 400);
  }

  const reason = req.body.reason ?? 'Account deactivated by admin';

  await adminService.banUser(id as string, reason, req.headers);
  return sendSuccess(res, null, 'User banned');
});

// DELETE /api/admin/users/:id — hard delete
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 'User ID is required', 400);
  }

  if (id === req.user?.id) {
    return sendError(res, 'You cannot delete your own account', 400);
  }

  await adminService.deleteUser(id as string, req.headers);
  return sendSuccess(res, null, 'User deleted');
});

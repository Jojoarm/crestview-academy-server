import type { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import type { UserRole } from '../../../generated/prisma/enums.js';
import { getUserById } from '../../auth/services/auth.service.js';

// GET /api/admin/users — list all users, optional ?role= filter, // optional ?search= filter, optional ?page= and ?limit= for pagination
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const userRole = req.query.userRole as UserRole | undefined;

  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const result = await adminService.getAllUsers(
    { page, limit },
    userRole,
    search,
  );
  return sendSuccess(res, result, 'Users retrieved');
});

// GET /api/admin/users/:id — single user
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 'User ID is required', 400);
  }

  const user = await getUserById(id as string);

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

export const unbanUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === req.user?.id) {
    return sendError(res, 'You cannot unban your own account', 400);
  }

  await adminService.unbanUser(id as string, req.headers);
  return sendSuccess(res, null, 'User unbanned successfully');
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

export const getUserStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getUserStats();
  return sendSuccess(res, stats, 'User stats retrieved successfully');
});

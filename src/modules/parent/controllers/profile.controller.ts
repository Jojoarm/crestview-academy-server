import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireParentId } from '../lib/utils.js';
import { parentProfileService } from '../services/profile.service.js';
import { updateParentSchema } from '../validations/profile.validation.js';

export const getProfile = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const profile = await parentProfileService.getParentProfile(parentId);

  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updateProfile = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const parsed = updateParentSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const updatedProfile = await parentProfileService.updateParentProfile(
    parentId,
    parsed.data,
  );

  return sendSuccess(res, updatedProfile, 'Profile updated successfully');
});

export const listChildren = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const children = await parentProfileService.listChildren(parentId);

  return sendSuccess(res, children, 'Children retrieved successfully');
});

export const getChild = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const child = await parentProfileService.getChildProfile(parentId, studentId);

  return sendSuccess(res, child, 'Child profile retrieved successfully');
});

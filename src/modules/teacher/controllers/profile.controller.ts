import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { getQueryString } from '../../../utils/get-query-string.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherProfileService } from '../services/profile.service.js';
import { updateTeacherSchema } from '../validations/profile.validation.js';

export const getProfile = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const profile = await teacherProfileService.getTeacherProfile(teacherId);

  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updateProfile = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const parsed = updateTeacherSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const updatedProfile = await teacherProfileService.updateTeacherProfile(
    teacherId,
    parsed.data,
  );

  return sendSuccess(
    res,
    updatedProfile,
    'Teacher profile updated successfully',
  );
});

export const getClasses = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const sessionId = getQueryString(req.query.sessionId);

  const classes = await teacherProfileService.getTeacherClasses(
    teacherId,
    sessionId,
  );

  return sendSuccess(res, classes, 'Assigned classes retrieved successfully');
});

export const getSubjects = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const sessionId = getQueryString(req.query.sessionId);

  const subjects = await teacherProfileService.getTeacherSubjects(
    teacherId,
    sessionId,
  );

  return sendSuccess(res, subjects, 'Assigned subjects retrieved successfully');
});

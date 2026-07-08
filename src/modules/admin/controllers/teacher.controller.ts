import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { teacherService } from '../services/teacher.service.js';
import {
  teacherQuerySchema,
  updateTeacherSchema,
} from '../middlewares/teacher-validation.js';

export const listTeachers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const queryParsed = teacherQuerySchema.safeParse(req.query);
  if (!queryParsed.success)
    return sendError(res, queryParsed.error.issues[0]?.message, 400);

  const result = await teacherService.listTeachers(
    { page, limit },
    queryParsed.data,
  );
  return sendSuccess(res, result, 'Teachers retrieved successfully');
});

export const getTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherById(req.params.id as string);
  return sendSuccess(res, teacher, 'Teacher retrieved successfully');
});

export const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateTeacherSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const teacher = await teacherService.updateTeacher(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, teacher, 'Teacher profile updated successfully');
});

export const deactivateTeacher = catchAsync(
  async (req: Request, res: Response) => {
    await teacherService.deactivateTeacher(req.params.id as string);
    return sendSuccess(res, null, 'Teacher deactivated successfully');
  },
);

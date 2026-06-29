import type { Request, Response } from 'express';
import { teacherAssignmentService } from '../services/teacher-assignment.service.js';
import {
  assignClassTeacherSchema,
  assignSubjectTeacherSchema,
  removeTeacherSchema,
} from '../middlewares/teacher-assignment-validation.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

// Class Teacher Controllers

export const assignClassTeacher = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = assignClassTeacherSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const result = await teacherAssignmentService.assignClassTeacher(
      req.params.classArmId as string,
      parsed.data,
    );
    return sendSuccess(res, result, 'Class teacher assigned successfully', 201);
  },
);

export const getClassTeachers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await teacherAssignmentService.getClassTeachers(
      req.params.classArmId as string,
    );
    return sendSuccess(res, result, 'Class teachers retrieved successfully');
  },
);

export const removeClassTeacher = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = removeTeacherSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    await teacherAssignmentService.removeClassTeacher(
      req.params.classArmId as string,
      parsed.data.teacherId,
    );
    return sendSuccess(res, null, 'Class teacher removed successfully');
  },
);

// Subject Teacher Controllers
export const assignSubjectTeacher = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = assignSubjectTeacherSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const result = await teacherAssignmentService.assignSubjectTeacher(
      req.params.classArmId as string,
      req.params.subjectId as string,
      parsed.data,
    );
    return sendSuccess(
      res,
      result,
      'Subject teacher assigned successfully',
      201,
    );
  },
);

export const removeSubjectTeacher = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = removeTeacherSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    await teacherAssignmentService.removeSubjectTeacher(
      req.params.classArmId as string,
      req.params.subjectId as string,
      parsed.data.teacherId,
    );
    return sendSuccess(res, null, 'Subject teacher removed successfully');
  },
);

export const getArmTeachers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await teacherAssignmentService.getArmTeachers(
      req.params.classArmId as string,
    );
    return sendSuccess(res, result, 'Arm teachers retrieved successfully');
  },
);

import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { studentService } from '../services/student.service.js';
import {
  enrollStudentSchema,
  linkParentSchema,
  studentQuerySchema,
  updateStudentSchema,
} from '../middlewares/student-validation.js';

export const listStudents = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const queryParsed = studentQuerySchema.safeParse(req.query);
  if (!queryParsed.success)
    return sendError(res, queryParsed.error.issues[0]?.message, 400);

  const result = await studentService.listStudents(
    { page, limit },
    queryParsed.data,
  );
  return sendSuccess(res, result, 'Students retrieved successfully');
});

export const getStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id as string);
  return sendSuccess(res, student, 'Student retrieved successfully');
});

export const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateStudentSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const student = await studentService.updateStudent(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, student, 'Student profile updated successfully');
});

export const deactivateStudent = catchAsync(
  async (req: Request, res: Response) => {
    await studentService.deactivateStudent(req.params.id as string);
    return sendSuccess(res, null, 'Student deactivated successfully');
  },
);

// Enrollment

export const enrollStudent = catchAsync(async (req: Request, res: Response) => {
  const parsed = enrollStudentSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const enrollment = await studentService.enrollStudent(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, enrollment, 'Student enrolled successfully', 201);
});

export const updateEnrollment = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = enrollStudentSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const enrollment = await studentService.updateEnrollment(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(
      res,
      enrollment,
      'Student enrollment updated successfully',
    );
  },
);

export const getEnrollmentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const history = await studentService.getEnrollmentHistory(
      req.params.id as string,
    );
    return sendSuccess(
      res,
      history,
      'Enrollment history retrieved successfully',
    );
  },
);

// Parent Linking

export const linkParent = catchAsync(async (req: Request, res: Response) => {
  const parsed = linkParentSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const link = await studentService.linkParent(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, link, 'Parent linked successfully', 201);
});

export const unlinkParent = catchAsync(async (req: Request, res: Response) => {
  await studentService.unlinkParent(
    req.params.id as string,
    req.params.parentId as string,
  );
  return sendSuccess(res, null, 'Parent unlinked successfully');
});

// Students by Class Arm

export const getStudentsByClassArm = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await studentService.getStudentsByClassArm(
      req.params.classArmId as string,
      { page, limit },
    );
    return sendSuccess(res, result, 'Students retrieved successfully');
  },
);

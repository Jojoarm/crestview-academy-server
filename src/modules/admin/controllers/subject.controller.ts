import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import {
  assignClassLevelSchema,
  createSubjectSchema,
  updateSubjectAssignmentSchema,
  updateSubjectSchema,
} from '../middlewares/subject-validation.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { subjectService } from '../services/subject.service.js';

// Subject Controllers
export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const parsed = createSubjectSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const subject = await subjectService.createSubject(parsed.data);
  return sendSuccess(res, subject, 'Subject created successfully', 201);
});

export const listSubjects = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await subjectService.listSubjects({ page, limit });
  return sendSuccess(res, result, 'Subjects retrieved successfully');
});

export const getSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await subjectService.getSubjectById(req.params.id as string);
  return sendSuccess(res, subject, 'Subject retrieved successfully');
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateSubjectSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const subject = await subjectService.updateSubject(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, subject, 'Subject updated successfully');
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  await subjectService.deleteSubject(req.params.id as string);
  return sendSuccess(res, null, 'Subject deleted successfully');
});

// Subject Assignemnt Controllers
export const assignToClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = assignClassLevelSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const assignment = await subjectService.assignToClassLevel(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(
      res,
      assignment,
      'Subject assigned to class level successfully',
      201,
    );
  },
);

export const updateAssignment = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateSubjectAssignmentSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const assignment = await subjectService.updateAssignment(
      req.params.id as string,
      req.params.classLevelId as string,
      parsed.data,
    );
    return sendSuccess(
      res,
      assignment,
      'Subject assignment updated successfully',
    );
  },
);

export const removeFromClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    await subjectService.removeFromClassLevel(
      req.params.id as string,
      req.params.classLevelId as string,
    );
    return sendSuccess(
      res,
      null,
      'Subject removed from class level successfully',
    );
  },
);

export const getSubjectsByClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await subjectService.getSubjectsByClassLevel(
      req.params.id as string,
      { page, limit },
    );
    return sendSuccess(res, result, 'Class subjects retrieved successfully');
  },
);

// Class Level Controllers

import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import {
  assignArmSchema,
  classLevelQuerySchema,
  createArmSchema,
  createClassLevelSchema,
  updateArmSchema,
  updateClassArmSchema,
  updateClassLevelSchema,
} from '../middlewares/class-validation.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { classService } from '../services/class.service.js';

export const createClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createClassLevelSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const classLevel = await classService.createClassLevel(parsed.data);
    return sendSuccess(res, classLevel, 'Class created successfully', 201);
  },
);

export const listClassLevels = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const queryParsed = classLevelQuerySchema.safeParse(req.query);
    if (!queryParsed.success)
      return sendError(res, queryParsed.error.issues[0]?.message, 400);

    const result = await classService.listClassLevels(
      { page, limit },
      queryParsed.data,
    );

    return sendSuccess(res, result, 'Classes retrieved successfully');
  },
);

export const getClassLevel = catchAsync(async (req: Request, res: Response) => {
  const classLevel = await classService.getClassLevelById(
    req.params.id as string,
  );
  return sendSuccess(res, classLevel, 'Class retrieved successfully');
});

export const updateClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateClassLevelSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const classLevel = await classService.updateClassLevel(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(res, classLevel, 'Class updated successfully');
  },
);

export const deleteClassLevel = catchAsync(
  async (req: Request, res: Response) => {
    await classService.deleteClassLevel(req.params.id as string);
    return sendSuccess(res, null, 'Class deleted successfully');
  },
);

// Arm Controllers
export const createArm = catchAsync(async (req: Request, res: Response) => {
  const parsed = createArmSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const arm = await classService.createArm(parsed.data);
  return sendSuccess(res, arm, 'Arm created successfully', 201);
});

export const listArms = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await classService.listArms({ page, limit });
  return sendSuccess(res, result, 'Arms retrieved successfully');
});

export const updateArm = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateArmSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const arm = await classService.updateArm(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, arm, 'Arm updated successfully');
});

export const deleteArm = catchAsync(async (req: Request, res: Response) => {
  await classService.deleteArm(req.params.id as string);
  return sendSuccess(res, null, 'Arm deleted successfully');
});

// Class-Arm Assignment Controllers
export const assignArm = catchAsync(async (req: Request, res: Response) => {
  const parsed = assignArmSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const classArm = await classService.assignArm(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, classArm, 'Arm assigned to class successfully', 201);
});

export const updateClassArm = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateClassArmSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const classArm = await classService.updateClassArm(
      req.params.id as string,
      req.params.armId as string,
      parsed.data,
    );
    return sendSuccess(
      res,
      classArm,
      'Class arm capacity updated successfully',
    );
  },
);

export const removeClassArm = catchAsync(
  async (req: Request, res: Response) => {
    await classService.removeClassArm(
      req.params.id as string,
      req.params.armId as string,
    );
    return sendSuccess(res, null, 'Arm removed from class successfully');
  },
);

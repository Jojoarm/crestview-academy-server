import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { parentService } from '../services/parent.service.js';
import {
  parentQuerySchema,
  updateParentSchema,
} from '../middlewares/parent-validation.js';

export const listParents = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const queryParsed = parentQuerySchema.safeParse(req.query);
  if (!queryParsed.success)
    return sendError(res, queryParsed.error.issues[0]?.message, 400);

  const result = await parentService.listParents(
    { page, limit },
    queryParsed.data,
  );
  return sendSuccess(res, result, 'Parents retrieved successfully');
});

export const getParent = catchAsync(async (req: Request, res: Response) => {
  const parent = await parentService.getParentById(req.params.id as string);
  return sendSuccess(res, parent, 'Parent retrieved successfully');
});

export const updateParent = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateParentSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const parent = await parentService.updateParent(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, parent, 'Parent profile updated successfully');
});

export const deactivateParent = catchAsync(
  async (req: Request, res: Response) => {
    await parentService.deactivateParent(req.params.id as string);
    return sendSuccess(res, null, 'Parent deactivated successfully');
  },
);

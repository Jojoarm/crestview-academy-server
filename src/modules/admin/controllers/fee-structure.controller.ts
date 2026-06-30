import type { Request, Response } from 'express';
import { feeService } from '../services/fee-structure.service.js';
import {
  createFeeTypeSchema,
  updateFeeTypeSchema,
  createFeeStructureSchema,
  feeStructureQuerySchema,
  createFeeStructureItemSchema,
  updateFeeStructureItemSchema,
} from '../middlewares/fee-structure-validation.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

// Fee Type Controllers

export const createFeeType = catchAsync(async (req: Request, res: Response) => {
  const parsed = createFeeTypeSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const feeType = await feeService.createFeeType(parsed.data);
  return sendSuccess(res, feeType, 'Fee type created successfully', 201);
});

export const listFeeTypes = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await feeService.listFeeTypes({ page, limit });
  return sendSuccess(res, result, 'Fee types retrieved successfully');
});

export const updateFeeType = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateFeeTypeSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const feeType = await feeService.updateFeeType(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, feeType, 'Fee type updated successfully');
});

export const deleteFeeType = catchAsync(async (req: Request, res: Response) => {
  await feeService.deleteFeeType(req.params.id as string);
  return sendSuccess(res, null, 'Fee type deleted successfully');
});

// Fee Structure Controllers

export const createFeeStructure = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createFeeStructureSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const structure = await feeService.createFeeStructure(parsed.data);
    return sendSuccess(
      res,
      structure,
      'Fee structure created successfully',
      201,
    );
  },
);

export const listFeeStructures = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const queryParsed = feeStructureQuerySchema.safeParse(req.query);
    if (!queryParsed.success)
      return sendError(res, queryParsed.error.issues[0]?.message, 400);

    const result = await feeService.listFeeStructures(
      { page, limit },
      queryParsed.data,
    );
    return sendSuccess(res, result, 'Fee structures retrieved successfully');
  },
);

export const getFeeStructure = catchAsync(
  async (req: Request, res: Response) => {
    const structure = await feeService.getFeeStructureById(
      req.params.id as string,
    );
    return sendSuccess(res, structure, 'Fee structure retrieved successfully');
  },
);

export const deleteFeeStructure = catchAsync(
  async (req: Request, res: Response) => {
    await feeService.deleteFeeStructure(req.params.id as string);
    return sendSuccess(res, null, 'Fee structure deleted successfully');
  },
);

// Fee Structure Item Controllers

export const addFeeStructureItem = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createFeeStructureItemSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const structure = await feeService.addFeeStructureItem(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(res, structure, 'Fee item added successfully', 201);
  },
);

export const updateFeeStructureItem = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateFeeStructureItemSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const structure = await feeService.updateFeeStructureItem(
      req.params.id as string,
      req.params.itemId as string,
      parsed.data,
    );
    return sendSuccess(res, structure, 'Fee item updated successfully');
  },
);

export const removeFeeStructureItem = catchAsync(
  async (req: Request, res: Response) => {
    const structure = await feeService.removeFeeStructureItem(
      req.params.id as string,
      req.params.itemId as string,
    );
    return sendSuccess(res, structure, 'Fee item removed successfully');
  },
);

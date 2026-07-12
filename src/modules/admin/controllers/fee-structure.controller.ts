import type { Request, Response } from 'express';
import { feeService } from '../services/fee-structure.service.js';
import {
  createFeeTypeSchema,
  updateFeeTypeSchema,
  createFeeStructureSchema,
  updateFeeStructureSchema,
  feeStructureQuerySchema,
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

export const getAllFeeStructures = catchAsync(
  async (req: Request, res: Response) => {
    const queryParsed = feeStructureQuerySchema.safeParse(req.query);
    if (!queryParsed.success)
      return sendError(res, queryParsed.error.issues[0]?.message, 400);

    const result = await feeService.getAllFeeStructures(queryParsed.data);
    return sendSuccess(res, result, 'Fee structures retrieved successfully');
  },
);

export const getFeeType = catchAsync(async (req: Request, res: Response) => {
  const feeType = await feeService.getFeeTypeById(req.params.id as string);
  return sendSuccess(res, feeType, 'Fee type retrieved successfully');
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
    // const limit = Math.min(Number(req.query.limit) || 20, 200);
    const limit = Math.min(Number(req.query.limit) || 400, 400);

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

export const updateFeeStructure = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateFeeStructureSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const structure = await feeService.updateFeeStructure(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(res, structure, 'Fee structure updated successfully');
  },
);

export const deleteFeeStructure = catchAsync(
  async (req: Request, res: Response) => {
    await feeService.deleteFeeStructure(req.params.id as string);
    return sendSuccess(res, null, 'Fee structure deleted successfully');
  },
);

export const getApplicableFees = catchAsync(
  async (req: Request, res: Response) => {
    const { classLevelId } = req.params;
    const result = await feeService.getApplicableFees(classLevelId as string);
    return sendSuccess(res, result, 'Applicable fees retrieved successfully');
  },
);

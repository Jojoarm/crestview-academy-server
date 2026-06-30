import type { Request, Response } from 'express';

import { timetableService } from '../services/time-table.service.js';
import {
  createPeriodSlotSchema,
  updatePeriodSlotSchema,
  periodSlotQuerySchema,
  createTimetableEntrySchema,
  updateTimetableEntrySchema,
} from '../middlewares/time-table-validation.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

// Period Slot Controllers

export const createPeriodSlot = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createPeriodSlotSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const slot = await timetableService.createPeriodSlot(parsed.data);
    return sendSuccess(res, slot, 'Period slot created successfully', 201);
  },
);

export const listPeriodSlots = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = periodSlotQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const slots = await timetableService.listPeriodSlots(parsed.data);
    return sendSuccess(res, slots, 'Period slots retrieved successfully');
  },
);

export const updatePeriodSlot = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updatePeriodSlotSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const slot = await timetableService.updatePeriodSlot(
      req.params.id as string,
      parsed.data,
    );
    return sendSuccess(res, slot, 'Period slot updated successfully');
  },
);

export const deletePeriodSlot = catchAsync(
  async (req: Request, res: Response) => {
    await timetableService.deletePeriodSlot(req.params.id as string);
    return sendSuccess(res, null, 'Period slot deleted successfully');
  },
);

// Timetable Entry Controllers

export const createTimetableEntry = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createTimetableEntrySchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const entry = await timetableService.createTimetableEntry(
      req.params.classArmId as string,
      parsed.data,
    );
    return sendSuccess(res, entry, 'Timetable entry created successfully', 201);
  },
);

export const updateTimetableEntry = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateTimetableEntrySchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, parsed.error.issues[0]?.message, 400);

    const entry = await timetableService.updateTimetableEntry(
      req.params.classArmId as string,
      req.params.entryId as string,
      parsed.data,
    );
    return sendSuccess(res, entry, 'Timetable entry updated successfully');
  },
);

export const removeTimetableEntry = catchAsync(
  async (req: Request, res: Response) => {
    await timetableService.removeTimetableEntry(
      req.params.classArmId as string,
      req.params.entryId as string,
    );
    return sendSuccess(res, null, 'Timetable entry removed successfully');
  },
);

export const getTimetable = catchAsync(async (req: Request, res: Response) => {
  const timetable = await timetableService.getTimetable(
    req.params.classArmId as string,
  );
  return sendSuccess(res, timetable, 'Timetable retrieved successfully');
});

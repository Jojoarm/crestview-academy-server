import { Router } from 'express';
import {
  createPeriodSlot,
  listPeriodSlots,
  updatePeriodSlot,
  deletePeriodSlot,
  createTimetableEntry,
  updateTimetableEntry,
  removeTimetableEntry,
  getTimetable,
} from '../controllers/time-table.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const periodSlotRouter = Router();
const classArmTimetableRouter = Router();

periodSlotRouter.use(requireAdmin);
classArmTimetableRouter.use(requireAdmin);

// Period Slot Routes
periodSlotRouter.post('/', createPeriodSlot);
periodSlotRouter.get('/', listPeriodSlots);
periodSlotRouter.patch('/:id', updatePeriodSlot);
periodSlotRouter.delete('/:id', deletePeriodSlot);

// Class Arm Timetable Routes
classArmTimetableRouter.post('/:classArmId/timetable', createTimetableEntry);
classArmTimetableRouter.get('/:classArmId/timetable', getTimetable);
classArmTimetableRouter.patch(
  '/:classArmId/timetable/:entryId',
  updateTimetableEntry,
);
classArmTimetableRouter.delete(
  '/:classArmId/timetable/:entryId',
  removeTimetableEntry,
);

export { periodSlotRouter, classArmTimetableRouter };

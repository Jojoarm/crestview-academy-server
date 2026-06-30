import { Router } from 'express';

import adminRoutes from './routes/admin.routes.js';
import sessionRouter from './routes/session.routes.js';
import classRouter from './routes/class.routes.js';
import armRouter from './routes/arm.routes.js';
import subjectRouter from './routes/subject.routes.js';
import teacherAssignmentRouter from './routes/teacher-assignment.routes.js';
import {
  feeTypeRouter,
  feeStructureRouter,
} from './routes/fee-structure.routes.js';
import {
  periodSlotRouter,
  classArmTimetableRouter,
} from './routes/time-table.routes.js';

const router = Router();

router.use('/', adminRoutes);
router.use('/sessions', sessionRouter);
router.use('/classes', classRouter);
router.use('/arms', armRouter);
router.use('/subjects', subjectRouter);
router.use('/class-arms', teacherAssignmentRouter);
router.use('/class-arms', classArmTimetableRouter);
router.use('/fee-types', feeTypeRouter);
router.use('/fee-structures', feeStructureRouter);
router.use('/period-slots', periodSlotRouter);

export default router;

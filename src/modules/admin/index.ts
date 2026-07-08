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
import postRouter from './routes/post.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import studentRouter from './routes/student.routes.js';
import parentRouter from './routes/parent.routes.js';
import adminProfileRouter from './routes/admin-profile.routes.js';
import { requireAdmin } from '../../middlewares/require-admin.js';
import { getStudentsByClassArm } from './controllers/student.controller.js';

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
router.use('/posts', postRouter);

// Role management routes
router.use('/teachers', teacherRouter);
router.use('/students', studentRouter);
router.use('/parents', parentRouter);
router.use('/admins', adminProfileRouter);

// ─── Class arm students (convenience endpoint)
router.get(
  '/class-arms/:classArmId/students',
  requireAdmin,
  getStudentsByClassArm,
);

export default router;

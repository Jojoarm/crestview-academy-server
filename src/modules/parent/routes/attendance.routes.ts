import { Router } from 'express';
import { getChildAttendance } from '../controllers/attendance.controller.js';

const router = Router();

router.get('/:studentId/attendance', getChildAttendance);

export default router;

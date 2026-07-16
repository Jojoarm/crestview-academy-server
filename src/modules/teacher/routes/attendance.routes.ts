import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';

const router = Router();

router.post('/', attendanceController.markAttendance);
router.get('/', attendanceController.listAttendance);
router.patch('/:id', attendanceController.updateAttendance);

export default router;

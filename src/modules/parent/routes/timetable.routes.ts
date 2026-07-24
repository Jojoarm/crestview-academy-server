import { Router } from 'express';
import { getChildTimetable } from '../controllers/timetable.controller.js';

const router = Router();

router.get('/:studentId/timetable', getChildTimetable);

export default router;

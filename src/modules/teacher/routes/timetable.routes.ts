import { Router } from 'express';
import * as timetableController from '../controllers/timetable.controller.js';

const router = Router();

router.get('/timetable', timetableController.getTimetable);

export default router;

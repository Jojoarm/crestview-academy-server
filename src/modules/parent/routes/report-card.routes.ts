import { Router } from 'express';
import { getChildReportCard } from '../controllers/report-card.controller.js';

const router = Router();

router.get('/:studentId/report-cards', getChildReportCard);

export default router;

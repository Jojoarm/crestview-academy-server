import { Router } from 'express';
import {
  getReportCard,
  publishReportCard,
  unpublishReportCard,
} from '../controllers/report-card.controller.js';

const router = Router();

router.get('/:studentId', getReportCard);
router.patch('/:studentId/publish', publishReportCard);
router.patch('/:studentId/unpublish', unpublishReportCard);

export default router;

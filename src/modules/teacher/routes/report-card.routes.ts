import { Router } from 'express';
import * as reportCardController from '../controllers/report-card.controller.js';

const router = Router();

router.get(
  '/:classArmId/report-cards/:studentId',
  reportCardController.getReportCard,
);
router.patch(
  '/:classArmId/report-cards/:studentId',
  reportCardController.upsertRemark,
);
router.patch(
  '/:classArmId/report-cards/:studentId/publish',
  reportCardController.publishReportCard,
);
router.patch(
  '/:classArmId/report-cards/:studentId/unpublish',
  reportCardController.unpublishReportCard,
);

export default router;

import { Router } from 'express';
import { getChildFees } from '../controllers/fee.controller.js';

const router = Router();

router.get('/:studentId/fees', getChildFees);

export default router;

import { Router } from 'express';
import { requireAuth } from '../../../middlewares/auth.js';

import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/me', authController.getMe);
router.post('/me/clear-force-password', authController.clearForcePassword);

export default router;

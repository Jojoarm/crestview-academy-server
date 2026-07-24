import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', profileController.getProfile);
router.patch('/me', profileController.updateProfile);
router.get('/children', profileController.listChildren);
router.get('/children/:studentId', profileController.getChild);

export default router;

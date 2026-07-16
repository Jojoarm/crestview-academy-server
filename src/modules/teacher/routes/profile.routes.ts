import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', profileController.getProfile);
router.patch('/me', profileController.updateProfile);
router.get('/classes', profileController.getClasses);
router.get('/subjects', profileController.getSubjects);

export default router;

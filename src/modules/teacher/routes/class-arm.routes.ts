import { Router } from 'express';
import * as classArmController from '../controllers/class-arm.controller.js';

const router = Router();

router.get('/:classArmId/students', classArmController.getClassArmStudents);
router.get('/:classArmId/subjects', classArmController.getClassArmSubjects);

export default router;

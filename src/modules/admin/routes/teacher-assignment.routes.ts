import { Router } from 'express';
import {
  assignClassTeacher,
  getClassTeachers,
  removeClassTeacher,
  assignSubjectTeacher,
  removeSubjectTeacher,
  getArmTeachers,
} from '../controllers/teacher-assignment.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

router.use(requireAdmin);

// Class Teacher Routes
router.post('/:classArmId/teacher', assignClassTeacher);
router.get('/:classArmId/teacher', getClassTeachers);
router.delete('/:classArmId/teacher', removeClassTeacher);

// All Teachers for an Arm
router.get('/:classArmId/teachers', getArmTeachers);

// Subject Teacher Routes
router.post('/:classArmId/subjects/:subjectId/teacher', assignSubjectTeacher);
router.delete('/:classArmId/subjects/:subjectId/teacher', removeSubjectTeacher);

export default router;

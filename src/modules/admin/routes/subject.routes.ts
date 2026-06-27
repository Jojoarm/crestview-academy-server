import { Router } from 'express';
import {
  createSubject,
  listSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
  assignToClassLevel,
  updateAssignment,
  removeFromClassLevel,
} from '../controllers/subject.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

router.use(requireAdmin);

// Subject Routes
router.post('/', createSubject);
router.get('/', listSubjects);
router.get('/:id', getSubject);
router.patch('/:id', updateSubject);
router.delete('/:id', deleteSubject);

// Subject-Class Assignment Routes
router.post('/:id/classes', assignToClassLevel);
router.patch('/:id/classes/:classLevelId', updateAssignment);
router.delete('/:id/classes/:classLevelId', removeFromClassLevel);

export default router;

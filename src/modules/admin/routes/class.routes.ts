import { Router } from 'express';
import {
  createClassLevel,
  listClassLevels,
  getClassLevel,
  updateClassLevel,
  deleteClassLevel,
  assignArm,
  updateClassArm,
  removeClassArm,
} from '../controllers/class.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

router.use(requireAdmin);

// Class Level Routes
router.post('/', createClassLevel);
router.get('/', listClassLevels);
router.get('/:id', getClassLevel);
router.patch('/:id', updateClassLevel);
router.delete('/:id', deleteClassLevel);

// Class-Arm Assignment Routes
router.post('/:id/arms', assignArm);
router.patch('/:id/arms/:armId', updateClassArm);
router.delete('/:id/arms/:armId', removeClassArm);

export default router;

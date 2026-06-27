import { Router } from 'express';
import {
  createArm,
  listArms,
  updateArm,
  deleteArm,
} from '../controllers/class.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

router.use(requireAdmin);

router.post('/', createArm);
router.get('/', listArms);
router.patch('/:id', updateArm);
router.delete('/:id', deleteArm);

export default router;

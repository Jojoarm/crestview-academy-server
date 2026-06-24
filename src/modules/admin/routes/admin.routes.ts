import { Router } from 'express';
import {
  requireAdmin,
  requireSuperAdmin,
} from '../../../middlewares/require-admin.js';
import * as adminController from '../controllers/admin.controller.js';
import {
  validateCreateAdmin,
  validateUpdateAdmin,
} from '../middlewares/admin-validator.js';

const router = Router();

// All admin routes require a valid session + admin record
router.use(requireAdmin, requireAdmin);

// Any admin can access their own profile
router.get('/me', adminController.getMe);

// rest actions that requires SUPER_ADMIN
router.use(requireSuperAdmin);

router.get('/', adminController.getAdmins);
router.get('/:id', adminController.getAdmin);
router.post('/', validateCreateAdmin, adminController.createAdmin);
router.patch('/:id', validateUpdateAdmin, adminController.updateAdmin);
router.patch('/:id/deactivate', adminController.deactivateAdmin);
router.delete('/:id', adminController.deleteAdmin);

export default router;

import { Router } from 'express';
import { requireAuth } from '../../../middlewares/auth.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateBanUser,
} from '../middlewares/admin-validator.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All routes require a valid session + admin role
router.use(requireAuth, requireAdmin);

router.get('/me', adminController.getMe);
router.post('/me/clear-force-password', adminController.clearForcePassword);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', validateCreateUser, adminController.createUser);
router.patch('/users/:id', validateUpdateUser, adminController.updateUser);
router.patch('/users/:id/ban', validateBanUser, adminController.banUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;

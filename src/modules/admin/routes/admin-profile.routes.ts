import { Router } from 'express';
import {
  getAdminProfile,
  listAdmins,
  updateAdminProfile,
} from '../controllers/admin-profile.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const adminProfileRouter = Router();
adminProfileRouter.use(requireAdmin);

adminProfileRouter.get('/', listAdmins);
adminProfileRouter.get('/:id', getAdminProfile);
adminProfileRouter.patch('/:id', updateAdminProfile);

export default adminProfileRouter;

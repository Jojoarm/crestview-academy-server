import { Router } from 'express';
import { getDashboardStats } from '../controllers/analytics.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const analyticsRouter = Router();

analyticsRouter.use(requireAdmin);
analyticsRouter.get('/stats', getDashboardStats);

export default analyticsRouter;

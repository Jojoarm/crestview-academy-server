import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/dashboard', dashboardController.getDashboard);

export default router;

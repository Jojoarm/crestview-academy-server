import { Router } from 'express';
import * as academicController from '../controllers/academic.controller.js';

const router = Router();

router.get('/sessions', academicController.listSessions);

export default router;

import { Router } from 'express';
import { getChildAssignments } from '../controllers/assignment.controller.js';

const router = Router();

router.get('/:studentId/assignments', getChildAssignments);

export default router;

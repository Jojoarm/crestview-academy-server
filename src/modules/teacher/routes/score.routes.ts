import { Router } from 'express';
import * as scoreController from '../controllers/score.controller.js';

const router = Router();

router.post('/', scoreController.markScores);
router.get('/', scoreController.listScores);
router.patch('/:id', scoreController.updateScore);

export default router;

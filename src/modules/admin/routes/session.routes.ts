import { Router } from 'express';
import {
  createSession,
  listSessions,
  getActiveSession,
  getSession,
  updateSession,
  activateSession,
  deleteSession,
  createTerm,
  updateTerm,
  activateTerm,
  deleteTerm,
} from '../controllers/session.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const router = Router();

// All session routes require at minimum admin access
router.use(requireAdmin);

// Session Routes
router.post('/', createSession);
router.get('/', listSessions);
router.get('/active', getActiveSession); // must come before /:id
router.get('/:id', getSession);
router.patch('/:id', updateSession);
router.patch('/:id/activate', activateSession);
router.delete('/:id', deleteSession);

// Term Routes
router.post('/:sessionId/terms', createTerm);
router.patch('/:sessionId/terms/:id', updateTerm);
router.patch('/:sessionId/terms/:id/activate', activateTerm);
router.delete('/:sessionId/terms/:id', deleteTerm);

export default router;

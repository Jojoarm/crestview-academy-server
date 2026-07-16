import { Router } from 'express';
import * as assignmentController from '../controllers/assignment.controller.js';

const router = Router();

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.listAssignments);
router.get('/:id', assignmentController.getAssignment);
router.patch('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);
router.get('/:id/submissions', assignmentController.getSubmissions);
router.patch(
  '/:id/submissions/:submissionId',
  assignmentController.gradeSubmission,
);

export default router;

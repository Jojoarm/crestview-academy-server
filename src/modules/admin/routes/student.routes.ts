import { Router } from 'express';
import {
  listStudents,
  getStudent,
  updateStudent,
  deactivateStudent,
  enrollStudent,
  updateEnrollment,
  getEnrollmentHistory,
  linkParent,
  unlinkParent,
  promoteStudent,
  batchPromote,
} from '../controllers/student.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const studentRouter = Router();
studentRouter.use(requireAdmin);

studentRouter.get('/', listStudents);
studentRouter.get('/:id', getStudent);
studentRouter.patch('/:id', updateStudent);
studentRouter.delete('/:id', deactivateStudent);

// Enrollment
studentRouter.post('/:id/enroll', enrollStudent);
studentRouter.patch('/:id/enroll', updateEnrollment);
studentRouter.get('/:id/enrollments', getEnrollmentHistory);

// student promotion
studentRouter.post('/:id/promote', promoteStudent);
studentRouter.post('/promote-batch', batchPromote);

// Parent linking
studentRouter.post('/:id/parents', linkParent);
studentRouter.delete('/:id/parents/:parentId', unlinkParent);

export default studentRouter;

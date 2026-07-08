import { Router } from 'express';
import {
  listTeachers,
  getTeacher,
  updateTeacher,
  deactivateTeacher,
} from '../controllers/teacher.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const teacherRouter = Router();
teacherRouter.use(requireAdmin);

teacherRouter.get('/', listTeachers);
teacherRouter.get('/:id', getTeacher);
teacherRouter.patch('/:id', updateTeacher);
teacherRouter.delete('/:id', deactivateTeacher);

export default teacherRouter;

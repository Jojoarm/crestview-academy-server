import { Router } from 'express';
import assignmentRoutes from './routes/assignment.routes.js';
import profileRoutes from './routes/profile.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import classArmRoutes from './routes/class-arm.routes.js';
import scoreRoutes from './routes/score.routes.js';

import { requireAuth } from '../../middlewares/auth.js';
import { requireTeacher } from './middlewares/requireTeacher.js';
import { loadTeacherContext } from './middlewares/loadTeacherContext.js';

const teacherRouter = Router();

teacherRouter.use(requireAuth, requireTeacher, loadTeacherContext);

teacherRouter.use('/', profileRoutes);
teacherRouter.use('/assignments', assignmentRoutes);
teacherRouter.use('/attendance', attendanceRoutes);
teacherRouter.use('/class-arms', classArmRoutes);
teacherRouter.use('/scores', scoreRoutes);

export default teacherRouter;

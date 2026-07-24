import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { requireParent } from './middlewares/require-parent.js';
import { loadParentContext } from './middlewares/load-parent-context.js';
import parentProfileRoutes from './routes/profile.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import reportCardRoutes from './routes/report-card.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import feeRoutes from './routes/fee.routes.js';
import postRoutes from './routes/post.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const parentRouter = Router();
parentRouter.use(requireAuth, requireParent, loadParentContext);
parentRouter.use('/', parentProfileRoutes);
parentRouter.use('/children', attendanceRoutes);
parentRouter.use('/children', reportCardRoutes);
parentRouter.use('/children', timetableRoutes);
parentRouter.use('/children', assignmentRoutes);
parentRouter.use('/children', feeRoutes);
parentRouter.use('/posts', postRoutes);
parentRouter.use('/dashboard', dashboardRoutes);

export default parentRouter;

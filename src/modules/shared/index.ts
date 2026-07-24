import { Router } from 'express';
import academicRoutes from './routes/academic.routes.js';

import { requireAuth } from '../../middlewares/auth.js';

const sharedRouter = Router();

sharedRouter.use(requireAuth);

sharedRouter.use('/', academicRoutes);

export default sharedRouter;

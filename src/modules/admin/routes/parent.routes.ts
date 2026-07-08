import { Router } from 'express';
import {
  listParents,
  getParent,
  updateParent,
  deactivateParent,
} from '../controllers/parent.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const parentRouter = Router();
parentRouter.use(requireAdmin);

parentRouter.get('/', listParents);
parentRouter.get('/:id', getParent);
parentRouter.patch('/:id', updateParent);
parentRouter.delete('/:id', deactivateParent);

export default parentRouter;

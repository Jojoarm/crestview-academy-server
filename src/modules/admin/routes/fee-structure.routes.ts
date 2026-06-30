import { Router } from 'express';
import {
  createFeeType,
  listFeeTypes,
  updateFeeType,
  deleteFeeType,
  createFeeStructure,
  listFeeStructures,
  getFeeStructure,
  deleteFeeStructure,
  addFeeStructureItem,
  updateFeeStructureItem,
  removeFeeStructureItem,
} from '../controllers/fee-structure.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const feeTypeRouter = Router();
const feeStructureRouter = Router();

feeTypeRouter.use(requireAdmin);
feeStructureRouter.use(requireAdmin);

// Fee Type Routes
feeTypeRouter.post('/', createFeeType);
feeTypeRouter.get('/', listFeeTypes);
feeTypeRouter.patch('/:id', updateFeeType);
feeTypeRouter.delete('/:id', deleteFeeType);

// Fee Structure Routes
feeStructureRouter.post('/', createFeeStructure);
feeStructureRouter.get('/', listFeeStructures);
feeStructureRouter.get('/:id', getFeeStructure);
feeStructureRouter.delete('/:id', deleteFeeStructure);

// Fee Structure Item Routes
feeStructureRouter.post('/:id/items', addFeeStructureItem);
feeStructureRouter.patch('/:id/items/:itemId', updateFeeStructureItem);
feeStructureRouter.delete('/:id/items/:itemId', removeFeeStructureItem);

export { feeTypeRouter, feeStructureRouter };

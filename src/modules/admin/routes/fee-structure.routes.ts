import { Router } from 'express';
import {
  createFeeType,
  listFeeTypes,
  getFeeType,
  updateFeeType,
  deleteFeeType,
  createFeeStructure,
  listFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getApplicableFees,
  getAllFeeStructures,
} from '../controllers/fee-structure.controller.js';
import { requireAdmin } from '../../../middlewares/require-admin.js';

const feeTypeRouter = Router();
const feeStructureRouter = Router();

feeTypeRouter.use(requireAdmin);
feeStructureRouter.use(requireAdmin);

// Fee Type Routes
feeTypeRouter.post('/', createFeeType);
feeTypeRouter.get('/', listFeeTypes);
feeTypeRouter.get('/:id', getFeeType);
feeTypeRouter.patch('/:id', updateFeeType);
feeTypeRouter.delete('/:id', deleteFeeType);

// Fee Structure Routes
feeStructureRouter.post('/', createFeeStructure);
feeStructureRouter.get('/', listFeeStructures);
feeStructureRouter.get('/all', getAllFeeStructures);
feeStructureRouter.get('/:id', getFeeStructure);
feeStructureRouter.patch('/:id', updateFeeStructure);
feeStructureRouter.delete('/:id', deleteFeeStructure);

// Applicable fees for a class level (used by payment tracking)
feeStructureRouter.get('/class/:classLevelId/applicable', getApplicableFees);

export { feeTypeRouter, feeStructureRouter };

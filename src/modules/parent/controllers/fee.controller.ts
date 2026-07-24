import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentFeeService } from '../services/fee.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const getChildFees = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const result = await parentFeeService.getChildFees(parentId, studentId);

  return sendSuccess(res, result, 'Fees retrieved successfully');
});

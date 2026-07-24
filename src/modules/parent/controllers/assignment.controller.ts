import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentAssignmentQuerySchema } from '../validations/assignment.validation.js';
import { parentAssignmentService } from '../services/assignment.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const getChildAssignments = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const parsed = parentAssignmentQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await parentAssignmentService.getChildAssignments(
    parentId,
    studentId,
    parsed.data,
  );

  return sendSuccess(res, result, 'Assignments retrieved successfully');
});

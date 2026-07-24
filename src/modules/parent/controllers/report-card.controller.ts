import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { requireParentId } from '../lib/utils.js';
import { parentReportCardQuerySchema } from '../validations/report-card.validation.js';
import { parentReportCardService } from '../services/report-card.service.js';
import { requireParam } from '../../../utils/require-params.js';

export const getChildReportCard = catchAsync(async (req, res) => {
  const parentId = requireParentId(req);
  const studentId = requireParam(req, 'studentId');

  const parsed = parentReportCardQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await parentReportCardService.getChildReportCard(
    parentId,
    studentId,
    parsed.data,
  );

  return sendSuccess(res, result, 'Report card retrieved successfully');
});

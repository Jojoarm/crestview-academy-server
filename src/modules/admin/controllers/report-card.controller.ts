import { catchAsync } from '../../../utils/catch-async.js';
import { sendSuccess, sendError } from '../../../utils/api-response.js';
import { adminReportCardService } from '../services/report-card.service.js';
import { requireParam } from '../../../utils/require-params.js';
import { reportCardQuerySchema } from '../middlewares/report-card-validation.js';

export const getReportCard = catchAsync(async (req, res) => {
  const studentId = requireParam(req, 'studentId');

  const parsed = reportCardQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await adminReportCardService.getReportCard(
    studentId,
    parsed.data.termId,
    parsed.data.sessionId,
  );
  return sendSuccess(res, result, 'Report card retrieved successfully');
});

export const publishReportCard = catchAsync(async (req, res) => {
  const studentId = requireParam(req, 'studentId');

  const parsed = reportCardQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await adminReportCardService.publish(
    studentId,
    parsed.data.termId,
    parsed.data.sessionId,
  );
  return sendSuccess(res, result, 'Report card published successfully');
});

export const unpublishReportCard = catchAsync(async (req, res) => {
  const studentId = requireParam(req, 'studentId');

  const parsed = reportCardQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const result = await adminReportCardService.unpublish(
    studentId,
    parsed.data.termId,
    parsed.data.sessionId,
  );
  return sendSuccess(res, result, 'Report card unpublished successfully');
});

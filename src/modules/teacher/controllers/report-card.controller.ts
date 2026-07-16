import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { catchAsync } from '../../../utils/catch-async.js';
import { requireParam } from '../../../utils/require-params.js';
import { requireTeacherId } from '../lib/utils.js';
import { teacherReportCardService } from '../services/report-card.service.js';
import {
  reportCardQuerySchema,
  upsertRemarkSchema,
} from '../validations/report-card.validation.js';

function getQueryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export const getReportCard = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');
  const studentId = requireParam(req, 'studentId');

  const parsed = reportCardQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const reportCard = await teacherReportCardService.getReportCard(
    teacherId,
    classArmId,
    studentId,
    parsed.data.termId,
    parsed.data.sessionId,
  );

  return sendSuccess(res, reportCard, 'Report card retrieved successfully');
});

export const upsertRemark = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');
  const studentId = requireParam(req, 'studentId');

  const parsed = upsertRemarkSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(res, parsed.error.issues[0]?.message, 400);

  const reportCard = await teacherReportCardService.upsertRemark(
    teacherId,
    classArmId,
    studentId,
    parsed.data,
  );

  return sendSuccess(res, reportCard, 'Remark saved successfully');
});

export const publishReportCard = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');
  const studentId = requireParam(req, 'studentId');
  const termId = getQueryString(req.query.termId);
  const sessionId = getQueryString(req.query.sessionId);

  const reportCard = await teacherReportCardService.publish(
    teacherId,
    classArmId,
    studentId,
    termId,
    sessionId,
  );

  return sendSuccess(res, reportCard, 'Report card published successfully');
});

export const unpublishReportCard = catchAsync(async (req, res) => {
  const teacherId = requireTeacherId(req);
  const classArmId = requireParam(req, 'classArmId');
  const studentId = requireParam(req, 'studentId');
  const termId = getQueryString(req.query.termId);
  const sessionId = getQueryString(req.query.sessionId);

  const reportCard = await teacherReportCardService.unpublish(
    teacherId,
    classArmId,
    studentId,
    termId,
    sessionId,
  );

  return sendSuccess(res, reportCard, 'Report card reverted to draft');
});

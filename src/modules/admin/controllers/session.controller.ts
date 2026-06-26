import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async.js';
import {
  createSessionSchema,
  createTermSchema,
  updateSessionSchema,
  updateTermSchema,
} from '../middlewares/session-validation.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { sessionService } from '../services/session.service.js';

export const createSession = catchAsync(async (req: Request, res: Response) => {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.issues[0]?.message ?? 'Validation failed',
      400,
    );
  }

  const session = await sessionService.createSession(parsed.data);
  return sendSuccess(
    res,
    session,
    'Academic session created successfully',
    201,
  );
});

// get all academic sessions
export const listSessions = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const sessions = await sessionService.listSessions({ page, limit });

  return sendSuccess(res, sessions, 'Academic Sessions retrieved successfully');
});

// get active session
export const getActiveSession = catchAsync(
  async (_req: Request, res: Response) => {
    const session = await sessionService.getActiveSession();

    return sendSuccess(res, session, 'Active session retrieved successfully');
  },
);

// get session by id
export const getSession = catchAsync(async (req: Request, res: Response) => {
  const session = await sessionService.getSessionById(req.params.id as string);
  return sendSuccess(res, session, 'Session retrieved successfully');
});

// update session
export const updateSession = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateSessionSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      parsed.error.issues[0]?.message ?? 'Validation failed',
      400,
    );

  const session = await sessionService.updateSession(
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, session, 'Session updated successfully');
});

// activate session
export const activateSession = catchAsync(
  async (req: Request, res: Response) => {
    const session = await sessionService.activateSession(
      req.params.id as string,
    );
    return sendSuccess(res, session, 'Session activated successfully');
  },
);

export const deleteSession = catchAsync(async (req: Request, res: Response) => {
  await sessionService.deleteSession(req.params.id as string);
  return sendSuccess(res, null, 'Session deleted successfully');
});

// Term Controllers
// Create term
export const createTerm = catchAsync(async (req: Request, res: Response) => {
  const parsed = createTermSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      parsed.error.issues[0]?.message ?? 'Validation failed',
      400,
    );

  const term = await sessionService.createTerm(
    req.params.sessionId as string,
    parsed.data,
  );
  return sendSuccess(res, term, 'Term created successfully', 201);
});

// update term
export const updateTerm = catchAsync(async (req: Request, res: Response) => {
  const parsed = updateTermSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      parsed.error.issues[0]?.message ?? 'Validation failed',
      400,
    );

  const term = await sessionService.updateTerm(
    req.params.sessionId as string,
    req.params.id as string,
    parsed.data,
  );
  return sendSuccess(res, term, 'Term updated successfully');
});

// activate term
export const activateTerm = catchAsync(async (req: Request, res: Response) => {
  const term = await sessionService.activateTerm(
    req.params.sessionId as string,
    req.params.id as string,
  );
  return sendSuccess(res, term, 'Term activated successfully');
});

// delete term
export const deleteTerm = catchAsync(async (req: Request, res: Response) => {
  await sessionService.deleteTerm(
    req.params.sessionId as string,
    req.params.id as string,
  );
  return sendSuccess(res, null, 'Term deleted successfully');
});

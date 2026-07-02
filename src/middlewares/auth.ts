import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/better.auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Cookie header:', req.headers.cookie);
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - no valid session',
      });
    }

    console.log(session);

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(error);
  }
};

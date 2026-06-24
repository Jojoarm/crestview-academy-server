import type { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.js';
import { Prisma } from '../generated/prisma/client.js';
import { success } from 'zod';
import { env } from '../utils/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`[ERROR] ${req.method} ${req.path}`, err);

  // prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        field: err.meta?.target,
      });
    }
    if ((err.code = 'P2025')) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  //prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
  }

  //  generic errors
  const statusCode = (err as any).statusCode ?? 500;
  return res.status(statusCode).json({
    success: false,
    message:
      env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};

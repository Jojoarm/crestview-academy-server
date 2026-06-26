import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { env } from '../utils/env.js';
import logger from '../utils/logger.js';

// App Error

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const createAppError = (
  message: string,
  statusCode = 500,
  isOperational = true,
): AppError => {
  const error = new Error(message) as AppError;

  error.statusCode = statusCode;
  error.isOperational = isOperational;

  Error.captureStackTrace(error, createAppError);

  return error;
};

export const createError = (message: string, statusCode = 500) =>
  createAppError(message, statusCode);

//  Logging Helpers
const shouldLogError = (
  err: Error & Partial<AppError>,
  status: number,
): boolean => {
  // Always log in development
  if (env.NODE_ENV !== 'production') return true;

  // Always log server errors
  if (status >= 500) return true;

  // Log unexpected client errors
  if (status >= 400 && !err.isOperational) return true;

  // Ignore expected operational errors (404, 409, etc.)
  return false;
};

// Error Handler

export const errorHandler = (
  err: Error & Partial<AppError>,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let status = err.statusCode ?? 500;
  let message = err.message;

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        status = 409;
        message = 'A record with this value already exists';
        break;

      case 'P2025':
        status = 404;
        message = 'Record not found';
        break;

      default:
        status = 400;
        message = err.message;
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    status = 400;
    message = 'Invalid data provided';
  }

  // Log if necessary
  if (shouldLogError(err, status)) {
    const logData = {
      status,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      message: err.message,
      stack: err.stack,
    };

    if (status >= 500) {
      logger.error(logData);
    } else {
      logger.warn(logData);
    }
  }

  // Don't leak server errors in production
  const clientMessage =
    status >= 500 && env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : message;

  return res.status(status).json({
    success: false,
    message: clientMessage,
    ...(env.NODE_ENV !== 'production' && {
      stack: err.stack,
    }),
  });
};

// 404 Handler
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

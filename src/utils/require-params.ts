import type { Request } from 'express';
import { createError } from '../middlewares/error-handler.js';

export function requireParam(req: Request, key: string): string {
  const value = req.params[key];

  if (!value || Array.isArray(value)) {
    throw createError(`Missing or invalid route parameter: ${key}`, 400);
  }

  return value;
}

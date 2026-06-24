import type { Response } from 'express';
import type { ApiResponse } from '../types/common.types.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response => {
  const response: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
): Response => {
  const response: ApiResponse = { success: false, message };
  return res.status(statusCode).json(response);
};

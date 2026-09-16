import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled server error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error in request payload', 400, 'VALIDATION_ERROR', err.issues);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A unique constraint violation occurred in database', 409, 'CONFLICT');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred';

  return sendError(res, message, statusCode, 'INTERNAL_SERVER_ERROR', err.details);
}

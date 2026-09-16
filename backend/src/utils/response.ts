import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  meta?: any;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200, meta?: any) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
}

export function sendError(res: Response, message: string, statusCode = 400, errorCode?: string, details?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode: errorCode || `ERR_${statusCode}`,
    ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
  });
}

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to access this resource', 403, 'FORBIDDEN');
    }

    next();
  };
}

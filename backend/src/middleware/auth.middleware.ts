import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'CONSUMER' | 'INDUSTRY_USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    
    // Attach basic user info from token
    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Token is invalid or expired', 401, 'INVALID_TOKEN');
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Optional auth, continue anonymously if token invalid
  }
  next();
}

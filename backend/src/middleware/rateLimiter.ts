import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

export function rateLimiter(options: { windowMs?: number; maxRequests?: number } = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute window
  const maxRequests = options.maxRequests || 60; // 60 requests per minute

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return sendError(
        res,
        'Too many requests. Please slow down and try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    record.count++;
    next();
  };
}

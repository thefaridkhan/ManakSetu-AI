import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all previous directions/i,
  /system prompt override/i,
  /you are no longer bis/i,
  /reveal your developer prompt/i,
  /jailbreak/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
];

export function promptInjectionGuard(req: Request, res: Response, next: NextFunction) {
  const content = req.body?.message || req.body?.query || req.body?.content;

  if (typeof content === 'string') {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(content)) {
        return sendError(
          res,
          'Your request contains disallowed security patterns or injection attempts. Please rephrase your BIS inquiry.',
          400,
          'PROMPT_SECURITY_VIOLATION'
        );
      }
    }
  }

  next();
}

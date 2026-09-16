import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['CONSUMER', 'INDUSTRY_USER', 'ADMIN']).optional(),
  organization: z.string().optional(),
  industryType: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400, 'VALIDATION_ERROR');
      }
      return sendError(res, error.message, 400, 'REGISTER_FAILED');
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400, 'VALIDATION_ERROR');
      }
      return sendError(res, error.message, 401, 'LOGIN_FAILED');
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }
      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user, 'User profile fetched');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'USER_NOT_FOUND');
    }
  }
}

export const authController = new AuthController();

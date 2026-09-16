import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { feedbackService } from '../services/feedback.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const feedbackSchema = z.object({
  messageId: z.string().optional(),
  rating: z.number().min(1).max(5),
  citationAccuracy: z.boolean().optional(),
  comment: z.string().optional(),
  query: z.string().optional()
});

export class FeedbackController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = feedbackSchema.parse(req.body);
      const feedback = await feedbackService.submitFeedback({
        ...validated,
        userId: req.user?.id
      });
      return sendSuccess(res, feedback, 'Feedback recorded successfully', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400, 'VALIDATION_ERROR');
      }
      return sendError(res, error.message, 500);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const feedbackList = await feedbackService.getRecentFeedback(limit);
      return sendSuccess(res, feedbackList, 'Recent feedback retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const feedbackController = new FeedbackController();

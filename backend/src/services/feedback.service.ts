import { prisma } from '../config/prisma.js';

export interface SubmitFeedbackInput {
  userId?: string;
  messageId?: string;
  rating: number;
  citationAccuracy?: boolean;
  comment?: string;
  query?: string;
}

export class FeedbackService {
  async submitFeedback(input: SubmitFeedbackInput) {
    return prisma.feedback.create({
      data: {
        userId: input.userId || null,
        messageId: input.messageId || null,
        rating: input.rating,
        citationAccuracy: input.citationAccuracy !== undefined ? input.citationAccuracy : true,
        comment: input.comment || null,
        query: input.query || null
      }
    });
  }

  async getRecentFeedback(limit = 20) {
    return prisma.feedback.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
  }
}

export const feedbackService = new FeedbackService();

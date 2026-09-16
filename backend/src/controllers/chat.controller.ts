import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { chatService } from '../services/chat.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const messageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional()
});

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = messageSchema.parse(req.body);
      const result = await chatService.sendMessage({
        message: validated.message,
        conversationId: validated.conversationId,
        userId: req.user?.id
      });

      return sendSuccess(res, result, 'Response generated successfully');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400, 'VALIDATION_ERROR');
      }
      return sendError(res, error.message, 500, 'CHAT_GENERATION_FAILED');
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await chatService.getConversations(req.user?.id);
      return sendSuccess(res, conversations, 'Conversations retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await chatService.getConversationById(req.params.id);
      return sendSuccess(res, conversation, 'Conversation details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'CONVERSATION_NOT_FOUND');
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      await chatService.deleteConversation(req.params.id);
      return sendSuccess(res, { deleted: true }, 'Conversation deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const chatController = new ChatController();

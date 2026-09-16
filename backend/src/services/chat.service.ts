import { prisma } from '../config/prisma.js';
import { ragService, RAGResponse } from '../ai/rag/ragService.js';
import { logger } from '../config/logger.js';

export interface SendMessageInput {
  conversationId?: string;
  message: string;
  userId?: string;
}

export class ChatService {
  async sendMessage(input: SendMessageInput) {
    const startTime = Date.now();
    let conversationId = input.conversationId;

    // 1. Create conversation if not provided
    if (!conversationId) {
      const title = input.message.length > 40 ? `${input.message.substring(0, 37)}...` : input.message;
      const conversation = await prisma.conversation.create({
        data: {
          title,
          userId: input.userId || null
        }
      });
      conversationId = conversation.id;
    }

    // 2. Fetch past conversation history for context
    const pastMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 12
    });

    const conversationHistory = pastMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // 3. Save User Message
    await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: input.message
      }
    });

    // 4. Generate RAG Answer
    const ragResult: RAGResponse = await ragService.generateAnswer(input.message, conversationHistory);

    // 5. Save Assistant Response with Citations
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: ragResult.answer,
        language: ragResult.language,
        intent: ragResult.intent,
        citations: ragResult.citations as any,
        confidence: ragResult.confidence
      }
    });

    // 6. Asynchronously record retrieval telemetry
    const latencyMs = Date.now() - startTime;
    prisma.retrievalLog.create({
      data: {
        query: input.message,
        intent: ragResult.intent,
        topSources: ragResult.citations as any,
        avgScore: ragResult.confidence,
        latencyMs
      }
    }).catch(err => logger.warn('Failed to record retrieval telemetry log', { error: err.message }));

    return {
      conversationId,
      messageId: assistantMessage.id,
      answer: ragResult.answer,
      citations: ragResult.citations,
      intent: ragResult.intent,
      language: ragResult.language,
      confidence: ragResult.confidence,
      suggestedQuestions: ragResult.suggestedQuestions,
      latencyMs
    };
  }

  async getConversations(userId?: string) {
    return prisma.conversation.findMany({
      where: userId ? { userId } : {},
      orderBy: { updatedAt: 'desc' },
      take: 30,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async getConversationById(id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  async deleteConversation(id: string) {
    return prisma.conversation.delete({
      where: { id }
    });
  }
}

export const chatService = new ChatService();

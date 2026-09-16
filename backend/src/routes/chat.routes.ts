import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { promptInjectionGuard } from '../middleware/security.js';

const router = Router();

router.post('/', rateLimiter({ maxRequests: 40 }), promptInjectionGuard, optionalAuthMiddleware, chatController.sendMessage);
router.get('/conversations', optionalAuthMiddleware, chatController.getConversations);
router.get('/conversations/:id', optionalAuthMiddleware, chatController.getConversation);
router.delete('/conversations/:id', optionalAuthMiddleware, chatController.deleteConversation);

export default router;

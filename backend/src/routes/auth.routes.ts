import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', rateLimiter({ maxRequests: 20 }), authController.register);
router.post('/login', rateLimiter({ maxRequests: 30 }), authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;

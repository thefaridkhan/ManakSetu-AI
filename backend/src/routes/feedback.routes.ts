import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', optionalAuthMiddleware, feedbackController.submit);
router.get('/recent', feedbackController.getRecent);

export default router;

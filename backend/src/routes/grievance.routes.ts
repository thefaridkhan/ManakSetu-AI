import { Router } from 'express';
import { grievanceController } from '../controllers/grievance.controller.js';

const router = Router();

router.get('/guides', grievanceController.getGuides);
router.get('/guides/:id', grievanceController.getGuideById);

export default router;

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/role.middleware.js';

const router = Router();

// Allow reading telemetry or guard with admin role
router.get('/telemetry', adminController.getTelemetry);
router.get('/documents', adminController.getDocuments);
router.get('/jobs', adminController.getJobs);
router.post('/ingestion/run', authMiddleware, requireRoles('ADMIN'), adminController.triggerIngestion);

export default router;

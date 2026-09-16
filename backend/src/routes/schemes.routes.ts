import { Router } from 'express';
import { schemesController } from '../controllers/schemes.controller.js';

const router = Router();

router.get('/', schemesController.getSchemes);
router.get('/:code', schemesController.getScheme);
router.post('/checklist/generate', schemesController.generateChecklist);

export default router;

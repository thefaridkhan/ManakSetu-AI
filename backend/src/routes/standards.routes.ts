import { Router } from 'express';
import { standardsController } from '../controllers/standards.controller.js';

const router = Router();

router.get('/search', standardsController.search);
router.get('/sectors', standardsController.getSectors);
router.get('/:id', standardsController.getById);

export default router;

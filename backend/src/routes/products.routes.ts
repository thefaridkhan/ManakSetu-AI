import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';

const router = Router();

router.get('/search', productsController.search);
router.get('/:id', productsController.getById);

export default router;

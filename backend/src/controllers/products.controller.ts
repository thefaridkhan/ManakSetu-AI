import { Request, Response, NextFunction } from 'express';
import { productsService } from '../services/products.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ProductsController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, category } = req.query;
      const products = await productsService.searchProducts(q as string, category as string);
      return sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getProductById(req.params.id);
      return sendSuccess(res, product, 'Product details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'PRODUCT_NOT_FOUND');
    }
  }
}

export const productsController = new ProductsController();

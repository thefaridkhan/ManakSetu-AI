import { prisma } from '../config/prisma.js';

export class ProductsService {
  async searchProducts(query?: string, category?: string) {
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = { contains: category };
    }

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { applicableStandard: { contains: q } },
        { hsCode: { contains: q } },
        { description: { contains: q } }
      ];
    }

    return prisma.product.findMany({
      where,
      orderBy: { isMandatory: 'desc' }
    });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Fetch matching standard if exists
    const matchingStandard = await prisma.standard.findFirst({
      where: { isNumber: { contains: product.applicableStandard } }
    });

    return {
      ...product,
      matchingStandard
    };
  }
}

export const productsService = new ProductsService();

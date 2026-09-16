import { prisma } from '../config/prisma.js';

export class GrievanceService {
  async getGuides(category?: string) {
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }

    return prisma.grievanceGuide.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  async getGuideById(id: string) {
    const guide = await prisma.grievanceGuide.findUnique({
      where: { id }
    });

    if (!guide) {
      throw new Error('Grievance guide not found');
    }

    return guide;
  }
}

export const grievanceService = new GrievanceService();

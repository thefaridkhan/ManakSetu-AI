import { prisma } from '../config/prisma.js';

export interface StandardFilter {
  query?: string;
  sector?: string;
  isMandatoryQCO?: boolean;
  schemeType?: string;
  limit?: number;
  offset?: number;
}

export class StandardsService {
  async searchStandards(filter: StandardFilter) {
    const { query, sector, isMandatoryQCO, schemeType, limit = 20, offset = 0 } = filter;

    const where: any = {
      status: 'ACTIVE'
    };

    if (sector && sector !== 'ALL') {
      where.sector = { contains: sector };
    }

    if (isMandatoryQCO !== undefined) {
      where.isMandatoryQCO = isMandatoryQCO;
    }

    if (schemeType && schemeType !== 'ALL') {
      where.schemeType = schemeType;
    }

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { isNumber: { contains: q } },
        { title: { contains: q } },
        { hindiTitle: { contains: q } },
        { scope: { contains: q } },
        { standardNo: { contains: q } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.standard.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isMandatoryQCO: 'desc' }, { year: 'desc' }]
      }),
      prisma.standard.count({ where })
    ]);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total
    };
  }

  async getStandardById(id: string) {
    const standard = await prisma.standard.findFirst({
      where: {
        OR: [
          { id },
          { isNumber: id },
          { standardNo: id }
        ]
      }
    });

    if (!standard) {
      throw new Error(`Indian Standard '${id}' not found`);
    }

    // Also look up any related chunks or products
    const relatedProducts = await prisma.product.findMany({
      where: { applicableStandard: { contains: standard.standardNo } }
    });

    return {
      ...standard,
      relatedProducts
    };
  }

  async getSectors() {
    const sectors = await prisma.standard.findMany({
      select: { sector: true },
      distinct: ['sector']
    });

    return sectors.map(s => s.sector);
  }
}

export const standardsService = new StandardsService();

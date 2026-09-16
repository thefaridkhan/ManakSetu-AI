import { Request, Response, NextFunction } from 'express';
import { standardsService } from '../services/standards.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class StandardsController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, sector, mandatory, scheme, limit, offset } = req.query;

      const results = await standardsService.searchStandards({
        query: q as string,
        sector: sector as string,
        isMandatoryQCO: mandatory === 'true' ? true : mandatory === 'false' ? false : undefined,
        schemeType: scheme as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0
      });

      return sendSuccess(res, results, 'Standards retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await standardsService.getStandardById(req.params.id);
      return sendSuccess(res, result, 'Standard details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'STANDARD_NOT_FOUND');
    }
  }

  async getSectors(req: Request, res: Response, next: NextFunction) {
    try {
      const sectors = await standardsService.getSectors();
      return sendSuccess(res, sectors, 'Sectors retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const standardsController = new StandardsController();

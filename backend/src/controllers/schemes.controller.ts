import { Request, Response, NextFunction } from 'express';
import { schemesService } from '../services/schemes.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class SchemesController {
  async getSchemes(req: Request, res: Response, next: NextFunction) {
    try {
      const schemes = await schemesService.getSchemes();
      return sendSuccess(res, schemes, 'Certification schemes retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getScheme(req: Request, res: Response, next: NextFunction) {
    try {
      const scheme = await schemesService.getSchemeByCode(req.params.code as any);
      return sendSuccess(res, scheme, 'Scheme details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'SCHEME_NOT_FOUND');
    }
  }

  async generateChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { standardNo, productName, scale } = req.body;
      if (!standardNo) {
        return sendError(res, 'standardNo is required to generate compliance roadmap', 400);
      }

      const checklist = await schemesService.generateChecklist({
        standardNo,
        productName,
        scale
      });

      return sendSuccess(res, checklist, 'Compliance checklist generated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const schemesController = new SchemesController();

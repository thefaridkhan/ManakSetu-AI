import { Request, Response, NextFunction } from 'express';
import { grievanceService } from '../services/grievance.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class GrievanceController {
  async getGuides(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const guides = await grievanceService.getGuides(category as string);
      return sendSuccess(res, guides, 'Grievance guides retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getGuideById(req: Request, res: Response, next: NextFunction) {
    try {
      const guide = await grievanceService.getGuideById(req.params.id);
      return sendSuccess(res, guide, 'Grievance guide details retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 404, 'GUIDE_NOT_FOUND');
    }
  }
}

export const grievanceController = new GrievanceController();

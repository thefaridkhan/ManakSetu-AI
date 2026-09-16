import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AdminController {
  async getTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getTelemetryStats();
      return sendSuccess(res, stats, 'Admin telemetry stats retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const data = await adminService.getDocuments(
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 20
      );
      return sendSuccess(res, data, 'Documents retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const data = await adminService.getJobs(
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 15
      );
      return sendSuccess(res, data, 'Ingestion jobs retrieved');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async triggerIngestion(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await adminService.triggerManualIngestion();
      return sendSuccess(res, job, 'Ingestion job launched in background', 202);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();

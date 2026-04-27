import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { dashboardService } from "../services/adminDashboard.service";

export class DashboardController {
  async getPublicStats(req: Request, res: Response) {
    const data = await dashboardService.getPublicStats();

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getAdminDashboard(req: AuthRequest, res: Response) {
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate && typeof startDate === 'string') {
      start = new Date(startDate);
    }
    if (endDate && typeof endDate === 'string') {
      end = new Date(endDate);
    }

    const data = await dashboardService.getAdminDashboard(start, end);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getRecentUsers(req: AuthRequest, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getRecentUsers(limit);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getRecentGuides(req: AuthRequest, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getRecentGuides(limit);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getRecentAlerts(req: AuthRequest, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getRecentAlerts(limit);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getPendingGuides(req: AuthRequest, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getPendingGuides(limit);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getGuideDashboard(req: AuthRequest, res: Response) {
    const guideId = req.userId!;

    const data = await dashboardService.getGuideDashboard(guideId);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getUserDashboard(req: AuthRequest, res: Response) {
    const userId = req.userId!;

    const data = await dashboardService.getUserDashboard(userId);

    res.status(200).json({
      success: true,
      data,
    });
  }
}

export const dashboardController = new DashboardController();

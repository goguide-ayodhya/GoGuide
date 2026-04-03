import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { dashboardService } from "../services/adminDashboard.service";

export class DashboardController {
  async getAdminDashboard(req: AuthRequest, res: Response) {
    const data = await dashboardService.getAdminDashboard();

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

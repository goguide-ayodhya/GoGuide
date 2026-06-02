import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { adminSettingsService } from "../services/adminSettings.service";

export class AdminSettingsController {
  async getSettings(req: AuthRequest, res: Response) {
    const settings = await adminSettingsService.getSettings();
    res.status(200).json({ success: true, data: settings });
  }

  async updateCommissionPercent(req: AuthRequest, res: Response) {
    const { driverCommissionPercent } = req.body;

    if (driverCommissionPercent === undefined || driverCommissionPercent === null) {
      return res.status(400).json({
        success: false,
        message: "driverCommissionPercent is required",
      });
    }

    if (typeof driverCommissionPercent !== "number") {
      return res.status(400).json({
        success: false,
        message: "driverCommissionPercent must be a number",
      });
    }

    try {
      const settings = await adminSettingsService.updateCommissionPercent(
        driverCommissionPercent,
        req.userId!
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update settings",
      });
    }
  }
}

export const adminSettingsController = new AdminSettingsController();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { adminSettingsService } from "../services/adminSettings.service";
import { uploadBufferToStorage } from "../services/fileUpload.service";

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

  async updateGuidePricing(req: AuthRequest, res: Response) {
    const { guidePricing } = req.body;
    if (!guidePricing) {
      return res.status(400).json({
        success: false,
        message: "guidePricing is required",
      });
    }

    try {
      const settings = await adminSettingsService.updateGuidePricing(
        guidePricing,
        req.userId!
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update guide pricing",
      });
    }
  }

  async updateLocations(req: AuthRequest, res: Response) {
    const { locations, halfDayLocations, fullDayLocations } = req.body;
    const locationPayload = Array.isArray(locations)
      ? locations
      : locations && typeof locations === "object" && !Array.isArray(locations)
        ? locations
        : {
            halfDay: Array.isArray(halfDayLocations) ? halfDayLocations : [],
            fullDay: Array.isArray(fullDayLocations) ? fullDayLocations : [],
          };

    if (!Array.isArray(locationPayload) && (!locationPayload || typeof locationPayload !== "object")) {
      return res.status(400).json({
        success: false,
        message: "locations must be an array or an object with halfDay/fullDay arrays",
      });
    }

    try {
      const settings = await adminSettingsService.updateLocations(
        locationPayload,
        req.userId!
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update locations",
      });
    }
  }

  async updateVehicleTypes(req: AuthRequest, res: Response) {
    const { vehicleTypes } = req.body;
    if (!Array.isArray(vehicleTypes)) {
      return res.status(400).json({
        success: false,
        message: "vehicleTypes must be an array",
      });
    }

    try {
      const settings = await adminSettingsService.updateVehicleTypes(
        vehicleTypes,
        req.userId!
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update vehicle types",
      });
    }
  }

  async updatePaymentQR(req: AuthRequest, res: Response) {
    try {
      // If a file was uploaded via multipart/form-data, use it.
      let urlToSave = "";
      const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;
      if (files && files.paymentQRFile && files.paymentQRFile.length > 0) {
        const f = files.paymentQRFile[0];
        // upload buffer to configured storage (cloudinary or local uploads)
        urlToSave = await uploadBufferToStorage(f.buffer, f.originalname);
      } else {
        const { url, isEnabled } = req.body;
        urlToSave = url || "";
      }

      const isEnabledFlag = req.body.isEnabled ?? false;
      const upiId = req.body.upiId || "";
      const merchantName = req.body.merchantName || "";

      const settings = await adminSettingsService.updatePaymentQR(
        { url: urlToSave, isEnabled: isEnabledFlag, upiId, merchantName },
        req.userId!
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update payment QR",
      });
    }
  }
}

export const adminSettingsController = new AdminSettingsController();

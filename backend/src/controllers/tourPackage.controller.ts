import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { tourPackageService } from "../services/tourPackage.service";

export class TourPackageController {
  async createPackage(req: AuthRequest, res: Response) {
    const pkg = await tourPackageService.createPackage(
      req.userId!,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Package created",
      data: pkg,
    });
  }

  async getAllPackages(req: AuthRequest, res: Response) {
    const packages = await tourPackageService.getAllPackages();

    res.status(200).json({
      success: true,
      data: packages,
    });
  }

  async getPackageById(req: AuthRequest, res: Response) {
    const pkg = await tourPackageService.getPackageById(
      req.params.packageId,
    );

    res.status(200).json({
      success: true,
      data: pkg,
    });
  }
}

export const tourPackageController = new TourPackageController();
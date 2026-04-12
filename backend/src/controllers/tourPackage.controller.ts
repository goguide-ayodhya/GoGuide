import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { tourPackageService } from "../services/tourPackage.service";

export class TourPackageController {
  async createPackage(req: AuthRequest, res: Response) {
    const pkg = await tourPackageService.createPackage(req.userId!, req.body);

    res.status(201).json(pkg);
  }

  async getAllPackages(req: AuthRequest, res: Response) {
    const data = await tourPackageService.getAllPackages();
    res.json(data);
  }

  async getPackageById(req: AuthRequest, res: Response) {
    const data = await tourPackageService.getPackageById(req.params.packageId);
    res.json(data);
  }

  async updatePackage(req: AuthRequest, res: Response) {
    const data = await tourPackageService.updatePackage(
      req.params.packageId,
      req.body,
    );
    res.json(data);
  }

  async deletePackage(req: AuthRequest, res: Response) {
    const data = await tourPackageService.deletePackage(req.params.packageId);
    res.json(data);
  }
}

export const tourPackageController = new TourPackageController();

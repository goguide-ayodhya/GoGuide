import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { driverService } from "../services/driver.service";

export class CabController {
  async createprofile(req: AuthRequest, res: Response) {
    const driver = await driverService.createDriverProfile(
      req.userId!,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: driver,
    });
  }

  async getAll(req: AuthRequest, res: Response) {
    const drivers = await driverService.getAllDrivers(req.userId!);

    res.status(200).json({
      success: true,
      data: drivers,
    });
  }

  async getAllForAdmin(req: AuthRequest, res: Response) {
    const drivers = await driverService.getAllDriversForAdmin();

    res.status(200).json({
      success: true,
      data: drivers,
    });
  }

  async getById(req: AuthRequest, res: Response) {
    const driver = await driverService.getDriverById(req.userId!);

    res.status(200).json({
      success: true,
      data: driver,
    });
  }

  async getMyProfile(req: AuthRequest, res: Response) {
    const driver = await driverService.getDriverByUserId(req.userId!);

    res.status(200).json({
      success: true,
      data: driver,
    });
  }

  async updateProfile(req: AuthRequest, res: Response) {
    const driver = await driverService.updateDriverProfile(
      req.userId!,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: driver,
    });
  }

  async toggleAvailability(req: AuthRequest, res: Response) {
    const { isAvailable } = req.body;
    const driver = await driverService.setAvailability(
      req.userId!,
      isAvailable,
    );

    res.status(200).json({
      success: true,
      data: driver,
    });
  }
}

export const driverController = new CabController();

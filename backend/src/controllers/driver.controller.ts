import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { driverService } from "../services/driver.service";
import cloudinary from "../config/cloudinary";
import { User } from "../models/User";

export class DriverController {
  async getAll(req: AuthRequest, res: Response) {
    const filters = req.query;
    const drivers = await driverService.getAllDrivers(filters);
    res.status(200).json({ success: true, data: drivers });
  }

  async getAllForAdmin(req: AuthRequest, res: Response) {
    const drivers = await driverService.getAllDriversForAdmin();
    res.status(200).json({ success: true, data: drivers });
  }

  async getById(req: AuthRequest, res: Response) {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json({ success: true, data: driver });
  }

  async createProfile(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    
    let driverPhoto = "";
    let vehiclePhoto = "";
    let driverLicenseUrl = "";

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    
    const uploadImage = async (file?: Express.Multer.File) => {
      if (!file) return "";
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
          if (err) reject(err);
          else if (result) resolve(result);
          else reject(new Error("Upload failed"));
        }).end(file.buffer);
      });
      return result.secure_url;
    };

    if (files) {
      driverPhoto = await uploadImage(files.driverPhoto?.[0]);
      vehiclePhoto = await uploadImage(files.vehiclePhoto?.[0]);
      driverLicenseUrl = await uploadImage(files.driverLicense?.[0]);
    }

    const data = {
      ...req.body,
      images: [driverPhoto, vehiclePhoto].filter(Boolean),
    };

    const driver = await driverService.createDriverProfile(userId, data);
    
    // Update User profile status
    await User.findByIdAndUpdate(userId, {
      isProfileComplete: true,
      profileStep: 4,
      status: "ACTIVE"
    });

    res.status(201).json({ success: true, message: "Profile created", data: driver });
  }

  async getMyProfile(req: AuthRequest, res: Response) {
    const driver = await driverService.getDriverByUserId(req.userId!);
    res.status(200).json({ success: true, data: driver });
  }

  async updateProfile(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    
    const uploadImage = async (file?: Express.Multer.File) => {
      if (!file) return "";
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
          if (err) reject(err);
          else if (result) resolve(result);
          else reject(new Error("Upload failed"));
        }).end(file.buffer);
      });
      return result.secure_url;
    };

    const data = { ...req.body };

    if (files) {
      if (files.driverPhoto?.[0]) data.driverPhoto = await uploadImage(files.driverPhoto[0]);
      if (files.vehiclePhoto?.[0]) data.vehiclePhoto = await uploadImage(files.vehiclePhoto[0]);
      if (files.driverLicense) {
        data.images = data.images || [];
        for (const file of files.driverLicense) {
          const url = await uploadImage(file);
          if (url) data.images.push(url);
        }
      }
    }

    const driver = await driverService.updateDriverProfile(userId, data);
    
    // Mark as complete and step 4 when updating profile
    await User.findByIdAndUpdate(userId, {
      isProfileComplete: true,
      profileStep: 4,
    });

    res.status(200).json({ success: true, message: "Profile updated", data: driver });
  }

  async toggleAvailability(req: AuthRequest, res: Response) {
    const driver = await driverService.setAvailability(req.userId!, req.body.isAvailable);
    res.status(200).json({ success: true, message: "Availability updated", data: driver });
  }
}

export const driverController = new DriverController();

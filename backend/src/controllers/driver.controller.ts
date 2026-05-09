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

    let driverLicenseImage: string[] = [];
    if (files?.driverLicense) {
      for (const file of files.driverLicense) {
        const url = await uploadImage(file);
        if (url) driverLicenseImage.push(url);
      }
    }

    if (files?.driverPhoto?.[0]) {
      driverPhoto = await uploadImage(files.driverPhoto[0]);
    }

    const data = {
      ...req.body,
      driverPhoto: driverPhoto || undefined,
      driverLicenseImage,
    };

    if (req.body.languages) {
      data.languages = Array.isArray(req.body.languages) ? req.body.languages : [req.body.languages];
    }

    const driver = await driverService.createDriverProfile(userId, data);
    
    // Update User profile status and details
    const userUpdate: any = {
      isProfileComplete: true,
      profileStep: 4,
      status: "ACTIVE"
    };

    if (req.body.driverName) userUpdate.name = req.body.driverName;
    if (req.body.phone) userUpdate.phone = req.body.phone;

    await User.findByIdAndUpdate(userId, userUpdate);

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

    let updatedLicenseImages: string[] = [];
    if (req.body.existingLicenseImages) {
        updatedLicenseImages = Array.isArray(req.body.existingLicenseImages) 
           ? req.body.existingLicenseImages 
           : [req.body.existingLicenseImages];
    }

    if (files?.driverLicense) {
      for (const file of files.driverLicense) {
        const url = await uploadImage(file);
        if (url) updatedLicenseImages.push(url);
      }
    }
    data.driverLicenseImage = updatedLicenseImages;

    if (req.body.languages) {
      data.languages = Array.isArray(req.body.languages) ? req.body.languages : [req.body.languages];
    }

    if (files?.driverPhoto?.[0]) {
      data.driverPhoto = await uploadImage(files.driverPhoto[0]);
    }

    const userUpdate: any = {
      isProfileComplete: true,
      profileStep: 4,
    };

    if (files?.avatar?.[0]) {
      const url = await uploadImage(files.avatar[0]);
      if (url) userUpdate.avatar = url;
    }

    if (req.body.driverName) userUpdate.name = req.body.driverName;
    if (req.body.phone) userUpdate.phone = req.body.phone;

    const driver = await driverService.updateDriverProfile(userId, data);
    
    // Mark as complete, update user details
    await User.findByIdAndUpdate(userId, userUpdate);

    res.status(200).json({ success: true, message: "Profile updated", data: driver });
  }

  async toggleAvailability(req: AuthRequest, res: Response) {
    const driver = await driverService.setAvailability(req.userId!, req.body.isAvailable);
    res.status(200).json({ success: true, message: "Availability updated", data: driver });
  }
}

export const driverController = new DriverController();

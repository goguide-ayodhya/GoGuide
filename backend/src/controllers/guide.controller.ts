import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { guideService } from "../services/guide.service";
import cloudinary from "../config/cloudinary";
import { User } from "../models/User";

export class GuideController {
  async getAllGuides(req: AuthRequest, res: Response) {
    const filters = req.query;
    const guides = await guideService.getAllGuides(filters);
    res.status(200).json({ success: true, data: guides });
  }

  async getMyGuideProfile(req: AuthRequest, res: Response) {
    const guide = await guideService.getGuideByUserId(req.userId!);
    res.status(200).json({ success: true, data: guide });
  }

  async getGuideById(req: AuthRequest, res: Response) {
    const guide = await guideService.getGuideById(req.params.guideId);
    res.status(200).json({ success: true, data: guide });
  }

  async updateGuideProfile(req: AuthRequest, res: Response) {
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

    // Certificates array
    if (files?.certificates) {
      data.certificates = [];
      for (const file of files.certificates) {
        const url = await uploadImage(file);
        if (url) {
          data.certificates.push({ name: file.originalname, image: url });
        }
      }
    }

    if (files?.avatar?.[0]) {
      const url = await uploadImage(files.avatar[0]);
      if (url) {
        await User.findByIdAndUpdate(userId, { avatar: url });
      }
    }

    const guide = await guideService.updateGuideProfile(userId, data);
    res.status(200).json({ success: true, message: "Profile updated", data: guide });
  }

  async setAvailability(req: AuthRequest, res: Response) {
    const guide = await guideService.setAvailability(req.userId!, req.body.isAvailable);
    res.status(200).json({ success: true, message: "Availability updated", data: guide });
  }

  async completeProfile(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    await guideService.completeProfile(userId);
    
    await User.findByIdAndUpdate(userId, {
      profileStep: 4,
      status: "ACTIVE" // Assuming complete profile activates them for verification
    });

    res.status(200).json({ success: true, message: "Profile completed successfully" });
  }

  async verifyGuide(req: AuthRequest, res: Response) {
    const guide = await guideService.verifyGuide(req.params.guideId);
    res.status(200).json({ success: true, message: "Guide verified", data: guide });
  }

  async rejectGuide(req: AuthRequest, res: Response) {
    const guide = await guideService.rejectGuide(req.params.guideId);
    res.status(200).json({ success: true, message: "Guide rejected", data: guide });
  }
}

export const guideController = new GuideController();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { guideService } from "../services/guide.service";
import cloudinary from "../config/cloudinary";
import { User } from "../models/User";

export class GuideController {
  async getAllGuides(req: AuthRequest, res: Response) {
    try {
      const { speciality, minRating } = req.query;
      const filters = {
        speciality: speciality as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
      };

      const guides = await guideService.getAllGuides(filters);

      res.status(200).json({
        success: true,
        message: "Guides retrieved successfully",
        data: guides,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuideById(req: AuthRequest, res: Response) {
    try {
      const { guideId } = req.params;
      const guide = await guideService.getGuideById(guideId);

      res.status(200).json({
        success: true,
        message: "Guide retrieved successfully",
        data: guide,
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyGuideProfile(req: AuthRequest, res: Response) {
    try {
      const guide = await guideService.getGuideByUserId(req.userId!);

      res.status(200).json({
        success: true,
        message: "Guide profile retrieved successfully",
        data: guide,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateGuideProfile(req: AuthRequest, res: Response) {
    try {
      let avatarUrl = "";
      if (req.file) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: "image",
                },
                (err, result) => {
                  if (err) reject(err);
                  else if (result) resolve(result);
                  else reject(new Error("Upload failed: no result returned"));
                },
              )
              .end(req.file?.buffer);
          },
        );
        avatarUrl = result.secure_url;
      }

      const updateData = {
        ...req.body,
        ...(avatarUrl && { avatar: avatarUrl }),
      };

      // Update the user's avatar if a new one was uploaded
      if (avatarUrl) {
        await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
      }

      const guide = await guideService.updateGuideProfile(
        req.userId!,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "Guide profile updated successfully",
        data: guide,
      });
    } catch (error) {
      throw error;
    }
  }

  async setAvailability(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const { isAvailable } = req.body;

      const guide = await guideService.setAvailability(guideId, isAvailable);

      res.status(200).json({
        success: true,
        message: "Availability status updated",
        data: guide,
      });
    } catch (error) {
      throw error;
    }
  }

  async setOnlineStatus(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const { isOnline } = req.body;

      const guide = await guideService.setOnlineStatus(guideId, isOnline);

      res.status(200).json({
        success: true,
        message: "Online status updated",
        data: guide,
      });
    } catch (error) {
      throw error;
    }
  }
  async verifyGuide(req: AuthRequest, res: Response) {
    const guide = await guideService.verifyGuide(req.params.guideId);
    res.json(guide);
  }

  async rejectGuide(req: AuthRequest, res: Response) {
    const guide = await guideService.rejectGuide(req.params.guideId);
    res.json(guide);
  }
}

export const guideController = new GuideController();

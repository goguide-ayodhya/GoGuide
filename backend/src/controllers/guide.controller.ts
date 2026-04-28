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
      const files = req.files as {
        avatar?: Express.Multer.File[];
        certificates?: Express.Multer.File[];
      };
      const avatarFile = files?.avatar?.[0];
      const certificateFiles = files?.certificates;

      let avatarUrl = "";
      let certificateData: { name: string; image: string }[] = [];

      const updateData: any = {
        ...req.body,
      };
      delete updateData.isOnline;
      delete updateData.bio;

      // Update User bio
      if (req.body.bio) {
        await User.findByIdAndUpdate(req.userId, { bio: req.body.bio });
      }

      // 🔹 AVATAR UPLOAD
      if (avatarFile) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ resource_type: "image" }, (err, result) => {
                if (err) reject(err);
                else if (result) resolve(result);
                else reject(new Error("Upload failed"));
              })
              .end(avatarFile.buffer);
          },
        );

        avatarUrl = result.secure_url;
        updateData.avatar = avatarUrl;

        // user avatar update
        await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
      }

      // 🔹 CERTIFICATES UPLOAD
      if (certificateFiles?.length) {
        const names = req.body.certificateNames;
        const nameArray = Array.isArray(names) ? names : [names].filter(Boolean);

        for (let i = 0; i < certificateFiles.length; i++) {
          const file = certificateFiles[i];

          const result = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ resource_type: "image" }, (err, result) => {
                  if (err) reject(err);
                  else if (result) resolve(result);
                  else reject(new Error("Upload failed"));
                })
                .end(file.buffer);
            },
          );

          certificateData.push({
            name: names?.[i] || "Certificate",
            image: result.secure_url,
          });
        }

        const existingGuide = await guideService.getGuideByUserId(req.userId!);
        updateData.certificates = [
          ...(Array.isArray(existingGuide.certificates)
            ? existingGuide.certificates
            : []),
          ...certificateData,
        ];
      }

      const guide = await guideService.updateGuideProfile(
        req.userId!,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: guide,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Update failed" });
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

  async completeProfile(req: AuthRequest, res: Response) {
    try {
      const result = await guideService.completeProfile(req.userId!);
      res.status(200).json({
        success: true,
        message: result.message,
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

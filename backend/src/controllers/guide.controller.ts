import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { guideService } from "../services/guide.service";

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
      const guide = await guideService.updateGuideProfile(
        req.userId!,
        req.body,
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

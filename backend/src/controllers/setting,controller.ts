import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { authService } from "../services/auth.service";
import { NotFound } from "../utils/httpException";

export class SettingsController {
  async getProfile(req: AuthRequest, res: Response) {
    const user = await User.findById(req.userId).select("-password");

    if (!user) throw new NotFound("User not found");

    res.status(200).json({
      success: true,
      data: user,
    });
  }

  async updateProfile(req: AuthRequest, res: Response) {
    const user = await User.findByIdAndUpdate(
      req.userId,
      req.body,
      { new: true },
    ).select("-password");

    if (!user) throw new NotFound("User not found");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  }

  async changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      req.userId!,
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
}

export const settingsController = new SettingsController();
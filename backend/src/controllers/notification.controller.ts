import { Request, Response } from "express";
import { User } from "../models/User";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async saveFCMToken(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { fcmToken } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!fcmToken || typeof fcmToken !== "string") {
        return res.status(400).json({
          success: false,
          message: "Valid FCM token is required",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          fcmToken,
          fcmTokenUpdatedAt: new Date(),
        },
        { new: true },
      ).select("_id fcmTokenUpdatedAt");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "FCM token saved successfully",
        data: {
          userId: user._id,
          tokenUpdated: user.fcmTokenUpdatedAt,
        },
      });
    } catch (error: any) {
      console.error("Error saving FCM token:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save FCM token",
      });
    }
  }

  static async sendTestNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const success = await NotificationService.sendTestNotification(userId);

      return res.status(200).json({
        success: true,
        message: success
          ? "Test notification sent"
          : "Failed to send test notification",
        data: { sent: success },
      });
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send test notification",
      });
    }
  }
}

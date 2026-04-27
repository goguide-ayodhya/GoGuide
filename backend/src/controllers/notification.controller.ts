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

  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const unreadOnly = req.query.unreadOnly === "true";
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "50", 10);

      const data = await NotificationService.getNotifications(
        userId,
        unreadOnly,
        page,
        limit,
      );

      return res.status(200).json({ success: true, message: "Notifications retrieved successfully", data });
    } catch (error: any) {
      console.error("Error getting notifications:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve notifications" });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const count = await NotificationService.getUnreadCount(userId);
      return res.status(200).json({ success: true, data: { count } });
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return res.status(500).json({ success: false, message: "Failed to get unread count" });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const notificationId = req.params.notificationId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updated = await NotificationService.markAsRead(notificationId, userId);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
      return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ success: false, message: "Failed to mark as read" });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await NotificationService.markAllAsRead(userId);
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ success: false, message: "Failed to mark all as read" });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const notificationId = req.params.notificationId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const deleted = await NotificationService.deleteNotification(notificationId, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
      return res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ success: false, message: "Failed to delete notification" });
    }
  }

  static async deleteAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await NotificationService.deleteAll(userId);
      return res.status(200).json({ success: true, message: "All notifications deleted" });
    } catch (error: any) {
      console.error("Error deleting all notifications:", error);
      return res.status(500).json({ success: false, message: "Failed to delete notifications" });
    }
  }
}

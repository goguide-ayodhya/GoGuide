import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

// Save FCM token - Protected route
router.post("/save-fcm-token", authenticate, async (req, res, next) => {
  try {
    await NotificationController.saveFCMToken(req, res);
  } catch (error) {
    next(error);
  }
});

// Send test notification - Protected route
router.post("/send-test", authenticate, async (req, res, next) => {
  try {
    await NotificationController.sendTestNotification(req, res);
  } catch (error) {
    next(error);
  }
});

// Get notifications (optional query: unreadOnly=true)
router.get("/", authenticate, async (req, res, next) => {
  try {
    await NotificationController.getNotifications(req, res);
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    await NotificationController.getUnreadCount(req, res);
  } catch (error) {
    next(error);
  }
});

// Mark single notification as read
router.patch("/:notificationId/read", authenticate, async (req, res, next) => {
  try {
    await NotificationController.markAsRead(req, res);
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.patch("/read-all", authenticate, async (req, res, next) => {
  try {
    await NotificationController.markAllAsRead(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete single notification
router.delete("/:notificationId", authenticate, async (req, res, next) => {
  try {
    await NotificationController.deleteNotification(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete all notifications for user
router.delete("/", authenticate, async (req, res, next) => {
  try {
    await NotificationController.deleteAll(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;

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

export default router;

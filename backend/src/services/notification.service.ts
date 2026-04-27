// import admin from "firebase-admin";
import admin from "../firebase/admin";

import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { Types } from "mongoose";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
  clickAction?: string;
}

export class NotificationService {
  private static ensureFirebaseInitialized(): boolean {
    try {
      if (!admin.apps.length) {
        console.warn("Firebase Admin SDK not initialized");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Firebase check failed:", error);
      return false;
    }
  }

  static async sendNotificationToUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<boolean> {
    try {
      if (!this.ensureFirebaseInitialized()) {
        console.warn("❌ Firebase not initialized");
        return false;
      }

      const user = await User.findById(userId).select("fcmToken");

      if (!user?.fcmToken) {
        console.warn(`❌ No FCM token for user ${userId}`);
        return false;
      }

      // Persist notification in DB (so it's visible in-app even if push fails)
      try {
        await Notification.create({
          userId: new Types.ObjectId(userId),
          title: payload.title,
          description: payload.body,
          type: (payload.data && (payload.data.type as string)) || payload.data?.type || "GENERIC",
          data: payload.data || {},
          read: false,
        });
      } catch (dbErr) {
        console.warn("Failed to persist notification in DB:", dbErr);
      }

      console.log("🚀 Sending Notification");
      console.log(`userId: ${userId}`);
      console.log(`fcmToken: ${user.fcmToken}`);
      console.log("payload:", payload);

      const success = await this.sendToTokens([user.fcmToken], payload);

      if (success) {
        console.log("✅ Notification Sent");
      } else {
        console.warn("❌ Notification Failed");
      }

      return success;
    } catch (error) {
      console.error(`❌ Notification Failed for user ${userId}:`, error);
      return false;
    }
  }

  /* DB-backed notification utilities */
  static async getNotifications(
    userId: string,
    unreadOnly = false,
    page = 1,
    limit = 50,
  ) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) query.read = false;

    const skip = (page - 1) * limit;
    const docs = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      type: d.type,
      read: d.read,
      createdAt: d.createdAt,
      data: d.data || {},
    }));
  }

  static async getUnreadCount(userId: string) {
    return await Notification.countDocuments({ userId: new Types.ObjectId(userId), read: false });
  }

  static async markAsRead(notificationId: string, userId: string) {
    const res = await Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { read: true },
      { new: true },
    );
    return !!res;
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ userId: new Types.ObjectId(userId), read: false }, { read: true });
  }

  static async deleteNotification(notificationId: string, userId: string) {
    const res = await Notification.findOneAndDelete({ _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) });
    return !!res;
  }

  static async deleteAll(userId: string) {
    await Notification.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Send notification to multiple users
   */
  static async sendNotificationToUsers(
    userIds: string[],
    payload: NotificationPayload,
  ): Promise<{ success: number; failed: number }> {
    try {
      if (!this.ensureFirebaseInitialized()) {
        console.warn("❌ Firebase not initialized");
        return { success: 0, failed: userIds.length };
      }

      console.log("🚀 Sending Notifications to multiple users");
      console.log(`userIds: ${userIds.join(", ")}`);
      console.log("payload:", payload);

      const users = await User.find({ _id: { $in: userIds } }).select(
        "fcmToken",
      );
      console.log("fcmTokens:", users.map((user) => user.fcmToken));
      const tokens = users
        .map((user) => user.fcmToken)
        .filter((token): token is string => !!token);

      if (tokens.length === 0) {
        console.warn(`❌ No FCM tokens found for users: ${userIds.join(", ")}`);
        return { success: 0, failed: userIds.length };
      }

      return await this.sendToTokensBatch(tokens, payload);
    } catch (error) {
      console.error("❌ Notification Failed for multiple users:", error);
      return { success: 0, failed: userIds.length };
    }
  }

  /**
   * Send notification to specific tokens
   */
  private static async sendToTokens(
    tokens: string[],
    payload: NotificationPayload,
  ): Promise<boolean> {
    try {
      if (tokens.length === 0) return false;

      if (tokens.length === 1) {
        const token = tokens[0];
        const message = {
          token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data || {},
        };

        await admin.messaging().send(message);
        console.log("✅ Notification Sent to token");
        return true;
      }

      const messages = tokens.map((token) => ({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      }));

      const result = await admin.messaging().sendEach(messages);

      console.log(
        `✅ Notification batch send: ${result.successCount} success, ${result.failureCount} failed`,
      );
      if (result.failureCount > 0) {
        console.warn(
          `❌ Notification batch had ${result.failureCount} failures out of ${tokens.length} attempts`,
        );
      }
      return result.successCount > 0;
    } catch (error) {
      console.error("❌ Notification Failed during sendToTokens:", error);
      return false;
    }
  }

  /**
   * Send notifications to tokens in batches (Firebase has limit of ~500 tokens per request)
   */
  private static async sendToTokensBatch(
    tokens: string[],
    payload: NotificationPayload,
  ): Promise<{ success: number; failed: number }> {
    const BATCH_SIZE = 500;
    let successCount = 0;
    let failedCount = tokens.length;

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      const success = await this.sendToTokens(batch, payload);
      if (success) {
        successCount += batch.length;
        failedCount -= batch.length;
      }
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Send booking confirmation notification
   */
  static async sendBookingConfirmation(bookingId: string): Promise<boolean> {
    try {
      const booking = await Booking.findById(bookingId).populate("userId");

      if (!booking || !booking.userId) {
        console.warn(`Booking ${bookingId} not found or user not found`);
        return false;
      }

      console.log(
        `[NOTIFICATION] Sending booking confirmation - bookingId: ${bookingId}, userId: ${booking.userId._id}`,
      );

      const bookingType =
        booking.bookingType === "GUIDE" ? "Guide" : "Cab Driver";

      return await this.sendNotificationToUser(booking.userId._id.toString(), {
        title: "Booking Confirmed!",
        body: `Your ${bookingType} booking has been confirmed. Enjoy your experience!`,
        data: {
          bookingId: bookingId.toString(),
          type: "booking_confirmed",
        },
        clickAction: `/tourist/bookings/${bookingId}`,
      });
    } catch (error) {
      console.error(
        `Error sending booking confirmation for ${bookingId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send payment success notification
   */
  static async sendPaymentSuccess(paymentId: string): Promise<boolean> {
    try {
      const payment = await Payment.findById(paymentId)
        .populate("userId")
        .populate("bookingId");

      if (!payment || !payment.userId) {
        console.warn(`Payment ${paymentId} not found or user not found`);
        return false;
      }

      return await this.sendNotificationToUser(payment.userId._id.toString(), {
        title: "Payment Successful!",
        body: `Payment of ₹${(
          (payment as any).amountPaid ??
          payment.amount ??
          0
        ).toFixed(2)} has been processed successfully.`,
        data: {
          paymentId: paymentId.toString(),
          bookingId: payment.bookingId?.toString() || "",
          type: "payment_success",
        },
        clickAction: `/tourist/bookings/${payment.bookingId}`,
      });
    } catch (error) {
      console.error(`Error sending payment success for ${paymentId}:`, error);
      return false;
    }
  }

  /**
   * Send booking status update notification
   */
  static async sendBookingStatusUpdate(
    bookingId: string,
    status: "ACCEPTED" | "REJECTED" | "COMPLETED",
  ): Promise<boolean> {
    try {
      const booking = await Booking.findById(bookingId).populate("userId");

      if (!booking || !booking.userId) {
        console.warn(`Booking ${bookingId} not found or user not found`);
        return false;
      }

      console.log(
        `[NOTIFICATION] Sending booking status update - bookingId: ${bookingId}, status: ${status}, userId: ${booking.userId._id}`,
      );

      const statusMessages: Record<string, { title: string; body: string }> = {
        ACCEPTED: {
          title: "Booking Accepted!",
          body: "Your booking has been accepted. Get ready for an amazing experience!",
        },
        REJECTED: {
          title: "Booking Status Updated",
          body: "Your booking request could not be accepted. Please try booking with another provider.",
        },
        COMPLETED: {
          title: "Booking Completed!",
          body: "Thank you for using our service. Please rate your experience.",
        },
      };

      const statusInfo = statusMessages[status] || {
        title: "Booking Updated",
        body: `Your booking status has been updated to ${status}.`,
      };

      return await this.sendNotificationToUser(booking.userId._id.toString(), {
        title: statusInfo.title,
        body: statusInfo.body,
        data: {
          bookingId: bookingId.toString(),
          status,
          type: `booking_${status.toLowerCase()}`,
        },
        clickAction: `/tourist/bookings/${bookingId}`,
      });
    } catch (error) {
      console.error(
        `Error sending booking status update for ${bookingId}:`,
        error,
      );
      return false;
    }
  }

  //  Send generic notification to user

  static async sendGenericNotification(
    userId: string,
    title: string,
    body: string,
    actionUrl?: string,
  ): Promise<boolean> {
    try {
      return await this.sendNotificationToUser(userId, {
        title,
        body,
        data: actionUrl ? { action: actionUrl } : undefined,
        clickAction: actionUrl,
      });
    } catch (error) {
      console.error(
        `❌ Error sending generic notification to user ${userId}:`,
        error,
      );
      return false;
    }
  }

  static async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    return this.sendNotificationToUser(userId, {
      title,
      body,
      data,
    });
  }

  /**
   * Update FCM token for a user
   */
  static async updateUserFCMToken(
    userId: string,
    token: string,
  ): Promise<boolean> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        },
        { new: true },
      ).select("_id");

      return !!user;
    } catch (error) {
      console.error(`Error updating FCM token for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Clear FCM token for a user (on logout)
   */
  static async clearUserFCMToken(userId: string): Promise<boolean> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          fcmToken: undefined,
          fcmTokenUpdatedAt: new Date(),
        },
        { new: true },
      ).select("_id");

      return !!user;
    } catch (error) {
      console.error(`Error clearing FCM token for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send test notification (for debugging/setup)
   */
  static async sendTestNotification(userId: string): Promise<boolean> {
    try {
      return await this.sendNotificationToUser(userId, {
        title: "Test Notification",
        body: "If you see this, FCM is working correctly!",
        data: {
          type: "test",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(
        `Error sending test notification to user ${userId}:`,
        error,
      );
      return false;
    }
  }
}

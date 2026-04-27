import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";
import { NotificationService } from "./notification.service";

export class UserService {
  async getAllUsers(filters?: { role?: string; status?: string; search?: string }) {
    const query: any = { isDeleted: false };

    if (filters?.role && ["GUIDE", "DRIVER", "TOURIST", "ADMIN"].includes(filters.role)) {
      query.role = filters.role;
    }

    if (filters?.status && ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED", "DELETED"].includes(filters.status)) {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.$or = [
        { name: new RegExp(filters.search, "i") },
        { email: new RegExp(filters.search, "i") }
      ];
    }

    return User.find(query).sort({ createdAt: -1 });
  }

  async getUserDetail(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    // Get booking count
    const { Booking } = await import("../models/Booking");
    const bookingCount = await Booking.countDocuments({ userId });

    // Get payment summary
    const { Payment } = await import("../models/Payment");
    const payments = await Payment.find({ userId });
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingPayments = payments.filter(p => p.status === "PENDING").length;

    // Get guide verification status if applicable
    let guideVerificationStatus = null;
    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      const guide = await Guide.findOne({ userId: user._id });
      guideVerificationStatus = guide?.verificationStatus || "NOT_APPLIED";
    }

    return {
      ...user.toObject(),
      bookingCount,
      paymentSummary: {
        totalPaid,
        pendingPayments,
        totalPayments: payments.length
      },
      guideVerificationStatus
    };
  }

  async blockUser(userId: string, reason?: string) {
    console.log(
      `[ADMIN] Blocking user ${userId} - reason: ${reason || "Violation"}`,
    );
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "BLOCKED";
    user.blockReason = reason || "Violation";
    user.blockedAt = new Date();

    await user.save();

    try {
      await NotificationService.sendNotification(
        userId,
        "Account Blocked",
        "Your account has been blocked. Please contact support for help.",
        { type: "admin_account_blocked" },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return user;
  }

  async activateUser(userId: string) {
    console.log(`[ADMIN] Activating user ${userId}`);
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "ACTIVE" },
      { new: true, runValidators: false },
    );
    if (!user) throw new NotFound("User not found");

    try {
      await NotificationService.sendNotification(
        userId,
        "Account Activated",
        "Your account has been activated and is ready to use.",
        { type: "admin_account_activated" },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return user;
  }

  async softDeleteUser(userId: string) {
    console.log(`[ADMIN] Soft deleting user ${userId}`);
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "DELETED";
    user.isDeleted = true;

    await user.save();

    try {
      await NotificationService.sendNotification(
        userId,
        "Account Deleted",
        "Your account has been deleted. Contact support if this is a mistake.",
        { type: "admin_account_deleted" },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return { message: "User deleted" };
  }

  async suspendUser(userId: string) {
    console.log(`[ADMIN] Suspending user ${userId}`);
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "SUSPENDED";
    await user.save();

    try {
      await NotificationService.sendNotification(
        userId,
        "Account Suspended",
        "Your account has been suspended. Please contact support for details.",
        { type: "admin_account_suspended" },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return user;
  }
}

export const userService = new UserService();

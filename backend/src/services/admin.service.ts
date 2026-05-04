import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";
import { NotificationService } from "./notification.service";

export class UserService {
  async getAllUsers(filters?: { role?: string; status?: string; search?: string }) {
    const query: any = {};

    if (filters?.status === "DELETED") {
      query.status = "DELETED";
    } else {
      query.isDeleted = false;
      if (filters?.status && ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED"].includes(filters.status)) {
        query.status = filters.status;
      }
    }

    if (filters?.role && ["GUIDE", "DRIVER", "TOURIST"].includes(filters.role)) {
      query.role = filters.role;
    } else {
      query.role = { $ne: "ADMIN" };
    }

    if (filters?.search) {
      query.$or = [
        { name: new RegExp(filters.search, "i") },
        { email: new RegExp(filters.search, "i") }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Enrich with guide/driver specific fields
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const u = user.toObject() as any;
      if (u.role === "GUIDE") {
        const { Guide } = await import("../models/Guide");
        const guide = await Guide.findOne({ userId: u._id });
        u.verificationStatus = guide?.verificationStatus || "NOT_APPLIED";
        u.isAvailable = guide?.isAvailable;
      } else if (u.role === "DRIVER") {
        const { Driver } = await import("../models/Driver");
        const driver = await Driver.findOne({ userId: u._id });
        u.verificationStatus = driver?.verificationStatus || "NOT_APPLIED";
        u.isAvailable = driver?.isAvailable;
      }
      return u;
    }));

    return enrichedUsers;
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
    let providerDetails = null;

    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      const guide = await Guide.findOne({ userId: user._id }).lean();
      guideVerificationStatus = guide?.verificationStatus || "NOT_APPLIED";
      providerDetails = guide;
    } else if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      const driver = await Driver.findOne({ userId: user._id }).lean();
      guideVerificationStatus = driver?.verificationStatus || "NOT_APPLIED";
      providerDetails = driver;
    }

    return {
      ...user.toObject(),
      bookingCount,
      paymentSummary: {
        totalPaid,
        pendingPayments,
        totalPayments: payments.length
      },
      guideVerificationStatus,
      providerDetails
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

    // Update related models
    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      await Guide.findOneAndUpdate({ userId: user._id }, { isAvailable: false });
    }
    if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      await Driver.findOneAndUpdate({ userId: user._id }, { isAvailable: false });
    }

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

    // Update related models
    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      await Guide.findOneAndUpdate({ userId: user._id }, { isAvailable: true });
    }
    if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      await Driver.findOneAndUpdate({ userId: user._id }, { isAvailable: true });
    }

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

  async verifyUser(userId: string) {
    console.log(`[ADMIN] Verifying provider ${userId}`);
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");
    if (user.role !== "GUIDE" && user.role !== "DRIVER") {
      throw new BadRequest("Only guides and drivers can be verified");
    }

    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      const guide = await Guide.findOneAndUpdate(
        { userId: user._id },
        { verificationStatus: "VERIFIED", isAvailable: true },
        { new: true },
      );
      if (!guide) throw new NotFound("Guide profile not found");
    } else if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      const driver = await Driver.findOneAndUpdate(
        { userId: user._id },
        { verificationStatus: "VERIFIED", isAvailable: true },
        { new: true },
      );
      if (!driver) throw new NotFound("Driver profile not found");
    }

    user.status = "ACTIVE";
    await user.save();

    try {
      await NotificationService.sendNotification(
        userId,
        "Profile Verified",
        `Your ${user.role.toLowerCase()} profile has been verified and is now active.`,
        { type: `admin_${user.role.toLowerCase()}_verified` },
      );
    } catch (error) {
      console.warn("Notification send failed (non-blocking):", error);
    }

    return user;
  }

  async unverifyUser(userId: string) {
    console.log(`[ADMIN] Unverifying provider ${userId}`);
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");
    if (user.role !== "GUIDE" && user.role !== "DRIVER") {
      throw new BadRequest("Only guides and drivers can be unverified");
    }

    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      const guide = await Guide.findOneAndUpdate(
        { userId: user._id },
        { verificationStatus: "REJECTED", isAvailable: false },
        { new: true },
      );
      if (!guide) throw new NotFound("Guide profile not found");
    } else if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      const driver = await Driver.findOneAndUpdate(
        { userId: user._id },
        { verificationStatus: "REJECTED", isAvailable: false },
        { new: true },
      );
      if (!driver) throw new NotFound("Driver profile not found");
    }

    user.status = "INACTIVE";
    await user.save();

    try {
      await NotificationService.sendNotification(
        userId,
        "Profile Unverified",
        `Your ${user.role.toLowerCase()} profile has been marked as unverified.`,
        { type: `admin_${user.role.toLowerCase()}_unverified` },
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

    // Update related models
    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      await Guide.findOneAndUpdate({ userId: user._id }, { isAvailable: false, verificationStatus: "REJECTED" });
    }
    if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      await Driver.findOneAndUpdate({ userId: user._id }, { isAvailable: false, verificationStatus: "REJECTED" });
    }

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

  async suspendUser(userId: string, duration?: string) {
    console.log(`[ADMIN] Suspending user ${userId} for ${duration || "indefinite"}`);
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "SUSPENDED";
    if (duration === "2_days") {
      user.suspendUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    } else if (duration === "1_week") {
      user.suspendUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      user.suspendUntil = undefined;
    }
    await user.save();

    // Update related models
    if (user.role === "GUIDE") {
      const { Guide } = await import("../models/Guide");
      await Guide.findOneAndUpdate({ userId: user._id }, { isAvailable: false });
    }
    if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      await Driver.findOneAndUpdate({ userId: user._id }, { isAvailable: false });
    }

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

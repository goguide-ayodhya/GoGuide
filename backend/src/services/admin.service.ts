import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";
import { NotificationService } from "./notification.service";
import { sendEmail } from "../config/email.config";
import { generateStatusEmail } from "../utils/emailTemplates";

export class UserService {
  async getAllUsers(filters?: {
    role?: string;
    status?: string;
    search?: string;
    verification?: string;
    page?: number;
    limit?: number;
  }) {
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

    if (filters?.verification && filters.verification !== "all") {
      // Find all VERIFIED guides/drivers
      const { Guide } = await import("../models/Guide");
      const verifiedGuides = await Guide.find({ verificationStatus: "VERIFIED" }).select("userId").lean();
      const verifiedGuideUserIds = verifiedGuides.map(g => g.userId.toString());

      const { Driver } = await import("../models/Driver");
      const verifiedDrivers = await Driver.find({ verificationStatus: "VERIFIED" }).select("userId").lean();
      const verifiedDriverUserIds = verifiedDrivers.map(d => d.userId.toString());

      const verifiedUserIds = [...verifiedGuideUserIds, ...verifiedDriverUserIds];

      if (filters.verification === "VERIFIED") {
        query._id = { $in: verifiedUserIds };
      } else if (filters.verification === "UNVERIFIED") {
        query._id = { $nin: verifiedUserIds };
      }
    }

    const page = filters?.page ? Number(filters.page) : 1;
    const limit = filters?.limit ? Number(filters.limit) : 20;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

    return {
      users: enrichedUsers,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    };
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
    const totalPaid = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
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

    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Account Blocked - GoGuide",
          html: generateStatusEmail({
            title: "Account Blocked",
            titleColor: "#ef4444",
            messageParagraphs: [
              "We regret to inform you that your GoGuide account has been blocked.",
              `Reason: ${reason || "Violation of terms and policies."}`,
              "If you believe this is a mistake, please contact our support team."
            ]
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
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

    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Account Activated - GoGuide",
          html: generateStatusEmail({
            title: "Account Activated",
            titleColor: "#16a34a",
            messageParagraphs: [
              "Great news! Your GoGuide account has been successfully activated.",
              "You can now log in and access all features."
            ],
            actionText: "Login Now",
            actionUrl: "goguide.in/login",
            actionColor: "#16a34a"
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
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

    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Profile Verified - GoGuide",
          html: generateStatusEmail({
            title: "Profile Verified",
            titleColor: "#16a34a",
            messageParagraphs: [
              `Congratulations! Your ${user.role.toLowerCase()} profile has been verified by the GoGuide team.`,
              "You are now visible to travelers and can start receiving bookings."
            ],
            actionText: "Go to Dashboard",
            actionUrl: "goguide.in/login",
            actionColor: "#16a34a"
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
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

    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Profile Unverified - GoGuide",
          html: generateStatusEmail({
            title: "Profile Unverified",
            titleColor: "#ef4444",
            messageParagraphs: [
              `We're sorry, but your ${user.role.toLowerCase()} profile has been unverified by the GoGuide team.`,
              "Please review your profile and contact support for more details on how to resolve this."
            ]
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
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
      await Guide.findOneAndUpdate(
        { userId: user._id },
        {
          isDeleted: true,
          isActive: false,
          isAvailable: false,
          verificationStatus: "REJECTED",
        }
      );
    }
    if (user.role === "DRIVER") {
      const { Driver } = await import("../models/Driver");
      await Driver.findOneAndUpdate(
        { userId: user._id },
        {
          isDeleted: true,
          isActive: false,
          isAvailable: false,
          verificationStatus: "REJECTED",
        }
      );
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

    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Account Deleted - GoGuide",
          html: generateStatusEmail({
            title: "Account Deleted",
            titleColor: "#ef4444",
            messageParagraphs: [
              "Your GoGuide account has been deleted.",
              "If this was a mistake or you wish to recover your account, please contact support immediately."
            ]
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
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

    if (user.email) {
      try {
        let durationText = "";
        if (duration === "2_days") durationText = " for 2 days";
        if (duration === "1_week") durationText = " for 1 week";

        await sendEmail({
          to: user.email,
          subject: "Account Suspended - GoGuide",
          html: generateStatusEmail({
            title: "Account Suspended",
            titleColor: "#ef4444",
            messageParagraphs: [
              `Your GoGuide account has been suspended${durationText}.`,
              "During this time, you will not be able to access your account or receive bookings.",
              "Please contact support for more details."
            ]
          })
        });
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e);
      }
    }

    return user;
  }

  async markUserAsViewed(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.isViewedByAdmin = true;
    await user.save();

    return { message: "User marked as viewed", success: true };
  }
}

export const userService = new UserService();

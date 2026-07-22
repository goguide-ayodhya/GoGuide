import { DriverCommissionPayment } from "../models/DriverCommissionPayment";
import { DriverWallet } from "../models/DriverWallet";
import { Driver } from "../models/Driver";
import { User } from "../models/User";
import { adminSettingsService } from "./adminSettings.service";
import { NotificationService } from "./notification.service";
import { Types } from "mongoose";

export class DriverCommissionService {
  // ──────────────────────────────────────────────
  // Wallet Utilities
  // ──────────────────────────────────────────────

  async ensureWalletExists(driverId: string) {
    const driverObjectId = new Types.ObjectId(driverId);
    let wallet = await DriverWallet.findOne({ driverId: driverObjectId });
    if (!wallet) {
      wallet = await DriverWallet.create({
        driverId: driverObjectId,
        totalEarned: 0,
        adminCommissionGenerated: 0,
        adminCommissionPaid: 0,
        pendingAdminCommission: 0,
      });
    }
    return wallet;
  }

  // Called when driver completes a ride/earns money
  async addDriverEarning(driverId: string, amount: number): Promise<void> {
    const driverObjectId = new Types.ObjectId(driverId);
    const commissionPercent = await adminSettingsService.getCommissionPercent();
    const adminCommission = Math.round((amount * commissionPercent) / 100);

    await this.ensureWalletExists(driverId);

    await DriverWallet.findOneAndUpdate(
      { driverId: driverObjectId },
      {
        $inc: {
          totalEarned: amount,
          adminCommissionGenerated: adminCommission,
          pendingAdminCommission: adminCommission,
        },
        lastUpdatedAt: new Date(),
      },
      { new: true }
    );
  }

  // ──────────────────────────────────────────────
  // Driver-Initiated Payment Request
  // ──────────────────────────────────────────────

  async submitDriverPaymentRequest(
    driverId: string,
    amount: number,
    transactionReference: string,
    notes?: string
  ) {
    const driverObjectId = new Types.ObjectId(driverId);
    const commissionPercent = await adminSettingsService.getCommissionPercent();

    const wallet = await this.ensureWalletExists(driverId);

    if (amount <= 0) {
      throw new Error("Payment amount must be greater than 0");
    }

    if (amount > wallet.pendingAdminCommission) {
      throw new Error(
        `Payment amount (₹${amount}) exceeds pending commission (₹${wallet.pendingAdminCommission})`
      );
    }

    if (!transactionReference || transactionReference.trim().length === 0) {
      throw new Error("Transaction reference is required");
    }

    // Check for duplicate pending request (prevent double submission)
    const existingPending = await DriverCommissionPayment.findOne({
      driverId: driverObjectId,
      status: "PENDING",
      requestedBy: "DRIVER",
    });

    if (existingPending) {
      throw new Error(
        "You already have a pending payment request. Please wait for admin verification."
      );
    }

    const payment = await DriverCommissionPayment.create({
      driverId: driverObjectId,
      amount,
      commissionPercent,
      transactionReference: transactionReference.trim(),
      notes: notes?.trim(),
      status: "PENDING",
      requestedBy: "DRIVER",
    });

    // Notify all admins about the new request
    try {
      const admins = await User.find({ role: "ADMIN" }).select("_id").lean();
      const driver = await Driver.findById(driverId)
        .populate<{ userId: any }>("userId", "fullname")
        .lean();
      const driverName =
        (driver as any)?.driverName ||
        (driver as any)?.userId?.fullname?.firstname ||
        "A driver";

      for (const admin of admins) {
        await NotificationService.sendNotificationToUser(admin._id.toString(), {
          title: "New Commission Payment Request",
          body: `${driverName} has submitted a commission payment of ₹${amount}. Please review.`,
          data: {
            type: "COMMISSION_PAYMENT_REQUEST",
            paymentId: payment._id.toString(),
            driverId: driverId,
          },
        });
      }
    } catch (notifyErr) {
      console.warn("[COMMISSION] Admin notification failed (non-blocking):", notifyErr);
    }

    return payment;
  }

  // ──────────────────────────────────────────────
  // Admin: Approve Payment Request
  // ──────────────────────────────────────────────

  async approvePaymentRequest(paymentId: string, adminUserId: string): Promise<void> {
    const payment = await DriverCommissionPayment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment request not found");
    }

    // [DOUBLE GUARD] Prevent double-approval race condition
    if (payment.status !== "PENDING") {
      throw new Error(
        `Cannot approve: payment is already in '${payment.status}' status`
      );
    }

    const driverObjectId = new Types.ObjectId(payment.driverId.toString());
    const wallet = await this.ensureWalletExists(payment.driverId.toString());

    // Safety check: don't approve more than pending
    if (payment.amount > wallet.pendingAdminCommission) {
      throw new Error(
        `Approval rejected: amount (₹${payment.amount}) exceeds driver's current pending commission (₹${wallet.pendingAdminCommission}). Wallet may have changed.`
      );
    }

    // Update payment status — atomically check status again
    const updated = await DriverCommissionPayment.findOneAndUpdate(
      { _id: paymentId, status: "PENDING" }, // only update if still PENDING
      {
        status: "APPROVED",
        approvedBy: new Types.ObjectId(adminUserId),
        approvedAt: new Date(),
        // Legacy aliases
        confirmedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Payment was already processed by another admin. Please refresh.");
    }

    // Update wallet — atomically increment paid, decrement pending
    await DriverWallet.findOneAndUpdate(
      { driverId: driverObjectId },
      {
        $inc: {
          adminCommissionPaid: payment.amount,
          pendingAdminCommission: -payment.amount,
        },
        lastUpdatedAt: new Date(),
      },
      { new: true }
    );

    // Notify driver
    try {
      const driver = await Driver.findById(payment.driverId)
        .populate<{ userId: any }>("userId", "_id")
        .lean();
      const driverUserId = (driver as any)?.userId?._id?.toString();
      if (driverUserId) {
        await NotificationService.sendNotificationToUser(driverUserId, {
          title: "Commission Payment Approved ✅",
          body: `Your commission payment of ₹${payment.amount} has been approved. Thank you!`,
          data: {
            type: "COMMISSION_APPROVED",
            paymentId: paymentId,
            amount: payment.amount.toString(),
          },
        });
      }
    } catch (notifyErr) {
      console.warn("[COMMISSION] Driver approval notification failed:", notifyErr);
    }
  }

  // ──────────────────────────────────────────────
  // Admin: Reject Payment Request
  // ──────────────────────────────────────────────

  async rejectPaymentRequest(
    paymentId: string,
    adminUserId: string,
    reason: string
  ): Promise<void> {
    const payment = await DriverCommissionPayment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment request not found");
    }

    if (payment.status !== "PENDING") {
      throw new Error(
        `Cannot reject: payment is already in '${payment.status}' status`
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error("Rejection reason is required");
    }

    await DriverCommissionPayment.findByIdAndUpdate(paymentId, {
      status: "REJECTED",
      rejectionReason: reason.trim(),
      approvedBy: new Types.ObjectId(adminUserId), // admin who acted
      approvedAt: new Date(),
    });

    // No wallet changes on rejection

    // Notify driver
    try {
      const driver = await Driver.findById(payment.driverId)
        .populate<{ userId: any }>("userId", "_id")
        .lean();
      const driverUserId = (driver as any)?.userId?._id?.toString();
      if (driverUserId) {
        await NotificationService.sendNotificationToUser(driverUserId, {
          title: "Commission Payment Rejected ❌",
          body: `Your commission payment of ₹${payment.amount} was rejected. Reason: ${reason}`,
          data: {
            type: "COMMISSION_REJECTED",
            paymentId: paymentId,
            reason,
          },
        });
      }
    } catch (notifyErr) {
      console.warn("[COMMISSION] Driver rejection notification failed:", notifyErr);
    }
  }

  // ──────────────────────────────────────────────
  // Admin-Initiated Record (legacy support)
  // ──────────────────────────────────────────────

  async recordCommissionPayment(
    driverId: string,
    amount: number,
    adminId: string,
    note?: string
  ) {
    const driverObjectId = new Types.ObjectId(driverId);
    const commissionPercent = await adminSettingsService.getCommissionPercent();
    const wallet = await this.ensureWalletExists(driverId);

    if (amount > wallet.pendingAdminCommission) {
      throw new Error(
        `Payment amount (${amount}) exceeds pending commission (${wallet.pendingAdminCommission})`
      );
    }

    const payment = await DriverCommissionPayment.create({
      driverId: driverObjectId,
      amount,
      commissionPercent,
      createdBy: new Types.ObjectId(adminId),
      note,
      status: "PENDING",
      requestedBy: "ADMIN",
    });

    // Notify driver about the admin-recorded commission request
    try {
      const driver = await Driver.findById(driverId).lean();
      const driverUserId = driver?.userId?.toString();
      if (driverUserId) {
        await NotificationService.sendNotificationToUser(driverUserId, {
          title: "Commission Payment Recorded",
          body: `Admin has recorded a commission payment request of ₹${amount}.`,
          data: {
            type: "COMMISSION_RECORDED",
            paymentId: payment._id.toString(),
            amount: amount.toString(),
          },
        });
      }
    } catch (notifyErr) {
      console.warn("[COMMISSION] Driver notification failed (non-blocking):", notifyErr);
    }

    return payment;
  }

  async confirmCommissionPayment(paymentId: string): Promise<void> {
    return this.approvePaymentRequest(paymentId, "system");
  }

  // ──────────────────────────────────────────────
  // Queries
  // ──────────────────────────────────────────────

  async getDriverWallet(driverId: string) {
    return this.ensureWalletExists(driverId);
  }

  async getDriverPaymentHistory(driverId: string, limit: number = 50) {
    const driverObjectId = new Types.ObjectId(driverId);
    return DriverCommissionPayment.find({ driverId: driverObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");
  }

  // Admin: get all requests filtered by status
  async getAllRequests(status?: string, limit: number = 200) {
    const filter: any = {};
    if (status && status !== "ALL") {
      filter.status = status.toUpperCase();
    }

    return DriverCommissionPayment.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "driverId",
        select: "driverName driverPhoto userId",
        populate: { path: "userId", select: "fullname email" },
      })
      .populate("approvedBy", "fullname email");
  }

  // Admin: get all pending commissions (legacy endpoint)
  async getAllPendingCommissions(limit: number = 100) {
    return DriverCommissionPayment.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "driverId",
        select: "driverName",
        populate: { path: "userId", select: "fullname" },
      })
      .populate("createdBy", "name email");
  }

  // Admin: aggregated commission overview stats
  async getCommissionOverviewStats() {
    const wallets = await DriverWallet.find({}).lean();

    const totalGenerated = wallets.reduce(
      (sum, w) => sum + (w.adminCommissionGenerated || 0),
      0
    );
    const totalCollected = wallets.reduce(
      (sum, w) => sum + (w.adminCommissionPaid || 0),
      0
    );
    const totalPending = wallets.reduce(
      (sum, w) => sum + (w.pendingAdminCommission || 0),
      0
    );
    const driversWithDues = wallets.filter(
      (w) => (w.pendingAdminCommission || 0) > 0
    ).length;

    // Today's collection: approved requests approved today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayApprovedAgg = await DriverCommissionPayment.aggregate([
      {
        $match: {
          status: "APPROVED",
          approvedAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayCollection = todayApprovedAgg[0]?.total || 0;

    // Pending requests count (for sidebar badge)
    const pendingRequestsCount = await DriverCommissionPayment.countDocuments({
      status: "PENDING",
    });

    return {
      totalGenerated,
      totalCollected,
      totalPending,
      driversWithDues,
      todayCollection,
      pendingRequestsCount,
    };
  }

  // Admin: driver priority list — only drivers with pendingAdminCommission > 0
  async getDriverCollectionOverview() {
    const wallets = await DriverWallet.find({
      pendingAdminCommission: { $gt: 0 }, // only drivers who owe something
    })
      .populate<{ driverId: any }>({
        path: "driverId",
        select: "driverName userId",
        populate: { path: "userId", select: "fullname" },
      })
      .sort({ pendingAdminCommission: -1 }) // highest pending first
      .lean();

    // Get last payment date for each driver
    const driverIds = wallets.map((w) => w.driverId?._id || w.driverId);
    const lastPayments = await DriverCommissionPayment.aggregate([
      {
        $match: {
          driverId: { $in: driverIds },
          status: { $in: ["APPROVED", "CONFIRMED"] },
        },
      },
      { $sort: { approvedAt: -1 } },
      { $group: { _id: "$driverId", lastPaymentAt: { $first: "$approvedAt" } } },
    ]);

    const lastPaymentMap = new Map(
      lastPayments.map((lp) => [lp._id.toString(), lp.lastPaymentAt])
    );

    return wallets.map((w) => {
      const dId = (w.driverId?._id || w.driverId)?.toString();
      const d = w.driverId as any;
      const driverName =
        d?.driverName ||
        (d?.userId?.fullname?.firstname
          ? `${d.userId.fullname.firstname} ${d.userId.fullname.lastname || ""}`
          : null) ||
        "Unknown Driver";

      return {
        driverId: dId,
        driverName,
        totalEarned: w.totalEarned,
        adminCommissionGenerated: w.adminCommissionGenerated,
        adminCommissionPaid: w.adminCommissionPaid,
        pendingAdminCommission: w.pendingAdminCommission,
        lastPaymentAt: lastPaymentMap.get(dId) || null,
      };
    });
  }
}

export const driverCommissionService = new DriverCommissionService();

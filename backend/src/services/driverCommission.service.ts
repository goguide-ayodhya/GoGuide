import { DriverCommissionPayment } from "../models/DriverCommissionPayment";
import { DriverWallet } from "../models/DriverWallet";
import { adminSettingsService } from "./adminSettings.service";
import { Types } from "mongoose";

export class DriverCommissionService {
  // Ensure wallet exists for driver
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

  // Record payment from driver to admin
  async recordCommissionPayment(
    driverId: string,
    amount: number,
    adminId: string,
    note?: string
  ) {
    const driverObjectId = new Types.ObjectId(driverId);
    const adminObjectId = new Types.ObjectId(adminId);
    const commissionPercent = await adminSettingsService.getCommissionPercent();

    // Ensure wallet exists
    const wallet = await this.ensureWalletExists(driverId);

    // Prevent overpayment
    if (amount > wallet.pendingAdminCommission) {
      throw new Error(
        `Payment amount (${amount}) exceeds pending commission (${wallet.pendingAdminCommission})`
      );
    }

    // Create payment record
    const payment = await DriverCommissionPayment.create({
      driverId: driverObjectId,
      amount: amount,
      commissionPercent: commissionPercent,
      createdBy: adminObjectId,
      note: note,
      status: "PENDING",
    });

    return payment;
  }

  // Confirm a pending payment
  async confirmCommissionPayment(paymentId: string): Promise<void> {
    const payment = await DriverCommissionPayment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "PENDING") {
      throw new Error("Payment cannot be confirmed (not in PENDING status)");
    }

    const driverObjectId = new Types.ObjectId(payment.driverId.toString());

    // Update payment status
    payment.status = "CONFIRMED";
    payment.confirmedAt = new Date();
    await payment.save();

    // Update wallet
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
  }

  // Get driver's wallet info
  async getDriverWallet(driverId: string) {
    const driverObjectId = new Types.ObjectId(driverId);
    const wallet = await this.ensureWalletExists(driverId);
    return wallet;
  }

  // Get all driver commission payments with details
  async getDriverPaymentHistory(driverId: string, limit: number = 50) {
    const driverObjectId = new Types.ObjectId(driverId);
    return DriverCommissionPayment.find({ driverId: driverObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name email");
  }

  // Get all pending commission payments (admin view)
  async getAllPendingCommissions(limit: number = 100) {
    return DriverCommissionPayment.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("driverId", "driverName")
      .populate("createdBy", "name email");
  }

  // Get driver collection overview for admin
  async getDriverCollectionOverview() {
    const wallets = await DriverWallet.find({})
      .populate("driverId", "driverName")
      .sort({ pendingAdminCommission: -1 });

    return wallets.map((w) => ({
      driverId: w.driverId._id,
      driverName: (w.driverId as any).driverName || "Unknown",
      totalEarned: w.totalEarned,
      adminCommissionGenerated: w.adminCommissionGenerated,
      adminCommissionPaid: w.adminCommissionPaid,
      pendingAdminCommission: w.pendingAdminCommission,
    }));
  }
}

export const driverCommissionService = new DriverCommissionService();

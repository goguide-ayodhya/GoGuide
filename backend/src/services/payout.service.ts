import { Types } from "mongoose";
import { Booking } from "../models/Booking";
import { Payout } from "../models/Payout";
import { Guide } from "../models/Guide";
import { User } from "../models/User";
import { NotFound, BadRequest, Unauthorized } from "../utils/httpException";
import { roundMoney } from "../utils/bookingPricing";
import { financialAuditService } from "./financialAudit.service";

export class PayoutService {
  /**
   * Lifetime guide share from settled bookings (uses stored guideEarning).
   */
  async getTotalAccruedGuideShare(guideMongoId: string): Promise<number> {
    const agg = await Booking.aggregate([
      {
        $match: {
          guideId: new Types.ObjectId(guideMongoId),
          bookingType: "GUIDE",
          paymentStatus: "COMPLETED",
          status: { $nin: ["CANCELLED"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$guideEarning", 0] } },
        },
      },
    ]);
    return roundMoney(agg[0]?.total ?? 0);
  }

  async getPaidOutSum(guideMongoId: string): Promise<number> {
    const agg = await Payout.aggregate([
      {
        $match: {
          guideId: new Types.ObjectId(guideMongoId),
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    return roundMoney(agg[0]?.total ?? 0);
  }

  async getPendingPayoutRecordsSum(guideMongoId: string): Promise<number> {
    const agg = await Payout.aggregate([
      {
        $match: {
          guideId: new Types.ObjectId(guideMongoId),
          status: "PENDING",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    return roundMoney(agg[0]?.total ?? 0);
  }

  /** Amount admin can still send (not yet paid out, not stuck in unconfirmed payout). */
  async getAvailableForNextPayout(guideMongoId: string): Promise<number> {
    const accrued = await this.getTotalAccruedGuideShare(guideMongoId);
    const paid = await this.getPaidOutSum(guideMongoId);
    const inFlight = await this.getPendingPayoutRecordsSum(guideMongoId);
    return Math.max(0, roundMoney(accrued - paid - inFlight));
  }

  async getGuideWalletSummary(guideMongoId: string) {
    const totalEarnings = await this.getTotalAccruedGuideShare(guideMongoId);
    const paidOut = await this.getPaidOutSum(guideMongoId);
    const pendingConfirmation = await this.getPendingPayoutRecordsSum(guideMongoId);
    const availableForPayout = await this.getAvailableForNextPayout(guideMongoId);

    return {
      totalEarnings,
      paidOut,
      pendingConfirmation,
      /** Same as availableForPayout — amount admin may send next */
      pendingPayout: availableForPayout,
      availableForPayout,
    };
  }

  async createPayoutByAdmin(adminUserId: string, guideMongoId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequest("Amount must be positive");
    }

    const guide = await Guide.findById(guideMongoId);
    if (!guide) {
      throw new NotFound("Guide not found");
    }

    const available = await this.getAvailableForNextPayout(guideMongoId);
    if (amount > available + 0.01) {
      throw new BadRequest(
        `Amount exceeds available balance (max ₹${available.toFixed(2)})`,
      );
    }

    const payout = await Payout.create({
      guideId: guideMongoId,
      amount: roundMoney(amount),
      status: "PENDING",
      createdBy: adminUserId,
    });

    await financialAuditService.log({
      action: "PAYOUT_CREATED",
      actorUserId: adminUserId,
      actorRole: "ADMIN",
      payoutId: payout._id.toString(),
      metadata: {
        guideId: guideMongoId,
        amount: roundMoney(amount),
      },
    });

    return Payout.findById(payout._id)
      .populate("guideId")
      .populate("createdBy", "name email");
  }

  async confirmPayoutByGuide(guideUserId: string, payoutId: string) {
    const guide = await Guide.findOne({ userId: guideUserId });
    if (!guide) {
      throw new Unauthorized("Guide profile not found");
    }

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      throw new NotFound("Payout not found");
    }

    if (payout.guideId.toString() !== guide._id.toString()) {
      throw new Unauthorized("This payout is not yours");
    }

    if (payout.status === "COMPLETED") {
      throw new BadRequest("Payout was already confirmed");
    }

    if (payout.status !== "PENDING") {
      throw new BadRequest("Invalid payout state");
    }

    payout.status = "COMPLETED";
    payout.confirmedAt = new Date();
    await payout.save();

    await financialAuditService.log({
      action: "PAYOUT_CONFIRMED",
      actorUserId: guideUserId,
      actorRole: "GUIDE",
      payoutId: payout._id.toString(),
      metadata: {
        guideId: guide._id.toString(),
        amount: payout.amount,
      },
    });

    return Payout.findById(payout._id)
      .populate("guideId")
      .populate("createdBy", "name email");
  }

  async listPayoutsForGuide(guideMongoId: string) {
    return Payout.find({ guideId: guideMongoId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();
  }

  async listAllPayouts(limit = 100) {
    return Payout.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("guideId")
      .populate("createdBy", "name email")
      .lean();
  }

  async listGuidesPayoutOverview() {
    const guides = await Guide.find({
      verificationStatus: "VERIFIED",
    })
      .populate("userId", "name email")
      .lean();

    const rows = [];
    for (const g of guides) {
      const id = (g as any)._id.toString();
      const wallet = await this.getGuideWalletSummary(id);
      rows.push({
        guideId: id,
        guideName: (g as any).userId?.name ?? "Guide",
        guideEmail: (g as any).userId?.email,
        ...wallet,
      });
    }

    return rows;
  }
}

export const payoutService = new PayoutService();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { payoutService } from "../services/payout.service";
import { Guide } from "../models/Guide";
import { BadRequest } from "../utils/httpException";
import { createAdminPayoutSchema } from "../validations/payout";

export class PayoutController {
  /** Guide dashboard: wallet + pending confirmation amounts */
  async getMySummary(req: AuthRequest, res: Response) {
    const guide = await Guide.findOne({ userId: req.userId });
    if (!guide) {
      return res.status(200).json({
        success: true,
        data: {
          totalEarnings: 0,
          paidOut: 0,
          pendingConfirmation: 0,
          pendingPayout: 0,
          availableForPayout: 0,
        },
      });
    }

    const data = await payoutService.getGuideWalletSummary(guide._id.toString());
    res.status(200).json({ success: true, data });
  }

  async getMyHistory(req: AuthRequest, res: Response) {
    const guide = await Guide.findOne({ userId: req.userId });
    if (!guide) {
      return res.status(200).json({ success: true, data: [] });
    }

    const data = await payoutService.listPayoutsForGuide(guide._id.toString());
    res.status(200).json({ success: true, data });
  }

  async confirm(req: AuthRequest, res: Response) {
    const { payoutId } = req.params;
    const data = await payoutService.confirmPayoutByGuide(req.userId!, payoutId);
    res.status(200).json({
      success: true,
      message: "Payout confirmed",
      data,
    });
  }

  /** POST /api/admin/payout/:guideId */
  async createByAdmin(req: AuthRequest, res: Response) {
    const { guideId } = req.params;
    const parsed = createAdminPayoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequest(parsed.error.issues[0]?.message || "Invalid body");
    }

    const data = await payoutService.createPayoutByAdmin(
      req.userId!,
      guideId,
      parsed.data.amount,
    );

    res.status(201).json({
      success: true,
      message: "Payout created — awaiting guide confirmation",
      data,
    });
  }

  async listAllAdmin(req: AuthRequest, res: Response) {
    const data = await payoutService.listAllPayouts();
    res.status(200).json({ success: true, data });
  }

  async guidesOverview(req: AuthRequest, res: Response) {
    const data = await payoutService.listGuidesPayoutOverview();
    res.status(200).json({ success: true, data });
  }
}

export const payoutController = new PayoutController();

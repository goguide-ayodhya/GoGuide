import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { paymentService } from "../services/payment.service";
import { BadRequest } from "../utils/httpException";
import { verifyWebhookSignature } from "../services/razorpay.service";
import {
  createRefundSchema,
  createRazorpayOrderSchema,
  setPaymentModeSchema,
  verifyRazorpaySchema,
} from "../validations/payment";
import { Payment } from "../models/Payment";

export class PaymentController {
  async handleRazorpayWebhook(req: Request, res: Response) {
    const signature = req.header("x-razorpay-signature");
    if (!signature) {
      throw new BadRequest("Missing webhook signature");
    }

    const rawBody = ((req as Request & { rawBody?: Buffer }).rawBody ??
      req.body) as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
      throw new BadRequest("Webhook body must be raw payload");
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new BadRequest("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const result = await paymentService.processRazorpayWebhookEvent(event);

    res.status(200).json({
      success: true,
      message: "Webhook received",
      data: result,
    });
  }

  async createPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;

      const existing = await Payment.findOne({ bookingId }).populate(
        "bookingId",
      );
      if (existing) {
        const msg =
          existing.status === "COMPLETED"
            ? "Payment already completed"
            : existing.status === "PENDING"
              ? "Payment already pending"
              : "Previous payment failed - reuse available";
        return res.status(200).json({
          success: true,
          message: msg,
          data: existing,
        });
      }

      const payment = await paymentService.createPayment(
        req.userId!,
        bookingId,
      );

      res.status(201).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      });
    } catch (error) {
      throw error;
    }
  }

  async setPaymentMode(req: AuthRequest, res: Response) {
    const { bookingId } = req.params;
    const parsed = setPaymentModeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequest(parsed.error.issues[0]?.message || "Invalid body");
    }
    const booking = await paymentService.setBookingPaymentMode(
      req.userId!,
      bookingId,
      parsed.data.paymentType,
    );
    res.status(200).json({
      success: true,
      message: "Payment option saved",
      data: booking,
    });
  }

  async createRazorpayOrder(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const parsed = createRazorpayOrderSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new BadRequest(parsed.error.issues[0]?.message || "Invalid body");
      }
      const result = await paymentService.createRazorpayOrderForBooking(
        req.userId!,
        bookingId,
        parsed.data.paymentStage
          ? { paymentStage: parsed.data.paymentStage }
          : undefined,
      );

      console.log("RAZORPAY ORDER RESULT:", result);
      console.log("AMOUNT:", result.amount);

      res.status(200).json({
        success: true,
        message: "Razorpay order created",
        data: result,
      });
    } catch (error) {
      console.error("Error in createRazorpayOrder:", error);
      const errAny: any = error;
      if (errAny && (errAny.code === 11000 || errAny.code === 1100)) {
        try {
          const { bookingId } = req.params;
          const existing = await Payment.findOne({ bookingId }).populate(
            "bookingId",
          );
          if (existing) {
            return res.status(409).json({
              success: false,
              message: "Payment already exists",
              data: existing,
            });
          }
        } catch (e) {
          console.error(
            "Failed to fetch existing payment after duplicate error",
            e,
          );
        }
        return res.status(409).json({
          success: false,
          message: "Payment already exists (duplicate creation prevented)",
        });
      }

      throw error; // let global handler translate other errors
    }
  }

  async listBookingPayments(req: AuthRequest, res: Response) {
    const { bookingId } = req.params;
    const payments = await paymentService.getPaymentsByBookingId(
      bookingId,
      req.userId!,
    );
    res.status(200).json({
      success: true,
      message: "Payments retrieved",
      data: payments,
    });
  }

  async processPayment(req: AuthRequest, res: Response) {
    try {
      const paymentId = req.params.paymentId || req.body.paymentId;

      console.log("Processing payment", {
        paymentId,
        body: req.body,
        userId: req.userId,
      });

      if (!paymentId) {
        throw new BadRequest("paymentId is required");
      }

      const verifyParsed = verifyRazorpaySchema.safeParse(req.body);
      const payment = verifyParsed.success
        ? await paymentService.verifyAndCompleteRazorpayPayment(
            req.userId!,
            paymentId,
            verifyParsed.data,
          )
        : await paymentService.processPayment(paymentId, req.body, req.userId!);

      console.log("VERIFY BODY:", req.body);

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: payment,
      });
    } catch (error) {
      throw error;
    }
  }

  async createRefund(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;
    const parsed = createRefundSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequest(parsed.error.issues[0]?.message || "Invalid body");
    }
    const data = await paymentService.createRefund(
      req.userId!,
      paymentId,
      parsed.data,
    );
    res.status(201).json({
      success: true,
      message: "Refund initiated",
      data,
    });
  }

  async createCancellationRefund(req: AuthRequest, res: Response) {
    const { bookingId } = req.params;
    const data = await paymentService.createCancellationRefunds(
      req.userId!,
      bookingId,
      req.body?.reason,
    );
    res.status(201).json({
      success: true,
      message: "Cancellation refund processed",
      data,
    });
  }

  async listRefunds(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;
    const data = await paymentService.getRefundsForPayment(
      req.userId!,
      paymentId,
    );
    res.status(200).json({
      success: true,
      message: "Refunds retrieved",
      data,
    });
  }

  async listBookingRefunds(req: AuthRequest, res: Response) {
    const { bookingId } = req.params;
    const data = await paymentService.getRefundsByBooking(
      req.userId!,
      bookingId,
    );
    res.status(200).json({
      success: true,
      message: "Booking refunds retrieved",
      data,
    });
  }

  async getMyRefunds(req: AuthRequest, res: Response) {
    const data = await paymentService.getRefundsByUser(req.userId!);
    res.status(200).json({
      success: true,
      message: "User refunds retrieved",
      data,
    });
  }

  async retryPayment(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;
    const data = await paymentService.retryFailedPayment(
      req.userId!,
      paymentId,
    );
    res.status(200).json({
      success: true,
      message: "Retry order created",
      data,
    });
  }

  async getFinancialAuditLogs(req: AuthRequest, res: Response) {
    const limit = Number(req.query.limit ?? 100);
    const data = await paymentService.getFinancialAuditLogs(req.userId!, limit);
    res.status(200).json({
      success: true,
      message: "Financial audit logs retrieved",
      data,
    });
  }

  async skipPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const result = await paymentService.skipPayment(req.userId!, bookingId);

      res.status(200).json({
        success: true,
        message: "Payment skipped successfully",
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyPayments(req: AuthRequest, res: Response) {
    try {
      const payments = await paymentService.getPaymentsByUser(req.userId!);

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: payments,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuidePayments(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const payments = await paymentService.getPaymentsByGuide(guideId);

      res.status(200).json({
        success: true,
        message: "Guide payments retrieved successfully",
        data: payments,
      });
    } catch (error) {
      throw error;
    }
  }

  async getPaymentStats(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const stats = await paymentService.getPaymentStats(guideId);

      res.status(200).json({
        success: true,
        message: "Payment statistics retrieved",
        data: stats,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuideEarnings(req: AuthRequest, res: Response) {
    const guideId = req.params.guideId || req.userId!;

    const data = await paymentService.getGuideEarnings(guideId!);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getTotalRevenue(req: AuthRequest, res: Response) {
    const data = await paymentService.getTotalRevenue();

    res.status(200).json({
      success: true,
      message: "Total revenue fetched",
      data,
    });
  }

  async getMonthlyRevenue(req: AuthRequest, res: Response) {
    const data = await paymentService.getMonthlyRevenue();

    res.status(200).json({
      success: true,
      message: "Monthly revenue fetched",
      data,
    });
  }

  async getGuideMonthlyEarnings(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const data = await paymentService.getGuideMonthlyEarnings(guideId);

      res.status(200).json({
        success: true,
        message: "Guide monthly earnings fetched",
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuideWeeklyEarnings(req: AuthRequest, res: Response) {
    try {
      const guideId = req.userId!;
      const data = await paymentService.getGuideWeeklyEarnings(guideId);

      res.status(200).json({
        success: true,
        message: "Guide weekly earnings fetched",
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDriverEarnings(req: AuthRequest, res: Response) {
    try {
      const driverId = req.userId!;
      const data = await paymentService.getDriverEarnings(driverId);

      res.status(200).json({
        success: true,
        message: "Driver earnings fetched",
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDriverMonthlyEarnings(req: AuthRequest, res: Response) {
    try {
      const driverId = req.userId!;
      const data = await paymentService.getDriverMonthlyEarnings(driverId);

      res.status(200).json({
        success: true,
        message: "Driver monthly earnings fetched",
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDriverWeeklyEarnings(req: AuthRequest, res: Response) {
    try {
      const driverId = req.userId!;
      const data = await paymentService.getDriverWeeklyEarnings(driverId);

      res.status(200).json({
        success: true,
        message: "Driver weekly earnings fetched",
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async completeCodPayment(req: AuthRequest, res: Response) {
    const { bookingId } = req.params;
    const booking = await paymentService.completeCodPayment(
      req.userId!,
      bookingId,
    );

    res.status(200).json({
      success: true,
      message: "Cash payment marked as collected",
      data: booking,
    });
  }

  async getAdminPaymentsSummary(req: AuthRequest, res: Response) {
    const data = await paymentService.getAdminPaymentsSummary();

    res.status(200).json({
      success: true,
      message: "Admin payment summary",
      data,
    });
  }
}

export const paymentController = new PaymentController();

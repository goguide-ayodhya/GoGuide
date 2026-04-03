import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { paymentService } from "../services/payment.service";

export class PaymentController {
  async createPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
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

  async processPayment(req: AuthRequest, res: Response) {
    try {
      const paymentId = req.userId!;
      const payment = await paymentService.processPayment(
        paymentId,
        req.body,
        req.userId!,
      );

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: payment,
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
}

export const paymentController = new PaymentController();

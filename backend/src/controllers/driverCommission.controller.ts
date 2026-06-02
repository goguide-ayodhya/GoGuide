import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { driverCommissionService } from "../services/driverCommission.service";

export class DriverCommissionController {
  async recordPayment(req: AuthRequest, res: Response) {
    const { driverId, amount, note } = req.body;

    if (!driverId || !amount) {
      return res.status(400).json({
        success: false,
        message: "driverId and amount are required",
      });
    }

    try {
      const payment = await driverCommissionService.recordCommissionPayment(
        driverId,
        amount,
        req.userId!,
        note
      );
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to record payment",
      });
    }
  }

  async confirmPayment(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    try {
      await driverCommissionService.confirmCommissionPayment(paymentId);
      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to confirm payment",
      });
    }
  }

  async getDriverWallet(req: AuthRequest, res: Response) {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required",
      });
    }

    try {
      const wallet = await driverCommissionService.getDriverWallet(driverId);
      res.status(200).json({ success: true, data: wallet });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get wallet",
      });
    }
  }

  async getPaymentHistory(req: AuthRequest, res: Response) {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required",
      });
    }

    try {
      const history = await driverCommissionService.getDriverPaymentHistory(driverId);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get payment history",
      });
    }
  }

  async getAllPendingCommissions(req: AuthRequest, res: Response) {
    try {
      const payments = await driverCommissionService.getAllPendingCommissions();
      res.status(200).json({ success: true, data: payments });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get pending commissions",
      });
    }
  }

  async getCollectionOverview(req: AuthRequest, res: Response) {
    try {
      const overview = await driverCommissionService.getDriverCollectionOverview();
      res.status(200).json({ success: true, data: overview });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get collection overview",
      });
    }
  }
}

export const driverCommissionController = new DriverCommissionController();

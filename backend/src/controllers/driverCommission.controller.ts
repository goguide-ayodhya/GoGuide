import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { driverCommissionService } from "../services/driverCommission.service";

export class DriverCommissionController {
  // ──────────────────────────────────────────────
  // DRIVER: Submit payment request
  // ──────────────────────────────────────────────
  async submitPaymentRequest(req: AuthRequest, res: Response) {
    const { amount, transactionReference, notes } = req.body;

    if (!amount || !transactionReference) {
      return res.status(400).json({
        success: false,
        message: "amount and transactionReference are required",
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a positive number",
      });
    }

    // Resolve driver ID from authenticated user
    const { Driver } = require("../models/Driver");
    const driver = await Driver.findOne({ userId: req.userId });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    try {
      const payment = await driverCommissionService.submitDriverPaymentRequest(
        driver._id.toString(),
        parsedAmount,
        transactionReference,
        notes
      );
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to submit payment request",
      });
    }
  }

  // ──────────────────────────────────────────────
  // ADMIN: Approve payment request
  // ──────────────────────────────────────────────
  async approveRequest(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    try {
      await driverCommissionService.approvePaymentRequest(paymentId, req.userId!);
      res.status(200).json({
        success: true,
        message: "Payment request approved successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to approve payment request",
      });
    }
  }

  // ──────────────────────────────────────────────
  // ADMIN: Reject payment request
  // ──────────────────────────────────────────────
  async rejectRequest(req: AuthRequest, res: Response) {
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "rejection reason is required",
      });
    }

    try {
      await driverCommissionService.rejectPaymentRequest(paymentId, req.userId!, reason);
      res.status(200).json({
        success: true,
        message: "Payment request rejected",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reject payment request",
      });
    }
  }

  // ──────────────────────────────────────────────
  // ADMIN: Get all requests (with optional status filter)
  // ──────────────────────────────────────────────
  async getAllRequests(req: AuthRequest, res: Response) {
    const status = (req.query.status as string) || "ALL";
    try {
      const requests = await driverCommissionService.getAllRequests(status);
      res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get requests",
      });
    }
  }

  // ──────────────────────────────────────────────
  // ADMIN: Overview stats (total generated/collected/pending)
  // ──────────────────────────────────────────────
  async getOverviewStats(req: AuthRequest, res: Response) {
    try {
      const stats = await driverCommissionService.getCommissionOverviewStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get overview stats",
      });
    }
  }

  // ──────────────────────────────────────────────
  // Legacy endpoints (kept for backward compat)
  // ──────────────────────────────────────────────
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
      await driverCommissionService.approvePaymentRequest(paymentId, req.userId!);
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

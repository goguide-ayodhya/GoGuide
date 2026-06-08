import { Router } from "express";
import { adminSettingsController } from "../controllers/adminSettings.controller";
import { driverCommissionController } from "../controllers/driverCommission.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// ──────────────────────────────────────────────
// Admin Settings Routes (admin only)
// ──────────────────────────────────────────────
router.get("/settings", authenticate, authorize(["ADMIN", "DRIVER"]), (req, res, next) => {
  adminSettingsController.getSettings(req, res).catch(next);
});

router.patch("/settings/commission", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  adminSettingsController.updateCommissionPercent(req, res).catch(next);
});

// ──────────────────────────────────────────────
// DRIVER: Submit own commission payment request
// ──────────────────────────────────────────────
router.post("/commission/request", authenticate, authorize(["DRIVER"]), (req, res, next) => {
  driverCommissionController.submitPaymentRequest(req, res).catch(next);
});

// ──────────────────────────────────────────────
// ADMIN: Manage payment requests
// ──────────────────────────────────────────────

// Get all requests with optional ?status=PENDING|APPROVED|REJECTED|ALL
router.get("/commission/requests", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getAllRequests(req, res).catch(next);
});

// Approve request
router.patch("/commission/:paymentId/approve", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.approveRequest(req, res).catch(next);
});

// Reject request (with reason)
router.patch("/commission/:paymentId/reject", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.rejectRequest(req, res).catch(next);
});

// Overview stats: total generated/collected/pending
router.get("/commission/overview", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getOverviewStats(req, res).catch(next);
});

// ──────────────────────────────────────────────
// Legacy Admin Routes (backward compat)
// ──────────────────────────────────────────────
router.post("/commission/record", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.recordPayment(req, res).catch(next);
});

router.patch("/commission/:paymentId/confirm", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.confirmPayment(req, res).catch(next);
});

router.get("/commissions/pending", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getAllPendingCommissions(req, res).catch(next);
});

// ──────────────────────────────────────────────
// Driver Wallet + Payment History (driver or admin)
// ──────────────────────────────────────────────
router.get("/driver/:driverId/wallet", authenticate, authorize(["DRIVER", "ADMIN"]), (req, res, next) => {
  driverCommissionController.getDriverWallet(req, res).catch(next);
});

router.get("/driver/:driverId/payments", authenticate, authorize(["DRIVER", "ADMIN"]), (req, res, next) => {
  driverCommissionController.getPaymentHistory(req, res).catch(next);
});

// ──────────────────────────────────────────────
// Admin: Collection overview (drivers with pending > 0)
// ──────────────────────────────────────────────
router.get("/drivers/collection/overview", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getCollectionOverview(req, res).catch(next);
});

export default router;

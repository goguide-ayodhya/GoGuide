import { Router } from "express";
import { adminSettingsController } from "../controllers/adminSettings.controller";
import { driverCommissionController } from "../controllers/driverCommission.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Admin Settings Routes (admin only)
router.get("/settings", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  adminSettingsController.getSettings(req, res).catch(next);
});

router.patch("/settings/commission", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  adminSettingsController.updateCommissionPercent(req, res).catch(next);
});

// Driver Commission Routes (admin only)
router.post("/commission/record", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.recordPayment(req, res).catch(next);
});

router.patch("/commission/:paymentId/confirm", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.confirmPayment(req, res).catch(next);
});

router.get("/driver/:driverId/wallet", authenticate, authorize(["DRIVER", "ADMIN"]), (req, res, next) => {
  driverCommissionController.getDriverWallet(req, res).catch(next);
});

router.get("/driver/:driverId/payments", authenticate, authorize(["DRIVER", "ADMIN"]), (req, res, next) => {
  driverCommissionController.getPaymentHistory(req, res).catch(next);
});

router.get("/commissions/pending", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getAllPendingCommissions(req, res).catch(next);
});

router.get("/drivers/collection/overview", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverCommissionController.getCollectionOverview(req, res).catch(next);
});

export default router;

import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/booking/:bookingId", authenticate, (req, res, next) => {
  paymentController.createPayment(req, res).catch(next);
});

router.post("/:paymentId/process", authenticate, (req, res, next) => {
  paymentController.processPayment(req, res).catch(next);
});

router.get("/my-payments", authenticate, (req, res, next) => {
  paymentController.getMyPayments(req, res).catch(next);
});

router.get("/guide", authenticate, (req, res, next) => {
  paymentController.getGuidePayments(req, res).catch(next);
});

router.get("/guide/stats", authenticate, (req, res, next) => {
  paymentController.getPaymentStats(req, res).catch(next);
});

router.get("/guide/earnings", authenticate, (req, res, next) => {
  paymentController.getGuideEarnings(req, res).catch(next);
});

router.get("/guide/monthly-earnings", authenticate, (req, res, next) => {
  paymentController.getGuideMonthlyEarnings(req, res).catch(next);
});

router.get("/guide/weekly-earnings", authenticate, (req, res, next) => {
  paymentController.getGuideWeeklyEarnings(req, res).catch(next);
});

router.get("/driver/earnings", authenticate, (req, res, next) => {
  paymentController.getDriverEarnings(req, res).catch(next);
});

router.get("/driver/monthly-earnings", authenticate, (req, res, next) => {
  paymentController.getDriverMonthlyEarnings(req, res).catch(next);
});

router.get("/driver/weekly-earnings", authenticate, (req, res, next) => {
  paymentController.getDriverWeeklyEarnings(req, res).catch(next);
});

router.get(
  "/admin/revenue",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    paymentController.getTotalRevenue(req, res).catch(next);
  },
);

router.get(
  "/admin/revenue/monthly",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    paymentController.getMonthlyRevenue(req, res).catch(next);
  },
);

export default router;

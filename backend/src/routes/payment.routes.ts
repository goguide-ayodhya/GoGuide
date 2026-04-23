import express from "express";
import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    paymentController.handleRazorpayWebhook(req, res).catch(next);
  },
);

router.post("/booking/:bookingId", authenticate, (req, res, next) => {
  paymentController.createPayment(req, res).catch(next);
});

router.post("/booking/:bookingId/mode", authenticate, (req, res, next) => {
  paymentController.setPaymentMode(req, res).catch(next);
});

router.get("/test-razorpay", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
  res.json({
    success: true,
    message: "Razorpay config check",
    data: {
      keyId: keyId ? `${keyId.substring(0, 10)}...` : null,
      hasSecret,
      configured: !!(keyId && hasSecret),
    },
  });
});

router.get("/booking/:bookingId", authenticate, (req, res, next) => {
  paymentController.listBookingPayments(req, res).catch(next);
});

router.get("/booking/:bookingId/refunds", authenticate, (req, res, next) => {
  paymentController.listBookingRefunds(req, res).catch(next);
});

router.get("/my-refunds", authenticate, (req, res, next) => {
  paymentController.getMyRefunds(req, res).catch(next);
});

router.post("/booking/:bookingId/skip", authenticate, (req, res, next) => {
  paymentController.skipPayment(req, res).catch(next);
});

router.patch("/cod/complete/:bookingId", authenticate, (req, res, next) => {
  paymentController.completeCodPayment(req, res).catch(next);
});

router.post("/:paymentId/process", authenticate, (req, res, next) => {
  paymentController.processPayment(req, res).catch(next);
});

router.post("/:paymentId/refund", authenticate, (req, res, next) => {
  paymentController.createRefund(req, res).catch(next);
});

router.post(
  "/booking/:bookingId/razorpay-order",
  authenticate,
  (req, res, next) => {
    paymentController.createRazorpayOrder(req, res).catch(next);
  },
);

router.post(
  "/booking/:bookingId/refund/cancellation",
  authenticate,
  (req, res, next) => {
    paymentController.createCancellationRefund(req, res).catch(next);
  },
);

router.get("/:paymentId/refunds", authenticate, (req, res, next) => {
  paymentController.listRefunds(req, res).catch(next);
});

router.post("/:paymentId/retry", authenticate, (req, res, next) => {
  paymentController.retryPayment(req, res).catch(next);
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
  "/admin/payments/summary",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    paymentController.getAdminPaymentsSummary(req, res).catch(next);
  },
);

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

router.get(
  "/admin/audit-logs",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    paymentController.getFinancialAuditLogs(req, res).catch(next);
  },
);

export default router;

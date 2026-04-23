import { Router } from "express";
import { payoutController } from "../controllers/payout.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/me/summary", authenticate, (req, res, next) => {
  payoutController.getMySummary(req, res).catch(next);
});

router.get("/me/history", authenticate, (req, res, next) => {
  payoutController.getMyHistory(req, res).catch(next);
});

router.patch(
  "/confirm/:payoutId",
  authenticate,
  authorize(["GUIDE"]),
  (req, res, next) => {
    payoutController.confirm(req, res).catch(next);
  },
);

export default router;

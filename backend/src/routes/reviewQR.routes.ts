import { Router } from "express";
import {
  getGuideByReviewToken,
  submitReviewByToken,
  getMyReviewQR,
  regenerateReviewToken,
  generateAllGuideQRCodes,
  toggleReviewCollection,
} from "../controllers/reviewQR.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// ─── Public routes (no auth) ──────────────────────────────────────────────────
router.get("/token/:token", getGuideByReviewToken);
router.post("/token/:token/submit", submitReviewByToken);

// ─── Guide: own QR ───────────────────────────────────────────────────────────
router.get("/my-qr", authenticate, authorize(["GUIDE"]), (req, res, next) => {
  getMyReviewQR(req, res).catch(next);
});

// ─── Admin: manage guide QRs ─────────────────────────────────────────────────
router.post("/:guideId/regenerate", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  regenerateReviewToken(req, res).catch(next);
});

// Admin one-time bulk generation
router.post("/generate-all", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  generateAllGuideQRCodes(req, res).catch(next);
});

router.patch("/:guideId/toggle-collection", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  toggleReviewCollection(req, res).catch(next);
});

export default router;

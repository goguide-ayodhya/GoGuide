import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Guide } from "../models/Guide";
import { Review } from "../models/Review";
import { ReviewSpamPreventionService } from "../services/reviewSpamPrevention.service";
import crypto from "crypto";
import QRCode from "qrcode";
import { uploadBufferToStorage } from "../services/fileUpload.service";

// ─── Public: Get guide info by review token (for tourist review page) ───────
export async function getGuideByReviewToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const guide = await Guide.findOne({ reviewQRToken: token, reviewCollectionEnabled: { $ne: false } })
      .populate("userId", "name avatar")
      .select("userId averageRating totalReviews reviewCollectionEnabled reviewQRToken reviewQRImage verificationStatus");

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found or review collection is disabled" });
    }

    return res.status(200).json({ success: true, data: guide });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Public: Submit a review via QR token (no auth required) ─────────────────
export async function submitReviewByToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { rating, comments, reviewerName, deviceFingerprint } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const guide = await Guide.findOne({ reviewQRToken: token, reviewCollectionEnabled: { $ne: false } });
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found or review collection is disabled" });
    }

    // ─── Spam Prevention ───────────────────────────────────────────────────────
    const clientIP = ReviewSpamPreventionService.getClientIP(req);
    const { allowed, remainingTime } = await ReviewSpamPreventionService.canSubmitReview(
      guide._id,
      clientIP,
      deviceFingerprint
    );

    if (!allowed) {
      const hours = Math.ceil((remainingTime || 0) / 3600);
      return res.status(429).json({
        success: false,
        message: `You can only submit one review per guide every 24 hours. Please try again in ${hours} hour${hours !== 1 ? "s" : ""}.`,
        retryAfter: remainingTime,
      });
    }

    // Create a review without bookingId (QR review — use a synthetic ObjectId)
    // We'll use a random ObjectId to satisfy uniqueness while marking it as a QR review
    const { Types } = await import("mongoose");
    const syntheticBookingId = new Types.ObjectId();

    const review = await Review.create({
      bookingId: syntheticBookingId,
      guideId: guide._id,
      userId: guide.userId, // attribute to guide's user as placeholder
      rating: Math.round(rating),
      comments: comments || "",
      reviewerName: reviewerName || "Anonymous",
      isQRReview: true,
    });

    // Update guide rating
    const allReviews = await Review.find({ guideId: guide._id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    guide.averageRating = Math.round(avgRating * 10) / 10;
    guide.totalReviews = allReviews.length;
    await guide.save();

    // Record submission for spam prevention
    await ReviewSpamPreventionService.recordReviewSubmission(guide._id, clientIP, deviceFingerprint);

    return res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Guide: Get own review QR token ─────────────────────────────────────────
export async function getMyReviewQR(req: AuthRequest, res: Response) {
  try {
    const guide = await Guide.findOne({ userId: req.userId }).select("reviewQRToken reviewCollectionEnabled");
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }
    return res.status(200).json({ success: true, data: guide });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Guide: Regenerate own review QR token ────────────────────────────────────
export async function regenerateMyReviewToken(req: AuthRequest, res: Response) {
  try {
    const guide = await Guide.findOne({ userId: req.userId });
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" });
    }

    // regenerate token
    const newToken = crypto.randomUUID();
    guide.reviewQRToken = newToken;

    // generate QR image pointing to public review page
    const clientBase = process.env.CLIENT_BASE_URL || process.env.FRONTEND_BASE_URL || `http://localhost:3000`;
    const reviewUrl = `${clientBase.replace(/\/$/, "")}/tourist/guides/review/${newToken}`;

    try {
      const pngBuffer = await QRCode.toBuffer(reviewUrl, { type: "png", width: 400 });
      const uploadedUrl = await uploadBufferToStorage(pngBuffer, `guide-${guide._id}-review-qr.png`);
      guide.reviewQRImage = uploadedUrl;
    } catch (e) {
      // If QR generation/upload fails, continue but log the error
      console.error("QR generation failed:", e);
    }

    await guide.save();

    return res.status(200).json({
      success: true,
      data: { reviewQRToken: guide.reviewQRToken, reviewQRImage: guide.reviewQRImage },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Regenerate a guide's review token ────────────────────────────────
export async function regenerateReviewToken(req: AuthRequest, res: Response) {
  try {
    const { guideId } = req.params;
    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });

    // regenerate token
    const newToken = crypto.randomUUID();
    guide.reviewQRToken = newToken;

    // generate QR image pointing to public review page
    const clientBase = process.env.CLIENT_BASE_URL || process.env.FRONTEND_BASE_URL || `http://localhost:3000`;
    const reviewUrl = `${clientBase.replace(/\/$/, "")}/tourist/guides/review/${newToken}`;

    try {
      const pngBuffer = await QRCode.toBuffer(reviewUrl, { type: "png", width: 400 });
      const uploadedUrl = await uploadBufferToStorage(pngBuffer, `guide-${guide._id}-review-qr.png`);
      guide.reviewQRImage = uploadedUrl;
    } catch (e) {
      // If QR generation/upload fails, continue but log the error
      console.error("QR generation failed:", e);
    }

    await guide.save();

    return res.status(200).json({
      success: true,
      data: { reviewQRToken: guide.reviewQRToken, reviewQRImage: guide.reviewQRImage },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Toggle review collection for a guide ─────────────────────────────
export async function toggleReviewCollection(req: AuthRequest, res: Response) {
  try {
    const { guideId } = req.params;
    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });

    guide.reviewCollectionEnabled = !guide.reviewCollectionEnabled;
    await guide.save();

    return res.status(200).json({
      success: true,
      data: { reviewCollectionEnabled: guide.reviewCollectionEnabled },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Generate QR images for all guides (one-time) ───────────────
export async function generateAllGuideQRCodes(req: AuthRequest, res: Response) {
  try {
    const guides = await Guide.find({});
    const clientBase = process.env.CLIENT_BASE_URL || process.env.FRONTEND_BASE_URL || `http://localhost:3000`;

    const results: { guideId: string; success: boolean; message?: string; url?: string }[] = [];

    for (const guide of guides) {
      try {
        // ensure token exists
        if (!guide.reviewQRToken) guide.reviewQRToken = crypto.randomUUID();

        const reviewUrl = `${clientBase.replace(/\/$/, "")}/tourist/guides/review/${guide.reviewQRToken}`;
        const pngBuffer = await QRCode.toBuffer(reviewUrl, { type: "png", width: 400 });
        const uploadedUrl = await uploadBufferToStorage(pngBuffer, `guide-${guide._id}-review-qr.png`);
        guide.reviewQRImage = uploadedUrl;
        guide.reviewCollectionEnabled = true;
        await guide.save();
        results.push({ guideId: guide._id.toString(), success: true, url: uploadedUrl });
      } catch (e: any) {
        results.push({ guideId: guide._id.toString(), success: false, message: e.message });
      }
    }

    return res.status(200).json({ success: true, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

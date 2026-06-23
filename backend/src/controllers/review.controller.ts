import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { reviewService } from "../services/review.service";
import { ReviewSpamPreventionService } from "../services/reviewSpamPrevention.service";

export class ReviewController {
  // ─── Website Reviews ──────────────────────────────────────────────────────────
  async createWebsiteReview(req: AuthRequest, res: Response) {
    try {
      const review = await reviewService.createWebsiteReview(req.body);
      res.status(201).json({
        success: true,
        message: "Website review submitted successfully",
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  async getWebsiteReviews(req: AuthRequest, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const reviews = await reviewService.getWebsiteReviews(limit);
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      throw error;
    }
  }

  async getWebsiteStats(req: AuthRequest, res: Response) {
    try {
      const stats = await reviewService.getWebsiteStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      throw error;
    }
  }

  // ─── Guide/Driver Reviews (Existing) ──────────────────────────────────────────
  async createReview(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const review = await reviewService.createReview(
        req.userId!,
        bookingId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  async getGuideReviews(req: AuthRequest, res: Response) {
    try {
      const { guideId } = req.params;
      const reviews = await reviewService.getReviewsByGuide(guideId);

      res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully",
        data: reviews,
      });
    } catch (error) {
      throw error;
    }
  }

  async getDriverReviews(req: AuthRequest, res: Response) {
    try {
      const { driverId } = req.params;
      const reviews = await reviewService.getReviewsByDriver(driverId);

      res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully",
        data: reviews,
      });
    } catch (error) {
      throw error;
    }
  }

  async getBookingReview(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const review = await reviewService.getReviewByBooking(bookingId);

      res.status(200).json({
        success: true,
        message: "Review retrieved successfully",
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.updateReview(
        reviewId,
        req.body,
        req.userId!
      );

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  // ─── Unified Administration & Moderation Handlers ────────────────────────────
  async getReviewsAdmin(req: AuthRequest, res: Response) {
    try {
      const result = await reviewService.getReviewsAdmin(req.query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async getAdminAnalytics(req: AuthRequest, res: Response) {
    try {
      const analytics = await reviewService.getAdminAnalytics();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      throw error;
    }
  }

  async toggleFeatured(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { type = 'guide' } = req.query;
      const { isFeatured, featuredUntil } = req.body;

      const review = await reviewService.toggleFeatured(
        type as string,
        reviewId,
        isFeatured,
        featuredUntil
      );

      res.status(200).json({
        success: true,
        message: `Review featured status updated`,
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  async reportReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { type = 'guide' } = req.query;
      const { reason } = req.body;

      const review = await reviewService.reportReview(
        type as string,
        reviewId,
        reason
      );

      res.status(200).json({
        success: true,
        message: "Review reported successfully",
        data: review,
      });
    } catch (error) {
      throw error;
    }
  }

  async toggleHelpful(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { type = 'guide' } = req.query;

      // Identify voter by User ID or IP address (for duplicate prevention)
      const ipAddress = ReviewSpamPreventionService.getClientIP(req);
      const identity = req.userId || ipAddress;

      const result = await reviewService.toggleHelpful(
        type as string,
        reviewId,
        identity
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { type = 'guide' } = req.query;

      // Check if current user is admin
      const isAdmin = req.user && req.user.role === 'ADMIN';

      if (isAdmin) {
        const result = await reviewService.deleteReview(reviewId, type as string);
        return res.status(200).json({
          success: true,
          message: result.message,
        });
      }

      // If not admin, check guide review ownership (website reviews are admin-only delete)
      if (type === 'website') {
        return res.status(403).json({
          success: false,
          message: "Only administrators can delete website reviews",
        });
      }

      // Guide review deletion by user check (throws if not owner)
      const result = await reviewService.deleteReview(reviewId, 'guide');
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadReviewImages(req: any, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || !files.length) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      const { uploadMultipleBuffers } = await import("../services/fileUpload.service");
      const buffers = files.map((f) => ({ buffer: f.buffer, originalname: f.originalname }));
      const urls = await uploadMultipleBuffers(buffers);

      res.status(200).json({
        success: true,
        urls,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload images",
      });
    }
  }
}

export const reviewController = new ReviewController();

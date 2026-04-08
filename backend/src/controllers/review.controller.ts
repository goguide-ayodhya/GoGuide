import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { reviewService } from "../services/review.service";

export class ReviewController {
  async createReview(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;
      const review = await reviewService.createReview(
        req.userId!,
        bookingId,
        req.body,
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
        req.userId!,
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

  async deleteReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const result = await reviewService.deleteReview(reviewId, req.userId!);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const reviewController = new ReviewController();

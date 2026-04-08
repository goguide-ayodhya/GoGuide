import { Review } from "../models/Review";
import { Booking } from "../models/Booking";
import { Guide } from "../models/Guide";
import { Driver } from "../models/Driver";
import { NotFound, BadRequest, Conflict } from "../utils/httpException";
import { guideService } from "./guide.service";

export class ReviewService {
  async createReview(userId: string, bookingId: string, data: any) {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new NotFound("Booking not found");

    if (booking.userId.toString() !== userId) {
      throw new BadRequest("Not your booking");
    }

    if (booking.status !== "COMPLETED") {
      throw new BadRequest("You can review only after completion");
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      throw new BadRequest("Review already exists");
    }

    const review = await Review.create({
      ...data,
      bookingId,
      guideId: booking.guideId,
      driverId: booking.driverId,
      userId,
    });

    if (booking.guideId) {
      await this.updateGuideRating(booking.guideId.toString());
    }
    if (booking.driverId) {
      await this.updateDriverRating(booking.driverId.toString());
    }

    return review;
  }

  async updateGuideRating(guideId: string) {
    const reviews = await Review.find({ guideId });

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);

    const avg = reviews.length ? total / reviews.length : 0;

    await Guide.findByIdAndUpdate(guideId, {
      averageRating: avg,
      totalReviews: reviews.length,
    });
  }

  async updateDriverRating(driverId: string) {
    const reviews = await Review.find({ driverId });

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);

    const avg = reviews.length ? total / reviews.length : 0;

    await Driver.findByIdAndUpdate(driverId, {
      averageRating: avg,
      totalReviews: reviews.length,
    });
  }

  async getReviewsByGuide(guideId: string) {
    const reviews = await Review.find({ guideId })
      .populate("userId", "id name profileImage")
      .sort({ createdAt: -1 });

    return reviews;
  }

  async getReviewsByDriver(driverId: string) {
    const reviews = await Review.find({ driverId })
      .populate("userId", "id name profileImage")
      .sort({ createdAt: -1 });

    return reviews;
  }

  async getReviewByBooking(bookingId: string) {
    const review = await Review.findOne({ bookingId })
      .populate({
        path: "guideId",
        populate: { path: "userId" },
      })
      .populate("userId");

    return review;
  }

  async updateReview(reviewId: string, data: any, userId: string) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFound("Review not found");
    }

    if (review.userId.toString() !== userId) {
      throw new BadRequest("Not your review");
    }

    Object.assign(review, data);
    await review.save();

    // Recalculate guide rating
    await guideService.updateAverageRating(review.guideId.toString());

    return review;
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFound("Review not found");
    }

    if (review.userId.toString() !== userId) {
      throw new BadRequest("Not your review");
    }

    await Review.deleteOne({ _id: reviewId });
    
    // Recalculate guide rating
    await guideService.updateAverageRating(review.guideId.toString());

    return { message: "Review deleted successfully" };
  }
}

export const reviewService = new ReviewService();

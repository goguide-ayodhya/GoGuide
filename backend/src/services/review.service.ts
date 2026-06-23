import { Review } from "../models/Review";
import { WebsiteReview } from "../models/WebsiteReview";
import { Booking } from "../models/Booking";
import { Guide } from "../models/Guide";
import { Driver } from "../models/Driver";
import { NotFound, BadRequest } from "../utils/httpException";
import { guideService } from "./guide.service";
import { filterProfanity } from "../utils/profanityFilter";
import { Types } from "mongoose";

export class ReviewService {
  // ─── Website Reviews ──────────────────────────────────────────────────────────
  async createWebsiteReview(data: any) {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new BadRequest("Rating must be between 1 and 5");
    }
    if (!data.comments) {
      throw new BadRequest("Comments are required");
    }
    if (!data.travelerName) {
      throw new BadRequest("Traveler name is required");
    }

    // Apply profanity filter
    const commentsSanitized = filterProfanity(data.comments);
    const titleSanitized = data.title ? filterProfanity(data.title) : undefined;

    const review = await WebsiteReview.create({
      rating: Number(data.rating),
      title: titleSanitized,
      comments: commentsSanitized,
      travelerName: data.travelerName,
      profileImage: data.profileImage,
      city: data.city,
      bookingType: data.bookingType,
      images: data.images || [],
    });

    return review;
  }

  async getWebsiteReviews(limit = 10) {
    const now = new Date();
    // Return website reviews, putting active featured first, then newest
    const reviews = await WebsiteReview.aggregate([
      { $match: { isReported: { $ne: true } } },
      {
        $addFields: {
          isActiveFeatured: {
            $and: [
              { $eq: ["$isFeatured", true] },
              {
                $or: [
                  { $eq: [{ $type: "$featuredUntil" }, "missing"] },
                  { $eq: ["$featuredUntil", null] },
                  { $gt: ["$featuredUntil", now] }
                ]
              }
            ]
          }
        }
      },
      { $sort: { isActiveFeatured: -1, createdAt: -1 } },
      { $limit: Number(limit) }
    ]);

    return reviews;
  }

  async getWebsiteStats() {
    const totalReviews = await WebsiteReview.countDocuments({ isReported: { $ne: true } });
    const stats = await WebsiteReview.aggregate([
      { $match: { isReported: { $ne: true } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const averageRating = stats[0]?.avgRating ? Number(stats[0].avgRating.toFixed(1)) : 4.8;
    return { averageRating, totalReviews };
  }

  // ─── Guide/Driver Reviews (Existing logic expanded) ───────────────────────────
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

    // Apply profanity filter
    const commentsSanitized = data.comments ? filterProfanity(data.comments) : "";

    const review = await Review.create({
      ...data,
      comments: commentsSanitized,
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

  async updateReview(reviewId: string, data: any, userId: string) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFound("Review not found");
    }

    if (review.userId.toString() !== userId) {
      throw new BadRequest("Not your review");
    }

    // Apply profanity filter to comment updates if present
    if (data.comments) {
      data.comments = filterProfanity(data.comments);
    }

    Object.assign(review, data);
    await review.save();

    // Recalculate guide/driver rating
    if (review.guideId) {
      await this.updateGuideRating(review.guideId.toString());
    }
    if (review.driverId) {
      await this.updateDriverRating(review.driverId.toString());
    }

    return review;
  }

  async updateGuideRating(guideId: string) {
    const reviews = await Review.find({ guideId });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = reviews.length ? total / reviews.length : 0;

    await Guide.findByIdAndUpdate(guideId, {
      averageRating: Number(avg.toFixed(1)),
      totalReviews: reviews.length,
    });
  }

  async updateDriverRating(driverId: string) {
    const reviews = await Review.find({ driverId });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = reviews.length ? total / reviews.length : 0;

    await Driver.findByIdAndUpdate(driverId, {
      averageRating: Number(avg.toFixed(1)),
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

  // ─── Unified Administration & Moderation Endpoints ──────────────────────────
  async getReviewsAdmin(query: any) {
    const {
      page = 1,
      limit = 10,
      type,
      rating,
      startDate,
      endDate,
      search,
      guideSearch,
      sort = 'recent',
      isFeatured,
      isReported
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const now = new Date();

    // Match criteria for Guide reviews
    const guideMatch: any = {};
    if (rating) guideMatch.rating = Number(rating);
    if (isReported !== undefined) {
      guideMatch.isReported = isReported === 'true' || isReported === true;
    }
    if (isFeatured !== undefined) {
      const wantFeatured = isFeatured === 'true' || isFeatured === true;
      if (wantFeatured) {
        guideMatch.isFeatured = true;
        guideMatch.$or = [
          { featuredUntil: { $exists: false } },
          { featuredUntil: null },
          { featuredUntil: { $gt: now } }
        ];
      } else {
        guideMatch.$or = [
          { isFeatured: false },
          { featuredUntil: { $lte: now } }
        ];
      }
    }
    if (startDate || endDate) {
      guideMatch.createdAt = {};
      if (startDate) guideMatch.createdAt.$gte = new Date(startDate);
      if (endDate) guideMatch.createdAt.$lte = new Date(endDate);
    }

    const pipeline: any[] = [];

    if (type === 'website') {
      // Start with WebsiteReview
      const websiteMatch: any = { ...guideMatch };
      if (search) {
        websiteMatch.$or = [
          { travelerName: { $regex: search, $options: 'i' } },
          { comments: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ];
      }
      pipeline.push(
        { $match: websiteMatch },
        { $addFields: { type: 'website' } }
      );
    } else if (type === 'guide') {
      // Start with Guide Review
      pipeline.push(
        { $match: guideMatch },
        { $addFields: { type: 'guide' } }
      );
    } else {
      // Union of Guide reviews + Website reviews
      pipeline.push(
        { $match: guideMatch },
        { $addFields: { type: 'guide' } }
      );

      const websiteMatch: any = { ...guideMatch };
      if (search) {
        websiteMatch.$or = [
          { travelerName: { $regex: search, $options: 'i' } },
          { comments: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ];
      }

      pipeline.push({
        $unionWith: {
          coll: 'websitereviews',
          pipeline: [
            { $match: websiteMatch },
            { $addFields: { type: 'website' } }
          ]
        }
      });
    }

    // Add active featured status helper
    pipeline.push({
      $addFields: {
        isActiveFeatured: {
          $and: [
            { $eq: ["$isFeatured", true] },
            {
              $or: [
                { $eq: [{ $type: "$featuredUntil" }, "missing"] },
                { $eq: ["$featuredUntil", null] },
                { $gt: ["$featuredUntil", now] }
              ]
            }
          ]
        }
      }
    });

    // Lookup Guide info
    pipeline.push({
      $lookup: {
        from: 'guides',
        localField: 'guideId',
        foreignField: '_id',
        as: 'guideInfo'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$guideInfo',
        preserveNullAndEmptyArrays: true
      }
    });

    // Lookup Guide's User name
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'guideInfo.userId',
        foreignField: '_id',
        as: 'guideUserInfo'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$guideUserInfo',
        preserveNullAndEmptyArrays: true
      }
    });

    // Lookup Reviewer's User name
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'reviewerUserInfo'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$reviewerUserInfo',
        preserveNullAndEmptyArrays: true
      }
    });

    // Construct searchable virtuals
    pipeline.push({
      $addFields: {
        unifiedTravelerName: {
          $cond: {
            if: { $eq: ["$type", "website"] },
            then: "$travelerName",
            else: { $ifNull: ["$reviewerName", "$reviewerUserInfo.name"] }
          }
        },
        unifiedTravelerAvatar: {
          $cond: {
            if: { $eq: ["$type", "website"] },
            then: "$profileImage",
            else: "$reviewerUserInfo.profileImage"
          }
        },
        unifiedGuideName: "$guideUserInfo.name"
      }
    });

    // Search filter across text/traveler names (for combined searches)
    if (search && type !== 'website') {
      pipeline.push({
        $match: {
          $or: [
            { comments: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { unifiedTravelerName: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Filter by specific guide name
    if (guideSearch) {
      pipeline.push({
        $match: {
          unifiedGuideName: { $regex: guideSearch, $options: 'i' }
        }
      });
    }

    // Sort order
    const sortOrder = sort === 'oldest' ? 1 : -1;
    pipeline.push({ $sort: { createdAt: sortOrder } });

    // Paginate and count using $facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: Number(limit) }]
      }
    });

    const results = await Review.aggregate(pipeline);
    const totalCount = results[0]?.metadata[0]?.total || 0;
    const reviews = results[0]?.data || [];

    return {
      reviews,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      page: Number(page),
      limit: Number(limit)
    };
  }

  async getAdminAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalWebsite = await WebsiteReview.countDocuments();
    const totalGuide = await Review.countDocuments();
    const totalReviews = totalWebsite + totalGuide;

    // Averages
    const websiteStats = await WebsiteReview.aggregate([{ $group: { _id: null, sum: { $sum: "$rating" } } }]);
    const guideStats = await Review.aggregate([{ $group: { _id: null, sum: { $sum: "$rating" } } }]);

    const sumWebsite = websiteStats[0]?.sum || 0;
    const sumGuide = guideStats[0]?.sum || 0;
    const averageRating = totalReviews > 0 ? Number(((sumWebsite + sumGuide) / totalReviews).toFixed(1)) : 4.8;

    // This month
    const websiteMonth = await WebsiteReview.countDocuments({ createdAt: { $gte: startOfMonth } });
    const guideMonth = await Review.countDocuments({ createdAt: { $gte: startOfMonth } });
    const reviewsThisMonth = websiteMonth + guideMonth;

    // Active Featured
    const websiteFeatured = await WebsiteReview.countDocuments({
      isFeatured: true,
      $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: null }, { featuredUntil: { $gt: now } }]
    });
    const guideFeatured = await Review.countDocuments({
      isFeatured: true,
      $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: null }, { featuredUntil: { $gt: now } }]
    });
    const featuredReviewsCount = websiteFeatured + guideFeatured;

    // Reported
    const websiteReported = await WebsiteReview.countDocuments({ isReported: true });
    const guideReported = await Review.countDocuments({ isReported: true });
    const reportedReviewsCount = websiteReported + guideReported;

    return {
      totalReviews,
      websiteReviewsCount: totalWebsite,
      guideReviewsCount: totalGuide,
      averageRating,
      reviewsThisMonth,
      featuredReviewsCount,
      reportedReviewsCount
    };
  }

  async toggleFeatured(type: string, reviewId: string, isFeatured: boolean, featuredUntil?: string) {
    const updateData: any = { isFeatured };
    if (isFeatured && featuredUntil) {
      updateData.featuredUntil = new Date(featuredUntil);
    } else {
      updateData.featuredUntil = null;
    }

    if (type === 'website') {
      const review = await WebsiteReview.findByIdAndUpdate(reviewId, updateData, { new: true });
      if (!review) throw new NotFound("Website review not found");
      return review;
    } else {
      const review = await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
      if (!review) throw new NotFound("Guide review not found");
      return review;
    }
  }

  async reportReview(type: string, reviewId: string, reason: string) {
    const updateData = { isReported: true, reportReason: reason };
    if (type === 'website') {
      const review = await WebsiteReview.findByIdAndUpdate(reviewId, updateData, { new: true });
      if (!review) throw new NotFound("Website review not found");
      return review;
    } else {
      const review = await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
      if (!review) throw new NotFound("Guide review not found");
      return review;
    }
  }

  async toggleHelpful(type: string, reviewId: string, ipOrUserId: string) {
    if (!ipOrUserId) throw new BadRequest("User identity required to vote");

    if (type === 'website') {
      const review = await WebsiteReview.findById(reviewId);
      if (!review) throw new NotFound("Website review not found");

      const idx = review.helpfulUsers.indexOf(ipOrUserId);
      if (idx > -1) {
        // Already voted, remove vote
        review.helpfulUsers.splice(idx, 1);
        review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      } else {
        // Vote
        review.helpfulUsers.push(ipOrUserId);
        review.helpfulCount += 1;
      }
      await review.save();
      return { helpfulCount: review.helpfulCount, userVoted: idx === -1 };
    } else {
      const review = await Review.findById(reviewId);
      if (!review) throw new NotFound("Guide review not found");

      const idx = review.helpfulUsers.indexOf(ipOrUserId);
      if (idx > -1) {
        review.helpfulUsers.splice(idx, 1);
        review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      } else {
        review.helpfulUsers.push(ipOrUserId);
        review.helpfulCount += 1;
      }
      await review.save();
      return { helpfulCount: review.helpfulCount, userVoted: idx === -1 };
    }
  }

  async deleteReview(reviewId: string, type: string) {
    if (type === 'website') {
      const review = await WebsiteReview.findById(reviewId);
      if (!review) throw new NotFound("Review not found");
      await WebsiteReview.deleteOne({ _id: reviewId });
      return { message: "Website review deleted successfully" };
    } else {
      const review = await Review.findById(reviewId);
      if (!review) throw new NotFound("Review not found");

      await Review.deleteOne({ _id: reviewId });

      if (review.guideId) {
        await this.updateGuideRating(review.guideId.toString());
      }
      if (review.driverId) {
        await this.updateDriverRating(review.driverId.toString());
      }
      return { message: "Guide review deleted successfully" };
    }
  }
}

export const reviewService = new ReviewService();

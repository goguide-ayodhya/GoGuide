import { Guide } from "../models/Guide";
import { Review } from "../models/Review";
import { NotFound, BadRequest } from "../utils/httpException";

export class GuideService {
  async getAllGuides(filters?: { speciality?: string; minRating?: number }) {
    const query: any = {
      verificationStatus: "VERIFIED",
    };

    if (filters?.speciality) {
      query.speciality = { $regex: filters.speciality, $options: "i" };
    }

    if (filters?.minRating) {
      query.averageRating = { $gte: filters.minRating };
    }

    const guides = await Guide.find(query)
      .populate("userId", "id name email avatar phone")
      .sort({ averageRating: -1 });

    return guides.filter((g: any) => g.userId?.status === "ACTIVE");
  }

  async getGuideById(guideId: string) {
    const guide = await Guide.findById(guideId).populate(
      "userId",
      "id name email avatar phone bio",
    );

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  async getGuideByUserId(userId: string) {
    const guide = await Guide.findOne({ userId }).populate(
      "userId",
      "id name email avatar phone",
    );

    if (!guide) {
      throw new NotFound("Guide profile not found");
    }

    return guide;
  }

  async updateGuideProfile(guideId: string, data: any) {
    const guide = await Guide.findByIdAndUpdate(guideId, data, {
      new: true,
    }).populate("userId");

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  async setAvailability(guideId: string, isAvailable: boolean) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { isAvailable },
      { new: true },
    );

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  async setOnlineStatus(guideId: string, isOnline: boolean) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { isOnline },
      { new: true },
    );

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  async updateAverageRating(guideId: string) {
    const reviews = await Review.find({ guideId });

    if (reviews.length === 0) {
      return;
    }

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Guide.findByIdAndUpdate(guideId, {
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
    });
  }
  async verifyGuide(guideId: string) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { verificationStatus: "VERIFIED" },
      { new: true },
    );

    if (!guide) throw new NotFound("Guide not found");

    return guide;
  }

  async rejectGuide(guideId: string) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { verificationStatus: "REJECTED" },
      { new: true },
    );

    if (!guide) throw new NotFound("Guide not found");

    return guide;
  }
}

export const guideService = new GuideService();

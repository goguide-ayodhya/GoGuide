import { Guide } from "../models/Guide";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";

export class GuideService {
  async getAllGuides(filters?: { speciality?: string; minRating?: number }) {
    const query: any = {
      verificationStatus: "VERIFIED",
      isAvailable: true,
    };

    if (filters?.speciality) {
      query.specialities = { $in: [new RegExp(filters.speciality, "i")] };
    }

    if (filters?.minRating) {
      query.averageRating = { $gte: filters.minRating };
    }

    const guides = await Guide.find(query)
      .populate("userId", "id name email avatar phone status")
      .sort({ averageRating: -1 });

    return guides.filter((g: any) => {
      if (!g.userId) return true;
      // Exclude only blocked/deleted users, but allow INACTIVE for immediate tourist visibility in seed/dev mode
      return g.userId.status !== "BLOCKED" && g.userId.status !== "DELETED";
    });
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

  async updateGuideProfile(userId: string, data: any) {
    const guide = await Guide.findOneAndUpdate({ userId }, data, {
      new: true,
    }).populate("userId");

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  async setAvailability(userId: string, isAvailable: boolean) {
    const guide = await Guide.findOneAndUpdate(
      { userId },
      { isAvailable },
      { new: true },
    );

    if (!guide) {
      throw new NotFound("Guide not found");
    }

    return guide;
  }

  // async setOnlineStatus(userId: string, isOnline: boolean) {
  //   const guide = await Guide.findOneAndUpdate(
  //     { userId },
  //     { isOnline },
  //     { new: true },
  //   );

  //   if (!guide) {
  //     throw new NotFound("Guide not found");
  //   }

  //   return guide;
  // }

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

  // Mark guide profile as complete after multi-step onboarding
  async completeProfile(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isProfileComplete: true },
      { new: true },
    );

    if (!user) throw new NotFound("User not found");

    return { message: "Profile completed successfully" };
  }

  async verifyGuide(guideId: string) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { verificationStatus: "VERIFIED" },
      { new: true },
    );

    if (!guide) throw new NotFound("Guide not found");

    // Activate associated user account on verification
    if (guide.userId) {
      await User.findByIdAndUpdate(guide.userId, { status: "ACTIVE" });
    }

    return guide;
  }

  async rejectGuide(guideId: string) {
    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { verificationStatus: "REJECTED" },
      { new: true },
    );

    if (!guide) throw new NotFound("Guide not found");

    if (guide.userId) {
      await User.findByIdAndUpdate(guide.userId, { status: "INACTIVE" });
    }

    if (!guide) throw new NotFound("Guide not found");

    return guide;
  }
}

export const guideService = new GuideService();

import { sendEmail } from "../config/email.config";
import { Guide } from "../models/Guide";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";
import { generateStatusEmail } from "../utils/emailTemplates";

export class GuideService {
  async getAllGuides(filters?: { speciality?: string; minRating?: number }) {
    const query: any = {
      verificationStatus: "VERIFIED",
      isDeleted: { $ne: true },
      $or: [{ isActive: { $exists: false } }, { isActive: true }], // Allow guides without isActive field or where isActive is true
    };

    if (filters?.speciality) {
      query.specialities = { $in: [new RegExp(filters.speciality, "i")] };
    }

    if (filters?.minRating) {
      query.averageRating = { $gte: filters.minRating };
    }

    const guides = await Guide.find(query)
      .populate("userId", "id name email avatar phone status")
      .sort({ isAvailable: -1, averageRating: -1 }); // Available guides first, then by rating

    // Only return guides where:
    // 1. userId exists (not null/undefined)
    // 2. userId.status is ACTIVE
    // 3. verificationStatus is VERIFIED (already in query)
    // 4. isDeleted is not true (already in query)
    // 5. isActive is missing or true (already in query)
    return guides.filter((g: any) => {
      return g.userId && g.userId.status === "ACTIVE";
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

    const user: any = guide.userId;

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Guide Profile Verified - GoGuide",
        html: generateStatusEmail({
          title: "Congratulations! Your account is verified",
          titleColor: "#16a34a", // Green
          messageParagraphs: [
            "Your guide profile has been successfully verified by the GoGuide team.",
            "Travelers can now trust your verified profile and book tours with confidence."
          ],
          actionText: "Login Your Account",
          actionUrl: "goguide.in/login",
          actionColor: "#000000ff" // Orange
        }),
      });
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

    const user: any = guide.userId;

    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: "Guide Profile Rejected - GoGuide",
        html: generateStatusEmail({
          title: "Profile Verification Rejected",
          titleColor: "#ef4444", // Red
          messageParagraphs: [
            "We regret to inform you that your guide profile has been rejected by the GoGuide team.",
            "Please review your profile details and ensure all information and documents are accurate and up-to-date.",
            "You can update your profile and submit it again for verification."
          ],
          actionText: "Review Profile",
          actionUrl: "goguide.in/login",
          actionColor: "#ef4444"
        }),
      });
    }

    return guide;
  }
}

export const guideService = new GuideService();

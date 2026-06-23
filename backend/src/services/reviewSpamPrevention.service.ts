import { ReviewSubmission } from "../models/ReviewSubmission";
import { Types } from "mongoose";

export class ReviewSpamPreventionService {
  /**
   * Check if a user/device can submit a review for a guide
   * Returns true if allowed, false if rate-limited
   */
  static async canSubmitReview(
    guideId: string | Types.ObjectId,
    ipAddress: string,
    deviceFingerprint?: string
  ): Promise<{ allowed: boolean; remainingTime?: number }> {
    try {
      // Check for recent submissions from this IP or device
      const query: any = {
        guideId: new Types.ObjectId(guideId),
        submittedAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      };

      // Check by IP address first
      const ipSubmission = await ReviewSubmission.findOne({
        ...query,
        ipAddress,
      });

      if (ipSubmission) {
        const remainingTime = Math.ceil(
          (ipSubmission.expiresAt.getTime() - Date.now()) / 1000
        );
        return { allowed: false, remainingTime };
      }

      // If device fingerprint is provided, also check by fingerprint
      if (deviceFingerprint) {
        const fingerprintSubmission = await ReviewSubmission.findOne({
          ...query,
          deviceFingerprint,
        });

        if (fingerprintSubmission) {
          const remainingTime = Math.ceil(
            (fingerprintSubmission.expiresAt.getTime() - Date.now()) / 1000
          );
          return { allowed: false, remainingTime };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error checking review submission eligibility:", error);
      // On error, allow submission (fail open)
      return { allowed: true };
    }
  }

  /**
   * Record a review submission for spam prevention
   */
  static async recordReviewSubmission(
    guideId: string | Types.ObjectId,
    ipAddress: string,
    deviceFingerprint?: string
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      await ReviewSubmission.create({
        guideId: new Types.ObjectId(guideId),
        ipAddress,
        deviceFingerprint,
        submittedAt: new Date(),
        expiresAt,
      });
    } catch (error) {
      console.error("Error recording review submission:", error);
      // Don't throw - non-critical functionality
    }
  }

  /**
   * Get client IP address from request
   * Considers proxy headers like X-Forwarded-For
   */
  static getClientIP(req: any): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return (forwarded as string).split(",")[0].trim();
    }
    return req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
  }
}

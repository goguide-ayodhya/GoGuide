import { Schema, model, Document, Types } from "mongoose";

export interface IReviewSubmission extends Document {
  guideId: Types.ObjectId;
  ipAddress: string;
  deviceFingerprint?: string; // Optional client-side fingerprint (FingerprintJS)
  submittedAt: Date;
  expiresAt: Date; // TTL index - auto-delete after 24 hours
}

const ReviewSubmissionSchema = new Schema<IReviewSubmission>(
  {
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    deviceFingerprint: {
      type: String,
      default: null,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  },
  { timestamps: false }
);

// TTL Index - automatically delete documents 24 hours after expiresAt
ReviewSubmissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ReviewSubmission = model<IReviewSubmission>(
  "ReviewSubmission",
  ReviewSubmissionSchema
);

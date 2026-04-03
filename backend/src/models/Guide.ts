import { Schema, model, Document, Types } from "mongoose";

export interface IGuide extends Document {
  userId: Types.ObjectId;
  speciality: string;
  bio?: string;
  hourlyRate: number;
  certification?: string;
  yearsOfExperience: number;
  languages: string[];
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  isOnline: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema = new Schema<IGuide>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    speciality: {
      type: String,
      required: true,
      default: "General",
    },
    bio: String,
    hourlyRate: {
      type: Number,
      default: 500,
      // required: true,
    },
    certification: String,
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Guide = model<IGuide>("Guide", GuideSchema);

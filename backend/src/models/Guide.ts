import { Schema, model, Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IGuide extends Document {
  userId: Types.ObjectId;
  specialities: string[];
  bio?: string;
  certificates: {
    name: string;
    image: string;
  }[];
  yearsOfExperience: number;
  languages: string[];
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  reviewQRToken: string;
  reviewCollectionEnabled: boolean;
  reviewQRImage?: string;
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
    specialities: {
      type: [String],
      default: [],
    },
    bio: String,
    certificates: [{
      name: String,
      image: String,
    }],
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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    reviewQRToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    reviewQRImage: {
      type: String,
      default: "",
    },
    reviewCollectionEnabled: {
      type: Boolean,
      default: true,
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

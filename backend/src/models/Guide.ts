import { Schema, model, Document, Types } from "mongoose";

export interface IGuide extends Document {
  userId: Types.ObjectId;
  specialities: string[];
  bio?: string;
  locations: string[];
  price: number;
  duration: string;
  certificates: {
    name: string;
    image: string;
  }[];
  yearsOfExperience: number;
  languages: string[];
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;

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
    locations: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      default: 500,
    },
    duration: {
      type: String,
      default: "4 hours",
    },
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
    // isOnline: {
    //   type: Boolean,
    //   default: false,
    // },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Guide = model<IGuide>("Guide", GuideSchema);

import { Schema, model, Document, Types } from "mongoose";

export interface ItineraryStop {
  title: string;
  description?: string;
  // location?: { city?: string; state?: string };
  order: number;
}

export interface ITourPackage extends Document {
  title: string;
  description: string;
  // location: string;
  state?: string;
  duration: number;
  durationType: "hours" | "days";
  startTime?: string;
  price: number;
  // basePrice: number;
  // cabPrice: number;
  // guidePrice: number;
  maxGroupSize?: number;
  itinerary: ItineraryStop[];
  includesCab: boolean;
  includesGuide: boolean;
  images: string[];
  mainImage?: string;
  locations: string[];
  type: "basic" | "medium" | "premium";
  discount?: number;
  soldCount: number;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryStopSchema = new Schema<ItineraryStop>(
  {
    title: { type: String, required: true },
    description: { type: String },
    // location: {
    //   city: { type: String },
    //   state: { type: String },
    // },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const TourPackageSchema = new Schema<ITourPackage>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // location: { type: String, required: true },
    state: { type: String },
    price: { type: Number, required: true },
    // basePrice: { type: Number, default: 0 },
    // cabPrice: { type: Number, default: 0 },
    // guidePrice: { type: Number, default: 0 },
    duration: { type: Number, default: 1 },
    durationType: { type: String, enum: ["hours", "days"], default: "hours" },
    startTime: { type: String },

    itinerary: { type: [ItineraryStopSchema], default: [] },
    includesCab: { type: Boolean, default: false },
    includesGuide: { type: Boolean, default: false },
    maxGroupSize: { type: Number, default: 1 },
    images: { type: [String], default: [] },
    mainImage: { type: String },
    locations: { type: [String], default: [] },
    type: {
      type: String,
      enum: ["basic", "medium", "premium"],
      default: "basic",
    },
    discount: { type: Number },
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const TourPackage = model<ITourPackage>(
  "TourPackage",
  TourPackageSchema,
);

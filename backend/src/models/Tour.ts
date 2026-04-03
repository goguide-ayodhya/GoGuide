import { Schema, model, Document, Types } from "mongoose";

export interface ITourPackage extends Document {
  title: string;
  location: string;
  price: number;
  duration: number; // days
  description: string;
  includes: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TourPackageSchema = new Schema<ITourPackage>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: true },
    includes: { type: [String], default: [] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const TourPackage = model<ITourPackage>(
  "TourPackage",
  TourPackageSchema,
);
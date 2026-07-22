import { Schema, model, Document } from "mongoose";

export interface ICabLocation extends Document {
  name: string;
  type: "pickup" | "dropoff" | "both";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CabLocationSchema = new Schema<ICabLocation>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["pickup", "dropoff", "both"], default: "both" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CabLocationSchema.index({ name: 1, type: 1 }, { unique: true });

export const CabLocation = model<ICabLocation>("CabLocation", CabLocationSchema);

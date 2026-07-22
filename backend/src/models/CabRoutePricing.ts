import { Schema, model, Document, Types } from "mongoose";

export interface ICabRoutePricing extends Document {
  pickupLocation: Types.ObjectId;
  dropLocation: Types.ObjectId;
  carCategory: Types.ObjectId;
  basePrice: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CabRoutePricingSchema = new Schema<ICabRoutePricing>(
  {
    pickupLocation: { type: Schema.Types.ObjectId, ref: "CabLocation", required: true },
    dropLocation: { type: Schema.Types.ObjectId, ref: "CabLocation", required: true },
    carCategory: { type: Schema.Types.ObjectId, ref: "CabCategory", required: true },
    basePrice: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index to make sure one price config per route and category
CabRoutePricingSchema.index({ pickupLocation: 1, dropLocation: 1, carCategory: 1 }, { unique: true });

export const CabRoutePricing = model<ICabRoutePricing>("CabRoutePricing", CabRoutePricingSchema);

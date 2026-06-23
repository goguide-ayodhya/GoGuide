import { Schema, model, Document } from "mongoose";

export interface IGuidePricing {
  touristPrice: number;
  guideEarning: number;
  maxLocations: number;
}

export interface IAdminSettings extends Document {
  driverCommissionPercent: number;
  guidePricing?: {
    halfDay: IGuidePricing;
    fullDay: IGuidePricing;
  };
  locations?: string[];
  paymentQR?: {
    url: string;
    isEnabled: boolean;
    upiId?: string;
    merchantName?: string;
  };
  lastUpdatedBy?: string;
  lastUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    driverCommissionPercent: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    guidePricing: {
      halfDay: {
        touristPrice: { type: Number, default: 0 },
        guideEarning: { type: Number, default: 0 },
        maxLocations: { type: Number, default: 6 },
      },
      fullDay: {
        touristPrice: { type: Number, default: 0 },
        guideEarning: { type: Number, default: 0 },
        maxLocations: { type: Number, default: 8 },
      },
    },
    locations: [{ type: String }],
    paymentQR: {
      url: { type: String, default: "" },
      isEnabled: { type: Boolean, default: false },
      upiId: { type: String, default: "" },
      merchantName: { type: String, default: "" },
    },
    lastUpdatedBy: {
      type: String,
    },
    lastUpdatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Ensure only one document exists
AdminSettingsSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await model("AdminSettings").countDocuments();
    if (count > 0) {
      throw new Error("Only one AdminSettings document allowed");
    }
  }
  next();
});

export const AdminSettings = model<IAdminSettings>("AdminSettings", AdminSettingsSchema);

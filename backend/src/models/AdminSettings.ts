import { Schema, model, Document } from "mongoose";

export interface IAdminSettings extends Document {
  driverCommissionPercent: number;
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

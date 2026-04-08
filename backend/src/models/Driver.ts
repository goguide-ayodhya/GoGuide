import { Schema, model, Types, Document } from "mongoose";

export interface IDriver extends Document {
  userId: Types.ObjectId;

  vehicleNumber?: string;
  vehicleType?: "CAR" | "BIKE" | "AUTO" | "RIKSHAW" | "VAN" | "OTHER";
  vehicleName: string;

  pricePerKm?: number;
  seats?: number;

  images?: string[];

  isAvailable?: boolean;

  averageRating: number;
  totalRides: number;

  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";

  driverName: string;
  driverAadhar: string;

  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicleName: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"],
    },

    pricePerKm: {
      type: Number,
    },
    seats: {
      type: Number,
    },

    images: {
      type: [String],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    driverName: {
      type: String,
      required: true,
    },
    driverAadhar: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Driver = model<IDriver>("Driver", DriverSchema);

import { Schema, model, Types, Document } from "mongoose";

export interface IDriver extends Document {
  userId: Types.ObjectId;

  vehicleNumber?: string;
  vehicleType?: "CAR" | "BIKE" | "AUTO" | "RIKSHAW" | "VAN" | "OTHER";
  vehicleName?: string;

  seats?: number;

  currentLocation?: {
    lat: number;
    lng: number;
  };

  driverPhoto?: string;

  driverLicenseName?: string;
  driverLicenseImage?: string[];

  isAvailable?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  languages?: string[];

  averageRating: number;
  totalRides: number;

  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  driverName: string;

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
    },
    vehicleNumber: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"],
    },

    seats: {
      type: Number,
    },

    driverPhoto: {
      type: String,
    },
    driverLicenseName: {
      type: String,
    },
    driverLicenseImage: {
      type: [String],
    },
    languages: {
      type: [String],
    },
    isAvailable: {
      type: Boolean,
      default: true,
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

    currentLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
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
  },
  { timestamps: true },
);

export const Driver = model<IDriver>("Driver", DriverSchema);

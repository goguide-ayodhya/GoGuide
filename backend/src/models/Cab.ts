import { Schema, model, Types, Document } from "mongoose";

export interface ICab extends Document {
  userId: Types.ObjectId;
  pickupLocation: string;
  driverName: string;
  driverAadhar: string;
  dropLocation: string;
  date: Date;
  passengers: number;
  price: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
  pricePerKm?: number;
  vehicleNumber?: string;
  verhicleType?: "CAR" | "BIKE" | "AUTO" | "RIKSHAW" | "VAN" | "OTHER";
  seatsAvailable?: number;
  images?: string[];
  isavailable?: boolean;
}

const CabSchema = new Schema<ICab>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverAadhar: {
      type: String,
      required: true,
    },
    dropLocation: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    passengers: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    pricePerKm: {
      type: Number,
    },
    vehicleNumber: {
      type: String,
    },
    verhicleType: {
      type: String,
      enum: ["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"],
    },
    seatsAvailable: {
      type: Number,
    },
    images: {
      type: [String],
    },
    isavailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Cab = model<ICab>("Cab", CabSchema);

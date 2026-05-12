import { Schema, model, Document, Types } from "mongoose";

export interface IRide extends Document {
  user: Types.ObjectId;
  driver?: Types.ObjectId; // Formerly captain
  pickup: string;
  destination: string;
  fare: number;
  status: "pending" | "accepted" | "ongoing" | "completed" | "cancelled";
  duration?: number; // in seconds
  distance?: number; // in meters
  paymentID?: string;
  orderId?: string;
  signature?: string;
  otp: string;
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    duration: {
      type: Number,
    },
    distance: {
      type: Number,
    },
    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
  },
  { timestamps: true }
);

export const Ride = model<IRide>("Ride", RideSchema);
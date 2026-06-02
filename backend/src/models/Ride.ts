import { Schema, model, Document, Types } from "mongoose";

export interface IRide extends Document {
  user: Types.ObjectId;
  driver?: Types.ObjectId; // Formerly captain
  pickup: string;
  destination: string;
  fare: number;
  status: "pending" | "accepted" | "ongoing" | "payment_pending" | "completed" | "reviewed" | "cancelled";
  duration?: number; // in seconds
  distance?: number; // in meters
  paymentID?: string;
  orderId?: string;
  signature?: string;
  paymentStatus?: "unpaid" | "paid";
  paymentMethod?: "cash" | "card" | "wallet";
  paymentConfirmedAt?: Date;
  review?: {
    rating: number;
    text: string;
    submittedAt: Date;
    skipped?: boolean;
  };
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
      enum: ["pending", "accepted", "ongoing", "payment_pending", "completed", "reviewed", "cancelled"],
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
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "wallet"],
    },
    paymentConfirmedAt: {
      type: Date,
    },
    review: {
      type: {
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
        text: {
          type: String,
          default: "",
        },
        submittedAt: {
          type: Date,
        },
        skipped: {
          type: Boolean,
          default: false,
        },
      },
      default: null,
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
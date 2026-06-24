import { Schema, model, Document, Types } from "mongoose";

export interface ICabBooking extends Document {
  userId?: Types.ObjectId;
  fullName: string;
  phone: string;
  numPeople: number;
  specialAssistance: {
    wheelchair: boolean;
    medicalSupport: boolean;
    elderlyCare: boolean;
    childCare: boolean;
  };
  startDate: Date;
  numDays: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  acPreference: "AC" | "Non-AC";
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

const CabBookingSchema = new Schema<ICabBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    numPeople: { type: Number, required: true },
    specialAssistance: {
      wheelchair: { type: Boolean, default: false },
      medicalSupport: { type: Boolean, default: false },
      elderlyCare: { type: Boolean, default: false },
      childCare: { type: Boolean, default: false },
    },
    startDate: { type: Date, required: true },
    numDays: { type: Number, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    vehicleType: { type: String, required: true },
    acPreference: { type: String, enum: ["AC", "Non-AC"], required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const CabBooking = model<ICabBooking>("CabBooking", CabBookingSchema);

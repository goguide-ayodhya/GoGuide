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
  numDays?: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  
  // New pricing & verification fields
  bookingId?: string;
  pickupLocationId?: Types.ObjectId;
  dropoffLocationId?: Types.ObjectId;
  carCategoryId?: Types.ObjectId;
  pickupTime: string;
  price: number;
  tax: number;
  wheelchairCharge: number;
  medicalSupportCharge: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: string;
  paymentType?: string;
  isRescheduled?: boolean;

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
    numDays: { type: Number, default: 1 },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    vehicleType: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },

    // New Fields
    bookingId: { type: String, unique: true, sparse: true },
    pickupLocationId: { type: Schema.Types.ObjectId, ref: "CabLocation" },
    dropoffLocationId: { type: Schema.Types.ObjectId, ref: "CabLocation" },
    carCategoryId: { type: Schema.Types.ObjectId, ref: "CabCategory" },
    pickupTime: { type: String, required: true },
    price: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    wheelchairCharge: { type: Number, default: 0 },
    medicalSupportCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: { type: String, default: "" },
    paymentType: { type: String, default: "" },
    isRescheduled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to generate readable, unique bookingId atomically if not already set
CabBookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const { Counter } = await import("./Counter");
    const { User } = await import("./User");

    let email = "cust@goguide.com";
    if (this.userId) {
      const user = await User.findById(this.userId);
      if (user && user.email) {
        email = user.email;
      }
    }

    const username = email.split("@")[0] || "cust";
    const prefix = username.substring(0, 4).toLowerCase();

    const counter = await Counter.findOneAndUpdate(
      { name: "cabBookingId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.bookingId = `${prefix}-${String(counter.seq).padStart(4, "0")}`;
  }
  next();
});

export const CabBooking = model<ICabBooking>("CabBooking", CabBookingSchema);

import { Schema, model, Document, Types } from "mongoose";

export type PaymentType = "FULL" | "PARTIAL" | "COD" | "REMAINING";

export interface IBooking extends Document {
  guideId?: Types.ObjectId;
  packageId: Types.ObjectId;
  userId: Types.ObjectId;
  driverId?: Types.ObjectId;

  touristName: string;
  guideName?: string;
  email: string;
  phone: string;

  cabRequired: boolean;

  isSeenByAdmin: boolean;

  groupSize: number;
  bookingDate: Date;
  startTime: string;

  tourType: string;
  meetingPoint: string;
  dropoffLocation: string;
  totalPrice: number;

  /** Quoted price before any partial-payment discount (usually equals totalPrice at creation). */
  originalPrice?: number;
  /** 5% discount amount when partial plan applies; 0 for COD or full-price upfront. */
  discount: number;
  /** GST amount calculated on price after discount */
  gstAmount: number;
  /** Amount all payments are based on (after discount when applicable). */
  finalPrice?: number;

  paidAmount: number;
  remainingAmount?: number;

  /** Guide share (70% of finalPrice) once payment is fully collected; GUIDE bookings only. */
  guideEarning: number;
  /** Platform share (30% of finalPrice) once payment is fully collected. */
  adminCommission: number;

  /** Set when the tourist selects how to pay (after acceptance). */
  paymentType?: PaymentType;
  /** True once user chose the partial (30%) plan or switched from partial to full-pay while keeping the discount. */
  partialDiscountApplied: boolean;

  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

  bookingType: "GUIDE" | "DRIVER" | "TOKEN" | "PACKAGE";

  paymentStatus: "PENDING" | "PARTIAL" | "COMPLETED" | "FAILED" | "REFUNDED";
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: "GUIDE" | "TOURIST" | "DRIVER";
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: function () {
        return this.bookingType === "GUIDE";
      },
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "TourPackage",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    bookingType: {
      type: String,
      enum: ["GUIDE", "DRIVER", "TOKEN", "PACKAGE"],
      required: true,
    },
    touristName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    cabRequired: {
      type: Boolean,
      default: false,
    },

    isSeenByAdmin: {
      type: Boolean,
      default: false,
    },
    groupSize: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    tourType: {
      type: String,
      required: true,
    },
    meetingPoint: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
    },
    guideEarning: {
      type: Number,
      default: 0,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
    paymentType: {
      type: String,
      enum: ["FULL", "PARTIAL", "COD", "REMAINING"],
    },
    partialDiscountApplied: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD", "CARD", "RAZORPAY"],
    },
    notes: String,
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ["GUIDE", "TOURIST", "DRIVER"],
    },
    cancelledAt: Date,
  },
  { timestamps: true },
);

BookingSchema.pre("validate", function (next) {
  const b = this as IBooking;
  if (b.originalPrice == null && b.totalPrice != null) {
    b.originalPrice = b.totalPrice;
  }
  if (b.finalPrice == null && b.totalPrice != null) {
    b.finalPrice = b.totalPrice;
  }
  const paid = b.paidAmount ?? 0;
  if (b.remainingAmount == null && b.finalPrice != null) {
    b.remainingAmount = Math.round((b.finalPrice - paid) * 100) / 100;
  }
  next();
});

export const Booking = model<IBooking>("Booking", BookingSchema);

BookingSchema.index({ userId: 1 });
BookingSchema.index({ guideId: 1 });
BookingSchema.index({ driverId: 1 });
BookingSchema.index({ status: 1 });

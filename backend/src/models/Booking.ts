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
  selectedLocations: string[];
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

  /** Base Guide Earning from AdminSettings at the time of booking */
  baseGuideEarning?: number;

  /** Guide share once payment is fully collected; GUIDE bookings only. */
  guideEarning: number;
  /** Platform share once payment is fully collected. */
  adminCommission: number;

  /** Set when the tourist selects how to pay (after acceptance). */
  paymentType?: PaymentType;
  /** True once user chose the partial (30%) plan or switched from partial to full-pay while keeping the discount. */
  partialDiscountApplied: boolean;

  /** True if 10% full-payment discount is eligible (GUIDE bookings only). Set to true on acceptance, false when guide starts tour. */
  fullPaymentDiscountEligible?: boolean;

  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

  bookingType: "GUIDE" | "DRIVER" | "TOKEN" | "PACKAGE";

  paymentStatus: "PENDING" | "PARTIAL" | "COMPLETED" | "FAILED" | "REFUNDED" | "REJECTED";
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
    selectedLocations: {
      type: [String],
      default: [],
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
    baseGuideEarning: {
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
    fullPaymentDiscountEligible: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "COMPLETED", "FAILED", "REFUNDED", "REJECTED"],
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

BookingSchema.index({ userId: 1 });
BookingSchema.index({ guideId: 1 });
BookingSchema.index({ driverId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ status: 1, paymentStatus: 1, bookingType: 1, bookingDate: -1 });
BookingSchema.index({ bookingDate: -1 });
BookingSchema.index({ touristName: 1, bookingDate: -1 });

export const Booking = model<IBooking>("Booking", BookingSchema);

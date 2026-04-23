import { Schema, model, Document, Types } from "mongoose";

export type PaymentStage = "ADVANCE" | "FULL";

export type PaymentKind = "INITIAL" | "CHARGE";
export type PaymentType = "FULL" | "ADVANCE" | "REMAINING" | "COD";

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  guideId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  /** Line amount for this row (same as amountPaid for charge rows). Kept for backwards compatibility with analytics. */
  amount: number;
  /** Expected rupees captured for this Razorpay order / transaction. */
  amountPaid: number;
  paidAmount: number;
  remainingAmount: number;
  type?: PaymentType;
  paymentStage?: PaymentStage;
  /** Placeholder row created on booking acceptance vs an actual charge. */
  paymentKind: PaymentKind;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: string;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refundedAmount?: number;
  lastRefundedAt?: Date;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    amount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      enum: ["FULL", "ADVANCE", "REMAINING", "COD"],
    },
    paymentStage: {
      type: String,
      enum: ["ADVANCE", "FULL"],
    },
    paymentKind: {
      type: String,
      enum: ["INITIAL", "CHARGE"],
      default: "CHARGE",
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: String,
    transactionId: String,
    razorpayOrderId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    lastRefundedAt: Date,
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true },
);

PaymentSchema.index({ bookingId: 1, status: 1 });

export const Payment = model<IPayment>("Payment", PaymentSchema);

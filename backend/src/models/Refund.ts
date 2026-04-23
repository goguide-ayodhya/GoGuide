import { Schema, model, Document, Types } from "mongoose";

export type RefundStatus = "REQUESTED" | "PROCESSED" | "FAILED";

export interface IRefund extends Document {
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  reason?: string;
  status: RefundStatus;
  razorpayRefundId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
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
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    reason: String,
    status: {
      type: String,
      enum: ["REQUESTED", "PROCESSED", "FAILED"],
      default: "REQUESTED",
      index: true,
    },
    razorpayRefundId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpayPaymentId: String,
    failureReason: String,
    processedAt: Date,
  },
  { timestamps: true },
);

RefundSchema.index({ paymentId: 1, status: 1 });
RefundSchema.index({ bookingId: 1, createdAt: -1 });

export const Refund = model<IRefund>("Refund", RefundSchema);

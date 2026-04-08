import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  guideId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: string;
  transactionId?: string;
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
      unique: true,
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
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: String,
    transactionId: String,
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", PaymentSchema);

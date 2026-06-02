import { Schema, model, Document, Types } from "mongoose";

export type CommissionPaymentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface IDriverCommissionPayment extends Document {
  driverId: Types.ObjectId;
  amount: number; // Admin's commission share
  commissionPercent: number;
  status: CommissionPaymentStatus;
  createdBy: Types.ObjectId; // Admin who recorded the payment
  confirmedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverCommissionPaymentSchema = new Schema<IDriverCommissionPayment>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionPercent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    confirmedAt: {
      type: Date,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

DriverCommissionPaymentSchema.index({ driverId: 1, status: 1 });
DriverCommissionPaymentSchema.index({ createdAt: -1 });

export const DriverCommissionPayment = model<IDriverCommissionPayment>(
  "DriverCommissionPayment",
  DriverCommissionPaymentSchema
);

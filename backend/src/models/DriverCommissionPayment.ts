import { Schema, model, Document, Types } from "mongoose";

// Extended status: PENDING (waiting admin review), APPROVED (admin approved & wallet updated),
// REJECTED (admin rejected, no balance change), CANCELLED (legacy)
export type CommissionPaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface IDriverCommissionPayment extends Document {
  driverId: Types.ObjectId;
  amount: number;
  commissionPercent: number;
  transactionReference?: string; // Bank/UPI ref provided by driver
  notes?: string; // Optional notes from driver
  status: CommissionPaymentStatus;
  requestedBy: "DRIVER" | "ADMIN"; // Who initiated
  createdBy?: Types.ObjectId; // Admin who initiated (legacy/admin-created entries)
  approvedBy?: Types.ObjectId; // Admin who approved
  approvedAt?: Date;
  rejectionReason?: string; // Set by admin on rejection
  note?: string; // Legacy field — keep for backward compat
  confirmedAt?: Date; // Legacy alias for approvedAt
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
      default: 0,
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    requestedBy: {
      type: String,
      enum: ["DRIVER", "ADMIN"],
      default: "ADMIN",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    // Legacy fields — kept for backward compatibility
    note: {
      type: String,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

DriverCommissionPaymentSchema.index({ driverId: 1, status: 1 });
DriverCommissionPaymentSchema.index({ createdAt: -1 });
DriverCommissionPaymentSchema.index({ status: 1, createdAt: -1 });

export const DriverCommissionPayment = model<IDriverCommissionPayment>(
  "DriverCommissionPayment",
  DriverCommissionPaymentSchema
);

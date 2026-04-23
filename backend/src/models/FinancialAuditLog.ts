import { Schema, model, Document, Types } from "mongoose";

export interface IFinancialAuditLog extends Document {
  action: string;
  actorUserId?: Types.ObjectId;
  actorRole?: string;
  bookingId?: Types.ObjectId;
  paymentId?: Types.ObjectId;
  refundId?: Types.ObjectId;
  payoutId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialAuditLogSchema = new Schema<IFinancialAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    actorRole: String,
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: "Refund",
      index: true,
    },
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

export const FinancialAuditLog = model<IFinancialAuditLog>(
  "FinancialAuditLog",
  FinancialAuditLogSchema,
);

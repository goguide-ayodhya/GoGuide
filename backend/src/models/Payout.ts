import { Schema, model, Document, Types } from "mongoose";

export type PayoutStatus = "PENDING" | "COMPLETED";

export interface IPayout extends Document {
  guideId: Types.ObjectId;
  amount: number;
  status: PayoutStatus;
  /** Admin user who initiated the payout */
  createdBy: Types.ObjectId;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    confirmedAt: Date,
  },
  { timestamps: true },
);

PayoutSchema.index({ guideId: 1, status: 1 });

export const Payout = model<IPayout>("Payout", PayoutSchema);

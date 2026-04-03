import { Schema, model, Types, Document } from "mongoose";

export interface ICab extends Document {
  userId: Types.ObjectId;
  pickupLocation: string;
  dropLocation: string;
  date: Date;
  passengers: number;
  price: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const CabSchema = new Schema<ICab>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropLocation: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    passengers: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Cab = model<ICab>("Cab", CabSchema);

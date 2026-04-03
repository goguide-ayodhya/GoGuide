import { Schema, Document, model, Types } from "mongoose";

export interface IPass extends Document {
  title: string;
  location: string;
  price: number;
  validity: number;
  description?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PassSchema = new Schema<IPass>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    validity: { type: Number, required: true }, // days
    description: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Pass = model<IPass>("Pass", PassSchema)
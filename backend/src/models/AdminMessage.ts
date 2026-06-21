import { Schema, model, Document, Types } from "mongoose";

export type MessagePriority = "normal" | "important";

export interface IAdminMessage extends Document {
  title: string;
  description: string;
  priority: MessagePriority;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminMessageSchema = new Schema<IAdminMessage>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["normal", "important"],
      default: "normal",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const AdminMessage = model<IAdminMessage>("AdminMessage", AdminMessageSchema);

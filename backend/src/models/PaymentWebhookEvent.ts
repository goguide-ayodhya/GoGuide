import { Schema, model, Document } from "mongoose";

export interface IPaymentWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  paymentId?: string;
  orderId?: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    paymentId: String,
    orderId: String,
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const PaymentWebhookEvent = model<IPaymentWebhookEvent>(
  "PaymentWebhookEvent",
  PaymentWebhookEventSchema,
);

import { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  guideId?: Types.ObjectId;
  userId: Types.ObjectId;
  driverId?: Types.ObjectId;

  touristName: string;
  email: string;
  phone: string;

  cabRequired: boolean;

  isSeenByAdmin: boolean;

  groupSize: number;
  bookingDate: Date;
  startTime: string;

  tourType: string;
  meetingPoint: string;
  dropoffLocation: string;
  totalPrice: number;

  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

  bookingType: "GUIDE" | "DRIVER" | "TOKEN";

  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    guideId: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: function() {
        return this.bookingType === "GUIDE";
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    bookingType: {
      type: String,
      enum: ["GUIDE", "DRIVER", "TOKEN"],
      required: true,
    },
    touristName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    cabRequired: {
      type: Boolean,
      default: false,
    },

    isSeenByAdmin: {
      type: Boolean,
      default: false,
    },
    groupSize: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    tourType: {
      type: String,
      required: true,
    },
    meetingPoint: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD", "CARD"],
    },
    notes: String,
  },
  { timestamps: true },
);

export const Booking = model<IBooking>("Booking", BookingSchema);

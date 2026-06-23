import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  guideId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comments: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  isReported: boolean;
  reportReason?: string;
  helpfulCount: number;
  helpfulUsers: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredUntil: {
      type: Date,
    },
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportReason: {
      type: String,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulUsers: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ rating: 1 });

export const Review = model<IReview>('Review', ReviewSchema);

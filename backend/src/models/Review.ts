import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  guideId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comments: string;
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
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', ReviewSchema);

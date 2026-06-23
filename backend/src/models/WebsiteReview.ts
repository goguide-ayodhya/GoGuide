import { Schema, model, Document } from 'mongoose';

export interface IWebsiteReview extends Document {
  rating: number;
  title?: string;
  comments: string;
  travelerName: string;
  profileImage?: string;
  city?: string;
  bookingType?: string;
  images?: string[];
  isFeatured: boolean;
  featuredUntil?: Date;
  isReported: boolean;
  reportReason?: string;
  helpfulCount: number;
  helpfulUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteReviewSchema = new Schema<IWebsiteReview>(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
    },
    comments: {
      type: String,
      required: true,
    },
    travelerName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    city: {
      type: String,
    },
    bookingType: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
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
  },
  { timestamps: true }
);

// Indexes for pagination and filters
WebsiteReviewSchema.index({ createdAt: -1 });
WebsiteReviewSchema.index({ rating: 1 });

export const WebsiteReview = model<IWebsiteReview>('WebsiteReview', WebsiteReviewSchema);

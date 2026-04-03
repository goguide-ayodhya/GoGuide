import { Schema, model, Document, Types } from 'mongoose';

export interface IAvailability extends Document {
  guideId: Types.ObjectId;
  userId: Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


export const Availability = model<IAvailability>('Availability', AvailabilitySchema);

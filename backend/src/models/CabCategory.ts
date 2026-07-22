import { Schema, model, Document } from "mongoose";

export interface ICabCategory extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CabCategorySchema = new Schema<ICabCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CabCategory = model<ICabCategory>("CabCategory", CabCategorySchema);

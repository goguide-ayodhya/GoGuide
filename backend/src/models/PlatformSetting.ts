import { Schema, model, Document } from "mongoose";

export interface IPlatformSetting extends Document {
  key: string;
  value: any;
}

const PlatformSettingSchema = new Schema<IPlatformSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

export const PlatformSetting = model<IPlatformSetting>(
  "PlatformSetting",
  PlatformSettingSchema,
);

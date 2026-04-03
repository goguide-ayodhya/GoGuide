import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  bio?: string;
  avatar: string;

  role: "GUIDE" | "TOURIST" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";
  blockReason?: string;
  blockedAt?: Date;
  lastLoginAt?: Date;
  isDeleted?: boolean;

  // isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: String,
    avatar: String, // avatar as profileImage
    bio: String,
    role: {
      type: String,
      enum: ["GUIDE", "TOURIST", "ADMIN"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED", "DELETED"],
      default: "INACTIVE",
    },
    blockReason: { type: String },
    blockedAt: { type: Date },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);

import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email?: string;
  password: string;
  name: string;
  phone: string;
  bio?: string;
  avatar: string;
  vehiclePhoto?: string;
  driverPhoto?: string;

  role: "GUIDE" | "TOURIST" | "ADMIN" | "DRIVER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";
  blockReason?: string;
  blockedAt?: Date;
  lastLoginAt?: Date;
  isDeleted?: boolean;

  isEmailVerified: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  fcmToken?: string;
  fcmTokenUpdatedAt?: Date;
  cancellationCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true, // Allow null/undefined values for unique index
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true 
    },
    avatar: String, // avatar as profileImage
    vehiclePhoto: {
      type: String,
    },
    driverPhoto: {
      type: String,
    },
    bio: String,
    role: {
      type: String,
      enum: ["GUIDE", "TOURIST", "ADMIN", "DRIVER"],
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: {
      type: Date,
    },
    fcmToken: String,
    fcmTokenUpdatedAt: Date,
    cancellationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);

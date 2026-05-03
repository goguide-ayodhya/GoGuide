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

  socketId: string;

  isEmailVerified: boolean;
  isProfileComplete?: boolean; // for GUIDE/DRIVER - profile completion step
  profileStep: number;
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
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    vehiclePhoto: {
      type: String,
      default: "",
    },
    driverPhoto: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["GUIDE", "TOURIST", "ADMIN", "DRIVER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED", "DELETED"],
      default: "INACTIVE", // Start inactive until profile complete / verified
    },
    blockReason: String,
    blockedAt: Date,
    lastLoginAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    socketId: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    profileStep: {
      type: Number,
      default: 1,
    },
    otp: String,
    otpExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    fcmToken: String,
    fcmTokenUpdatedAt: Date,
    cancellationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export const User = model<IUser>("User", UserSchema);

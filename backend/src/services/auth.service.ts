import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Guide } from "../models/Guide";
import { env } from "../config/environment";
import {
  BadRequest,
  Conflict,
  Unauthorized,
  NotFound,
} from "../utils/httpException";
import { LoginInput, SignupInput } from "../validations/auth";
import { Driver } from "../models/Driver";
import { sendEmail } from "../config/email.config";

export class AuthService {
  // --------------------- Authentication ---------------------
  async login(input: LoginInput) {
    // Find user by phone only
    const user = await User.findOne({ phone: input.identifier });

    if (!user) {
      throw new Unauthorized("Invalid phone or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Unauthorized("Invalid email/phone or password");
    }

    if (user.role === "GUIDE" || user.role === "DRIVER") {
      if (!user.status || user.status !== "ACTIVE") {
        throw new BadRequest("Account is inactive");
      }
    }

    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user._id.toString(), user.email || "");

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  async signup(input: SignupInput) {
    // Require both email and phone and enforce uniqueness
    const existingUserByEmail = await User.findOne({ email: input.email });
    if (existingUserByEmail) {
      throw new Conflict("Email already registered");
    }

    const existingUserByPhone = await User.findOne({ phone: input.phone });
    if (existingUserByPhone) {
      throw new Conflict("Phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await User.create({
      email: input.email || undefined,
      password: hashedPassword,
      name: input.name,
      phone: input.phone,
      role: input.role as any,
      avatar: input.avatar || undefined,
      speciality: input.speciality,
      hourlyRate: input.hourlyRate || 500,
      status: input.role === "TOURIST" ? "ACTIVE" : "INACTIVE",
    });

    if (input.role === "GUIDE") {
      await Guide.create({
        userId: user._id,
        speciality: input.speciality || "General",
        hourlyRate: input.hourlyRate || 500,
        yearsOfExperience: input.experience || 0,
        languages: input.languages || [],
        verificationStatus: "PENDING",
        isAvailable: false,
        isOnline: false,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    if (input.role === "DRIVER") {
      await Driver.create({
        userId: user._id,
        vehicleType: input.vehicleType,
        vehicleName: input.vehicleName || "",
        vehicleNumber: input.vehicleNumber || "",
        pricePerKm: input.pricePerKm || 0,
        seats: input.seats || 0,
        images: [input.driverPhoto, input.vehiclePhoto].filter(
          Boolean,
        ) as string[],
        verificationStatus: "PENDING",
        isAvailable: false,
        averageRating: 0,
        totalRides: 0,
        driverName: input.name,
        driverAadhar: input.driverAadhar || "",
      });
    }
    const token = this.generateToken(user._id.toString(), user.email || "");

    // Send email verification if email is provided
    if (user.email) {
      await this.sendOtp(user.email);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  async logout(): Promise<boolean> {
    return true;
  }

  async logoutAll(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFound("User not found");
    }
    await user.save();
    return true;
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      return decoded;
    } catch {
      throw new Unauthorized("Invalid or expired token");
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFound("User not Found");
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequest("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    await this.logoutAll(userId);

    return true;
  }

  async sendOtp(email: string) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound("User not found with this email address");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.updateOne(
      { _id: user._id },
      { otp: hashedOtp, otpExpiresAt },
    );

    await sendEmail(
      user.email!,
      "Email Verification OTP - GoGuide",
      `Your email verification OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nPlease use this OTP to verify your email address.`,
    );

    return { message: "OTP sent successfully to your email" };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound("User not found");
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequest("No OTP found. Please request a new one.");
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequest("OTP has expired");
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      throw new BadRequest("Invalid OTP");
    }

    // Clear OTP and set email as verified
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isEmailVerified = true;
    await user.save();

    return { message: "Email verified successfully" };
  }

  async forgotPassword(identifier: string) {
    const user = await User.findOne({ email: identifier });

    if (!user) {
      throw new NotFound("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = hashedOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendEmail(
      user.email!,
      "Password Reset OTP - GoGuide",
      `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    );

    return { message: "Password reset OTP sent to your email" };
  }

  async resetPassword(identifier: string, otp: string, newPassword: string) {
    const user = await User.findOne({ email: identifier });

    if (!user) {
      throw new NotFound("User not found");
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequest("No OTP found. Please request a new one.");
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequest("OTP has expired");
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      throw new BadRequest("Invalid OTP");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { message: "Password reset successfully" };
  }

  private generateToken(userId: string, email: string) {
    // jwt.sign typing requires Secret type and options cast correctly
    const payload = { userId, email };
    const secret = env.JWT_SECRET as jwt.Secret;
    // cast to any because Jwt.SignOptions.expiresIn expects a strict template literal type
    const options: jwt.SignOptions = {
      expiresIn: (env.JWT_EXPIRATION || "7d") as any,
    };

    return jwt.sign(payload, secret, options);
  }

  // --------------------- User Management ---------------------
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new NotFound("User not found");
    }
    return user;
  }
}

export const authService = new AuthService();

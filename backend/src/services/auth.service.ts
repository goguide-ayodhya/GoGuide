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
import { logger } from "../utils/logger";

export class AuthService {
  // --------------------- Authentication ---------------------
  async login(input: LoginInput) {
    const identifier = input.identifier.trim().toLowerCase();
    const isEmail = identifier.includes("@");
    const user = await User.findOne(
      isEmail ? { email: identifier } : { phone: input.identifier.trim() },
    );

    if (!user) {
      throw new Unauthorized("Invalid email/phone or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Unauthorized("Invalid email/phone or password");
    }

    if (user.role === "GUIDE" || user.role === "DRIVER") {
      if (!user.isEmailVerified) {
        throw new BadRequest("EMAIL_NOT_VERIFIED");
      }

      if (!user.isProfileComplete) {
        throw new BadRequest("PROFILE_INCOMPLETE");
      }

      if (!user.status || user.status !== "ACTIVE") {
        throw new BadRequest("ACCOUNT_INACTIVE");
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
        isProfileComplete: user.isProfileComplete,
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
      status: input.role === "TOURIST" ? "ACTIVE" : "INACTIVE",
    });

    if (input.role === "GUIDE") {
      await Guide.create({
        userId: user._id,
        specialities: [],
        locations: [],
        price: 500,
        duration: "4 hours",
        certificates: [],
        yearsOfExperience: 0,
        languages: [],
        verificationStatus: "PENDING",
        isAvailable: false,
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

    // Send email verification if email is provided. Do not fail signup when email delivery fails.
    if (user.email) {
      try {
        await this.sendOtp(user.email);
      } catch (error) {
        logger.warn(
          `[AUTH] Signup succeeded but email OTP send failed for ${user.email}`,
          error,
        );
      }
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

    await User.updateOne({ _id: user._id }, { otp: hashedOtp, otpExpiresAt });

    await sendEmail(
      user.email!,
      "Verify Your Email Address - GoGuide",
      `
  <div style="
    max-width: 500px;
    margin: auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    text-align: center;
  ">
    
    <h2 style="margin-bottom: 10px;">GoGuide</h2>

    <p style="margin: 10px 0;">
      Hi ${user.name || "User"},
    </p>

    <p style="margin: 10px 0; font-size: 14px;">
      Thank you for joining GoGuide!  
      Please use the OTP below to verify your email.
    </p>

    <div style="
      margin: 20px auto;
      padding: 12px 20px;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 4px;
      border: 1px solid #ccc;
      background-color: #ffffff;
      display: inline-block;
      border-radius: 4px;
    ">
      ${otp}
    </div>

    <p style="font-size: 13px; color: #555;">
      This OTP is valid for 10 minutes.
    </p>

    <p style="font-size: 12px; color: #888; margin-top: 15px;">
      Do not share this OTP with anyone.
      If you didn’t request this, you can ignore this email.
    </p>

    <p style="margin-top: 20px; font-size: 13px;">
      — Team GoGuide
    </p>

  </div>
  `,
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

    // DO NOT activate GUIDE/DRIVER here - they must complete profile first
    // Only TOURIST gets activated
    if (user.role === "TOURIST") {
      user.status = "ACTIVE";
    }

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
      `
  <div style="
    max-width: 500px;
    margin: auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    text-align: center;
  ">

    <h2 style="margin-bottom: 10px;">GoGuide</h2>

    <p style="margin: 10px 0;">
      Hi ${user.name || "User"},
    </p>

    <p style="margin: 10px 0; font-size: 14px;">
      Use the OTP below to reset your password.
    </p>

    <div style="
      margin: 20px auto;
      padding: 12px 20px;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 4px;
      border: 1px solid #ccc;
      background-color: #ffffff;
      display: inline-block;
      border-radius: 4px;
    ">
      ${otp}
    </div>

    <p style="font-size: 13px; color: #555;">
      This OTP is valid for 10 minutes.
    </p>

    <p style="font-size: 12px; color: #888; margin-top: 15px;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <p style="margin-top: 20px; font-size: 13px;">
      — Team GoGuide
    </p>

  </div>
  `,
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

    // Invalidate all existing sessions for security
    await this.logoutAll(user._id.toString());

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

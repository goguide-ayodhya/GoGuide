import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import { Guide } from "../models/Guide";
import { env } from "../config/environment";
import {
  BadRequest,
  Conflict,
  Unauthorized,
  NotFound,
} from "../utils/httpException";
import {
  LoginInput,
  SignupInput,
  GoogleLoginInput,
  GoogleSignupInput,
} from "../validations/auth";
import { Driver } from "../models/Driver";
import { sendEmail } from "../config/email.config";
import { logger } from "../utils/logger";

export class AuthService {
  // --------------------- Authentication ---------------------
  async login(input: LoginInput) {
    console.log("[AUTH-SERVICE] Login attempt:", { identifier: input.identifier });
    const identifier = input.identifier.trim().toLowerCase();
    const isEmail = identifier.includes("@");
    const user = await User.findOne(
      isEmail ? { email: identifier } : { phone: input.identifier.trim() },
    );

    if (!user) {
      console.log("[AUTH-SERVICE] User not found:", identifier);
      throw new Unauthorized("Invalid email/phone or password");
    }

    console.log("[AUTH-SERVICE] User found:", {
      id: user._id,
      role: user.role,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isProfileComplete: user.isProfileComplete,
      profileStep: user.profileStep
    });

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      console.log("[AUTH-SERVICE] Invalid password for user:", identifier);
      throw new Unauthorized("Invalid email/phone or password");
    }

    // CRITICAL: Ensure Driver document exists for DRIVER users
    if (user.role === "DRIVER") {
      console.log("[AUTH-SERVICE] Checking Driver document for user:", user._id);
      const driverProfile = await Driver.findOne({ userId: user._id });

      if (!driverProfile) {
        console.log("[AUTH-SERVICE] CRITICAL: Driver document missing for user:", user._id, "Creating fallback profile");
        await Driver.create({
          userId: user._id,
          vehicleType: "",
          vehicleName: "",
          vehicleNumber: "",
          seats: 0,
          images: [],
          verificationStatus: "PENDING",
          isAvailable: false,
          averageRating: 0,
          totalRides: 0,
          driverName: user.name,
        });
        console.log("[AUTH-SERVICE] Fallback Driver profile created for user:", user._id);
      } else {
        console.log("[AUTH-SERVICE] Driver profile exists:", driverProfile._id);
      }
    }

    const token = this.generateToken(user._id.toString(), user.email || "");

    if (user.role === "GUIDE" || user.role === "DRIVER") {
      if (!user.isEmailVerified) {
        console.log("[AUTH-SERVICE] Email not verified for user:", user._id);
        throw new BadRequest("EMAIL_NOT_VERIFIED", { role: user.role });
      }

      if (!user.isProfileComplete) {
        console.log("[AUTH-SERVICE] Profile incomplete for user:", user._id, "profileStep:", user.profileStep);
        return {
          user,
          token,
          profileIncomplete: !user.isProfileComplete
        }
      }

      if (!user.status || user.status !== "ACTIVE") {
        console.log("[AUTH-SERVICE] Account inactive for user:", user._id, "status:", user.status);
        throw new BadRequest("ACCOUNT_INACTIVE");
      }
    }

    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

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
    console.log("[AUTH-SERVICE] Signup attempt:", {
      email: input.email,
      phone: input.phone,
      name: input.name,
      role: input.role
    });

    // Require both email and phone and enforce uniqueness
    const existingUserByEmail = await User.findOne({ email: input.email });
    if (existingUserByEmail) {
      console.log("[AUTH-SERVICE] Email already exists:", input.email);
      throw new Conflict("Email already registered");
    }

    const existingUserByPhone = await User.findOne({ phone: input.phone });
    if (existingUserByPhone) {
      console.log("[AUTH-SERVICE] Phone already exists:", input.phone);
      throw new Conflict("Phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    console.log("[AUTH-SERVICE] Creating User document...");
    const user = await User.create({
      email: input.email || undefined,
      password: hashedPassword,
      name: input.name,
      phone: input.phone,
      role: input.role as any,
      avatar: input.avatar || undefined,
      status: input.role === "TOURIST" ? "ACTIVE" : "INACTIVE",
    });

    console.log("[AUTH-SERVICE] User created:", {
      id: user._id,
      role: user.role,
      email: user.email,
      phone: user.phone
    });

    if (input.role === "GUIDE") {
      console.log("[AUTH-SERVICE] Creating Guide profile for user:", user._id);
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
      console.log("[AUTH-SERVICE] Guide profile created for user:", user._id);
    }

    if (input.role === "DRIVER") {
      console.log("[AUTH-SERVICE] Creating Driver profile for user:", user._id);
      try {
        const driverProfile = await Driver.create({
          userId: user._id,
          vehicleType: input.vehicleType || "",
          vehicleName: input.vehicleName || "",
          vehicleNumber: input.vehicleNumber || "",
          seats: input.seats || 0,
          images: [input.driverPhoto].filter(Boolean) as string[],
          verificationStatus: "PENDING",
          isAvailable: false,
          averageRating: 0,
          totalRides: 0,
          driverName: input.name,
        });
        console.log("[AUTH-SERVICE] Driver profile created successfully:", driverProfile._id);
      } catch (driverError) {
        console.error("[AUTH-SERVICE] Failed to create Driver profile:", driverError);
        const errorMessage = driverError instanceof Error ? driverError.message : String(driverError);
        throw new Error(`Failed to create driver profile: ${errorMessage}`);
      }
    }
    const token = this.generateToken(user._id.toString(), user.email || "");

    // Send email verification if email is provided. Do not fail signup when email delivery fails.
    if (user.email && user.authProvider !== "GOOGLE") {
      try {
        console.log("SIGNUP API HIT");
        await this.sendOtp(user.email);
        console.log("SIGNUP API HIT");
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

  private async verifyGoogleToken(idToken: string) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Unauthorized("Google client is not configured");
    }

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new Unauthorized("Invalid Google token");
    }

    if (!payload.email_verified) {
      throw new Unauthorized("Google email is not verified");
    }

    return {
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
      name: payload.name || payload.email.split("@")[0],
      avatar: payload.picture || "",
    };
  }

  async googleLogin(idToken: string) {
    console.log("[AUTH-SERVICE] Google login attempt");
    const { email, googleId, name, avatar } =
      await this.verifyGoogleToken(idToken);

    console.log("[AUTH-SERVICE] Google token verified:", { email, googleId, name });

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      console.log("[AUTH-SERVICE] Google account not linked:", email);
      throw new NotFound("Google account not linked. Please sign up first.");
    }

    console.log("[AUTH-SERVICE] Found user for Google login:", {
      id: user._id,
      role: user.role,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isProfileComplete: user.isProfileComplete
    });

    if (!user.googleId) {
      if (user.email && user.email !== email) {
        throw new Conflict("This email is already linked to another account");
      }
      user.googleId = googleId;
      user.authProvider = "GOOGLE";
      user.name = user.name || name;
      // NEVER auto-assign Google avatar - only manual uploads allowed
    }

    user.isEmailVerified = true;
    user.lastLoginAt = new Date();

    if (user.role === "TOURIST" && user.status !== "ACTIVE") {
      user.status = "ACTIVE";
    }

    await user.save();

    // CRITICAL: Ensure Driver document exists for DRIVER users
    if (user.role === "DRIVER") {
      console.log("[AUTH-SERVICE] Checking Driver document for Google login user:", user._id);
      const driverProfile = await Driver.findOne({ userId: user._id });

      if (!driverProfile) {
        console.log("[AUTH-SERVICE] CRITICAL: Driver document missing for Google user:", user._id, "Creating fallback profile");
        await Driver.create({
          userId: user._id,
          vehicleType: "",
          vehicleName: "",
          vehicleNumber: "",
          seats: 0,
          images: [],
          verificationStatus: "PENDING",
          isAvailable: false,
          averageRating: 0,
          totalRides: 0,
          driverName: user.name,
        });
        console.log("[AUTH-SERVICE] Fallback Driver profile created for Google user:", user._id);
      } else {
        console.log("[AUTH-SERVICE] Driver profile exists for Google user:", driverProfile._id);
      }
    }

    if (user.role === "GUIDE" || user.role === "DRIVER") {
      if (!user.isEmailVerified) {
        console.log("[AUTH-SERVICE] Email not verified for Google user:", user._id);
        throw new BadRequest("EMAIL_NOT_VERIFIED", { role: user.role });
      }

      if (!user.isProfileComplete) {
        const token = this.generateToken(
          user._id.toString(),
          user.email || ""
        );

        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            isProfileComplete: false,
            profileStep: user.profileStep || 1,
            avatar: user.avatar,
          },
          token,
          profileIncomplete: true,
        };
      }

      if (!user.status || user.status !== "ACTIVE") {
        console.log("[AUTH-SERVICE] Account inactive for Google user:", user._id, "status:", user.status);
        throw new BadRequest("ACCOUNT_INACTIVE");
      }
    }

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
        avatar: user.avatar,
      },
      token,
    };
  }

  async googleSignup(input: GoogleSignupInput) {
    console.log("[AUTH-SERVICE] Google signup attempt:", { role: input.role });
    const { idToken, role } = input;
    const { email, googleId, name, avatar } =
      await this.verifyGoogleToken(idToken);

    console.log("[AUTH-SERVICE] Google token verified for signup:", { email, googleId, name, role });

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      console.log("[AUTH-SERVICE] Existing user found for Google signup:", {
        id: user._id,
        role: user.role,
        email: user.email
      });

      if (user.role !== role) {
        console.log("[AUTH-SERVICE] Role mismatch for existing user:", { existing: user.role, requested: role });
        throw new Conflict("Email is already registered with a different role");
      }

      if (user.googleId && user.googleId !== googleId) {
        throw new Conflict("This Google account is linked to another user");
      }

      user.googleId = googleId;
      user.authProvider = "GOOGLE";
      user.name = user.name || name;
      // NEVER auto-assign Google avatar - only manual uploads allowed
      user.isEmailVerified = true;

      if (user.role === "TOURIST") {
        user.status = "ACTIVE";
        user.isProfileComplete = true;
      }

      await user.save();
      console.log("[AUTH-SERVICE] Existing user updated for Google signup:", user._id);
    } else {
      console.log("[AUTH-SERVICE] Creating new user for Google signup...");
      const randomPassword = `${Math.random().toString(36).slice(2)}${Date.now()}`;
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone: `google-${googleId}`,
        avatar: "", // NEVER auto-assign Google avatar
        role,
        status: role === "TOURIST" ? "ACTIVE" : "INACTIVE",
        authProvider: "GOOGLE",
        googleId,
        isEmailVerified: true,
        isProfileComplete: role === "TOURIST" ? true : false,
      });

      console.log("[AUTH-SERVICE] New user created for Google signup:", {
        id: user._id,
        role: user.role,
        email: user.email
      });

      if (role === "GUIDE") {
        console.log("[AUTH-SERVICE] Creating Guide profile for Google signup user:", user._id);
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
        console.log("[AUTH-SERVICE] Guide profile created for Google signup user:", user._id);
      }

      if (role === "DRIVER") {
        console.log("[AUTH-SERVICE] Creating Driver profile for Google signup user:", user._id);
        try {
          const driverProfile = await Driver.create({
            userId: user._id,
            vehicleName: "",
            vehicleNumber: "",
            seats: 0,
            images: [],
            verificationStatus: "PENDING",
            isAvailable: false,
            averageRating: 0,
            totalRides: 0,
            driverName: user.name,
          });
          console.log("[AUTH-SERVICE] Driver profile created for Google signup user:", driverProfile._id);
        } catch (driverError) {
          console.error("[AUTH-SERVICE] Failed to create Driver profile for Google signup:", driverError);
          const errorMessage = driverError instanceof Error ? driverError.message : String(driverError);
          throw new Error(`Failed to create driver profile: ${errorMessage}`);
        }
      }
    }

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

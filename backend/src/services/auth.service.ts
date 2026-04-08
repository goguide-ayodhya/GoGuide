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

export class AuthService {
  // --------------------- Authentication ---------------------
  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email });

    if (!user) {
      throw new Unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Unauthorized("Invalid email or password");
    }

    if (user.role === "GUIDE") {
      if (!user.status || user.status !== "ACTIVE") {
        throw new BadRequest("Account is inactive");
      }
    }

    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async signup(input: SignupInput) {
    const existingUser = await User.findOne({ email: input.email });

    if (existingUser) {
      throw new Conflict("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await User.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      phone: input.phone,
      role: input.role as any,
      avatar: input.avatar || undefined,
      speciality: input.speciality,
      hourlyRate: input.hourlyRate || 500,
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
    const token = this.generateToken(user._id.toString(), user.email);

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

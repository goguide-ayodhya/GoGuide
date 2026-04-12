import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(8, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["GUIDE", "TOURIST", "DRIVER"]).default("TOURIST"),
  avatar: z.string().optional(),
  profileImage: z.string().optional(),
  speciality: z.string().optional(),
  hourlyRate: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().optional()),
  experience: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().optional()),
  languages: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return [value];
    }
    return value;
  }, z.array(z.string()).optional()),
  vehicleType: z.string().optional(),
  vehicleName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  pricePerKm: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().optional()),
  seats: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().optional()),
  driverPhoto: z.string().optional(), 
  vehiclePhoto: z.string().optional(),
  driverAadhar: z.string().optional(),
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.driverAadhar && data.driverAadhar.trim() !== "";
  }
  return true;
}, {
  message: "Aadhar number is required for drivers",
  path: ["driverAadhar"],
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.vehicleType && data.vehicleType.trim() !== "";
  }
  return true;
}, {
  message: "Vehicle type is required for drivers",
  path: ["vehicleType"],
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.vehicleName && data.vehicleName.trim() !== "";
  }
  return true;
}, {
  message: "Vehicle name is required for drivers",
  path: ["vehicleName"],
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.vehicleNumber && data.vehicleNumber.trim() !== "";
  }
  return true;
}, {
  message: "Vehicle number is required for drivers",
  path: ["vehicleNumber"],
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.pricePerKm && data.pricePerKm > 0;
  }
  return true;
}, {
  message: "Price per km is required for drivers",
  path: ["pricePerKm"],
}).refine((data) => {
  if (data.role === "DRIVER") {
    return data.seats && data.seats > 0;
  }
  return true;
}, {
  message: "Number of seats is required for drivers",
  path: ["seats"],
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  driverPhoto: z.string().optional(),
  vehiclePhoto: z.string().optional(),
});

export const sendOtpSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Valid email address is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Valid email address is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

import { z } from "zod";

export const createDriverProfileSchema = z.object({
  driverName: z.string().min(2, "Driver name must be at least 2 characters").max(100, "Driver name must be less than 100 characters"),
  vehicleType: z.enum(["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"], {
    errorMap: () => ({ message: "Vehicle type must be one of: CAR, BIKE, AUTO, RIKSHAW, VAN, OTHER" }),
  }),
  vehicleName: z.string().min(2, "Vehicle name must be at least 2 characters").max(100, "Vehicle name must be less than 100 characters"),
  vehicleNumber: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, "Vehicle number must be in format: XX00XX0000 (e.g., UP32AB1234)"),
  seats: z.coerce.number().int().min(1, "Seats must be at least 1").max(50, "Seats cannot exceed 50"),
  driverLicenseName: z.string().min(2, "License holder name is required").max(100, "License holder name must be less than 100 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

export const updateDriverProfileSchema = z.object({
  driverName: z.string().min(2, "Driver name must be at least 2 characters").max(100, "Driver name must be less than 100 characters").optional(),
  vehicleType: z.enum(["CAR", "BIKE", "AUTO", "RIKSHAW", "VAN", "OTHER"], {
    errorMap: () => ({ message: "Vehicle type must be one of: CAR, BIKE, AUTO, RIKSHAW, VAN, OTHER" }),
  }).optional(),
  vehicleName: z.string().min(2, "Vehicle name must be at least 2 characters").max(100, "Vehicle name must be less than 100 characters").optional(),
  vehicleNumber: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, "Vehicle number must be in format: XX00XX0000 (e.g., UP32AB1234)").optional(),
  seats: z.coerce.number().int().min(1, "Seats must be at least 1").max(50, "Seats cannot exceed 50").optional(),
  driverLicenseName: z.string().min(2, "License holder name is required").max(100, "License holder name must be less than 100 characters").optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});
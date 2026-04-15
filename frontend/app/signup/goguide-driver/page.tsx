"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

type DriverFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  vehicleType: string;
  vehicleName: string;
  vehicleNumber: string;
  pricePerKm: string;
  seats: string;
  driverPhoto: File | null;
  vehiclePhoto: File | null;
  driverAadhar: string;
};

const VEHICLE_TYPES = ["CAR", "BIKE", "AUTO"];

export default function DriverForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleType: "",
    vehicleName: "",
    vehicleNumber: "",
    pricePerKm: "",
    seats: "",
    driverPhoto: null,
    vehiclePhoto: null,
    driverAadhar: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validations
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (formData.email && !formData.email.trim()) newErrors.email = "Email cannot be empty";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.driverAadhar.trim())
      newErrors.driverAadhar = "Aadhar number is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password && !/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    }
    if (formData.password && !/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    }
    if (formData.password && !/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Aadhar validation (12 digits)
    if (
      formData.driverAadhar &&
      !/^\d{12}$/.test(formData.driverAadhar.replace(/\s/g, ""))
    ) {
      newErrors.driverAadhar = "Aadhar number must be 12 digits";
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Vehicle validations
    if (!formData.vehicleType)
      newErrors.vehicleType = "Vehicle type is required";
    if (!formData.vehicleName.trim())
      newErrors.vehicleName = "Vehicle name is required";
    if (!formData.vehicleNumber.trim())
      newErrors.vehicleNumber = "Vehicle number is required";
    if (!formData.pricePerKm || parseFloat(formData.pricePerKm) <= 0) {
      newErrors.pricePerKm = "Valid price per km is required";
    }
    if (!formData.seats || parseInt(formData.seats) <= 0) {
      newErrors.seats = "Valid number of seats is required";
    }

    // File validations
    if (!formData.driverPhoto)
      newErrors.driverPhoto = "Driver photo is required";
    if (!formData.vehiclePhoto)
      newErrors.vehiclePhoto = "Vehicle photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "DRIVER",
        vehicleType: formData.vehicleType,
        vehicleName: formData.vehicleName,
        vehicleNumber: formData.vehicleNumber,
        pricePerKm: formData.pricePerKm,
        seats: formData.seats,
        driverPhoto: formData.driverPhoto,
        vehiclePhoto: formData.vehiclePhoto,
        driverAadhar: formData.driverAadhar,
      });
      router.push("/");
    } catch (err: any) {
      console.error("Signup error:", err);

      // Handle different types of errors
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = err.response.data.errors;
        if (Array.isArray(backendErrors)) {
          const errorMessages = backendErrors
            .map((error: any) => error.message)
            .join(", ");
          setError(errorMessages);
        } else {
          setError("Please check your input and try again");
        }
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md md:max-w-lg w-full">
        <div className="text-center">
          <Image
            src={assets.logo}
            alt="GoGuide - Ayodhya"
            width={96}
            height={96}
            className="mx-auto"
          />
          <p className="text-muted-foreground pt-2">Book ● Feel ● Remember</p>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-secondary" />
            <h1 className={`${poppins.className} text-secondary text-xl`}>
              {" "}
              Join as a Driver
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={errors.name ? "border-red-500" : "bg-muted"}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : "bg-muted"}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={errors.phone ? "border-red-500" : "bg-muted"}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-4 ">
                <Label htmlFor="driverAadhar">Aadhar Number</Label>
                <Input
                  id="driverAadhar"
                  name="driverAadhar"
                  type="text"
                  placeholder="Enter your 12-digit Aadhar number"
                  value={formData.driverAadhar}
                  onChange={handleInputChange}
                  required
                  className={
                    errors.driverAadhar ? "border-red-500" : "bg-muted"
                  }
                />
                {errors.driverAadhar && (
                  <p className="text-sm text-red-600">{errors.driverAadhar}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, vehicleType: value }));
                    if (errors.vehicleType) {
                      setErrors((prev) => ({ ...prev, vehicleType: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={
                      errors.vehicleType ? "border-red-500" : "bg-muted"
                    }
                  >
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleType && (
                  <p className="text-sm text-red-600">{errors.vehicleType}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleName">Vehicle Name/Model</Label>
                <Input
                  id="vehicleName"
                  name="vehicleName"
                  type="text"
                  placeholder="e.g., Toyota Camry"
                  value={formData.vehicleName}
                  onChange={handleInputChange}
                  required
                  className={errors.vehicleName ? "border-red-500" : "bg-muted"}
                />
                {errors.vehicleName && (
                  <p className="text-sm text-red-600">{errors.vehicleName}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  placeholder="e.g., ABC-123"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required
                  className={
                    errors.vehicleNumber ? "border-red-500" : "bg-muted"
                  }
                />
                {errors.vehicleNumber && (
                  <p className="text-sm text-red-600">{errors.vehicleNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerKm">Price per Km ($)</Label>
                <Input
                  id="pricePerKm"
                  name="pricePerKm"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  value={formData.pricePerKm}
                  onChange={handleInputChange}
                  required
                  className={errors.pricePerKm ? "border-red-500" : "bg-muted"}
                />
                {errors.pricePerKm && (
                  <p className="text-sm text-red-600">{errors.pricePerKm}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Number of Seats</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  placeholder="4"
                  value={formData.seats}
                  onChange={handleInputChange}
                  required
                  className={errors.seats ? "border-red-500" : "bg-muted"}
                />
                {errors.seats && (
                  <p className="text-sm text-red-600">{errors.seats}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverPhoto">Driver Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="driverPhoto"
                    name="driverPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Label
                    htmlFor="driverPhoto"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 flex-1",
                      errors.driverPhoto ? "border-red-500" : "border-gray-300",
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    {formData.driverPhoto
                      ? formData.driverPhoto.name
                      : "Choose file"}
                  </Label>
                </div>
                {errors.driverPhoto && (
                  <p className="text-sm text-red-600">{errors.driverPhoto}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="vehiclePhoto">Vehicle Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="vehiclePhoto"
                    name="vehiclePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Label
                    htmlFor="vehiclePhoto"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 flex-1",
                      errors.vehiclePhoto
                        ? "border-red-500"
                        : "border-gray-300",
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    {formData.vehiclePhoto
                      ? formData.vehiclePhoto.name
                      : "Choose file"}
                  </Label>
                </div>
                {errors.vehiclePhoto && (
                  <p className="text-sm text-red-600">{errors.vehiclePhoto}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={errors.password ? "border-red-500" : "bg-muted"}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1 text-xs">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasLength
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      8+ characters
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasUpperCase
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Uppercase
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasLowerCase
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Lowercase
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasNumber
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Number
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={
                  errors.confirmPassword ? "border-red-500" : "bg-muted"
                }
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Become a Driver"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

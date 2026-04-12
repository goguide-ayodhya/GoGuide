"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/auth";
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
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validatePhone,
  FieldErrors,
} from "@/lib/errorHandler";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

export default function UserForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    // Client-side validation
    const validationErrors: FieldErrors = {};

    // Check required fields
    const requiredErrors = validateRequiredFields({
      name: formData.name,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
    });
    Object.assign(validationErrors, requiredErrors);

    // Validate email if provided
    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        validationErrors.email = emailError;
      }
    }

    // Validate phone
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        validationErrors.phone = phoneError;
      }
    }

    // Validate password
    const passwordError = validatePassword(formData.password, 6);
    if (passwordError) {
      validationErrors.password = passwordError;
    }

    // Check password match
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email || undefined,
        password: formData.password,
        phone: formData.phone,
        role: "TOURIST",
      });
      router.push("/");
    } catch (err: any) {
      // Handle API errors with field-level validation errors
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError(err.message || "Signup failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md md:max-w-lg w-full">
        <div className="text-center">
          <Image
            src={assets.logo}
            alt="GoGuide - Ayodhya"
            className="mx-auto h-24 w-auto"
          />
          <p className="text-muted-foreground pt-2">Book ● Feel ● Remember</p>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-secondary" />
            <h1 className={`${poppins.className} text-secondary text-xl`}>
              {" "}
              Join as a Tourist
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`bg-muted ${fieldErrors.name ? "border-red-500" : ""}`}
                  required
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
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
                  className={`bg-muted ${fieldErrors.email ? "border-red-500" : ""}`}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`bg-muted ${fieldErrors.phone ? "border-red-500" : ""}`}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-muted ${fieldErrors.password ? "border-red-500" : ""}`}
                  required
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
                {formData.password && !fieldErrors.password && (
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
                  className={`bg-muted ${fieldErrors.confirmPassword ? "border-red-500" : ""}`}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
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
                {loading ? "Creating Account..." : "Create Account"}
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

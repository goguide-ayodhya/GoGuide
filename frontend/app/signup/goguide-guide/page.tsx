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
import { MapPin, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

type GuideSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

export default function GuideSignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<GuideSignupData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const isStrongPassword = Object.values(passwordStrength).every(Boolean);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (formData.phone.length < 10) {
      setError("Phone number must be at least 10 digits");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!isStrongPassword) {
      setError("Password must contain uppercase, lowercase, and numbers");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "GUIDE",
      });

      if (user.email) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        {/* Logo Section */}
        <div className="text-center pt-6">
          <Image
            src={assets.logo}
            alt="GoGuide"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">Book • Feel • Remember</p>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-orange-500" />
            <span className={`${poppins.className} text-orange-600`}>
              Join as a Guide
            </span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Create your account and start earning
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-slate-50 border-slate-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[
                    passwordStrength.hasLength,
                    passwordStrength.hasUpperCase,
                    passwordStrength.hasLowerCase,
                    passwordStrength.hasNumber,
                  ].map((check, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        check ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li className="flex items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full flex items-center justify-center text-white text-[10px] ${
                        passwordStrength.hasLength ? "bg-green-500" : "bg-slate-300"
                      }`}
                    >
                      {passwordStrength.hasLength ? "✓" : ""}
                    </span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full flex items-center justify-center text-white text-[10px] ${
                        passwordStrength.hasUpperCase
                          ? "bg-green-500"
                          : "bg-slate-300"
                      }`}
                    >
                      {passwordStrength.hasUpperCase ? "✓" : ""}
                    </span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full flex items-center justify-center text-white text-[10px] ${
                        passwordStrength.hasLowerCase
                          ? "bg-green-500"
                          : "bg-slate-300"
                      }`}
                    >
                      {passwordStrength.hasLowerCase ? "✓" : ""}
                    </span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full flex items-center justify-center text-white text-[10px] ${
                        passwordStrength.hasNumber ? "bg-green-500" : "bg-slate-300"
                      }`}
                    >
                      {passwordStrength.hasNumber ? "✓" : ""}
                    </span>
                    One number
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-slate-50 border-slate-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-10 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

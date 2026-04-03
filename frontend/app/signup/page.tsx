"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone: string;
  avatar: File | null;
};

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TOURIST",
    phone: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const isPasswordStrong =
    Object.values(passwordStrength).filter(Boolean).length >= 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "avatar" && files) {
      setFormData((prev) => ({
        ...prev,
        avatar: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (!isPasswordStrong) {
        setError("Password is not strong enough");
        return;
      }

      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        avatar: formData.avatar || undefined,
      });

      if (formData.role === "GUIDE") {
        router.push("/guide/dashboard");
      } else {
        router.push("/tourist/guides");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TourGuide</h1>
          </div>
          <p className="text-muted-foreground">Travel ● Feel ● Remember</p>
        </div>

        {/* Signup Card */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              Create your Account
            </CardTitle>
            <CardDescription className="text-center">
              Start living your life today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 bg-red-500/10 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="John Anderson"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Profile Picture
                </label>
                <Input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Password strength:
                    </div>
                    <div className="space-y-1">
                      {[
                        {
                          label: "At least 8 characters",
                          check: passwordStrength.hasLength,
                        },
                        {
                          label: "Uppercase letter",
                          check: passwordStrength.hasUpperCase,
                        },
                        {
                          label: "Lowercase letter",
                          check: passwordStrength.hasLowerCase,
                        },
                        { label: "Number", check: passwordStrength.hasNumber },
                      ].map((req) => (
                        <div
                          key={req.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center",
                              req.check
                                ? "bg-green-500/20 border-green-500"
                                : "border-muted",
                            )}
                          >
                            {req.check && (
                              <Check size={12} className="text-green-600" />
                            )}
                          </div>
                          <span
                            className={
                              req.check
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone
                </label>
                <Input
                  type="number"
                  name="phone"
                  placeholder="Mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-input border-border"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-foreground">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-input border-border text-sm font-medium text-foreground p-2 rounded-md"
                >
                  <option className="text-sm" value="TOURIST">
                    Tourist
                  </option>
                  <option className="text-sm" value="GUIDE">
                    Guide
                  </option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={loading || !isPasswordStrong}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { JSX, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense } from "react";

import { forgotPassword, resetPassword } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { FieldErrors } from "@/lib/errorHandler";

function LoginPageContent(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      try {
        if (!identifier || !password) {
          setError("Please fill in all fields");
          return;
        }

        setLoading(true);

        const user = await login({ identifier, password });
        if (!user) {
          throw new Error("User not found");
        }

        if (redirect && redirect.startsWith("/")) {
          router.push(redirect);
          return;
        }

        if (user.role === "GUIDE") {
          router.push("/guide/dashboard");
        } else if (user.role === "DRIVER") {
          router.push("/driver/dashboard");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        const msg = err.message;

        if (msg === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${identifier}`);
          return;
        }

        if (msg === "PROFILE_INCOMPLETE") {
          router.push(`/guide/complete-profile`);
          return;
        }

        if (msg === "ACCOUNT_INACTIVE") {
          setError("Account is inactive");
          setLoading(false);
          return;
        }

        setError(msg || "Login failed");
        setLoading(false);
      }
    } else if (mode === "forgot") {
      // Send OTP for password reset
      try {
        if (!identifier) {
          setError("Please enter your email");
          return;
        }
        await forgotPassword(identifier);
        setSuccess("OTP sent to your email. Please check your inbox.");
        setMode("reset");
      } catch (err: any) {
        setError(err.message || "Failed to send OTP");
      }
    } else if (mode === "reset") {
      // Reset password with OTP
      try {
        if (!identifier || !otp || !newPassword) {
          setError("Please fill in all fields");
          return;
        }
        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        await resetPassword(identifier, otp, newPassword);
        setSuccess(
          "Password reset successfully! Please login with your new password.",
        );
        setMode("login");
        setIdentifier("");
        setPassword("");
        setOtp("");
        setNewPassword("");
      } catch (err: any) {
        setError(err.message || "Failed to reset password");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Image
                src={assets.logo}
                alt="GoGuide - Ayodhya"
                width={96}
                height={96}
                className="mx-auto"
              />
            </div>
          </div>
          <p className="text-muted-foreground pt-2">Travel ● Feel ● Remember</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              {mode === "login"
                ? "Welcome Back"
                : mode === "forgot"
                  ? "Reset Password"
                  : "Enter OTP"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "login"
                ? "Sign in to your account"
                : mode === "forgot"
                  ? "Enter your email to reset password"
                  : "Enter the OTP sent to your email and set new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 text-green-600 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {mode === "login" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email or Phone
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your email or phone"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="bg-muted border-border"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-muted"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-primary cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              ) : mode === "forgot" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your email or phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="bg-muted border-border"
                    disabled={loading}
                    required
                  />
                </div>
              ) : (
                // Reset mode
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      type="text"
                      value={identifier}
                      disabled
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      OTP
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-muted border-border"
                      disabled={loading}
                      maxLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-muted"
                      disabled={loading}
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 cursor-pointer text-primary-foreground font-medium"
                disabled={loading}
              >
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : mode === "forgot"
                      ? "Sending..."
                      : "Resetting..."
                  : mode === "login"
                    ? "Sign In"
                    : mode === "forgot"
                      ? "Send OTP"
                      : "Reset Password"}
              </Button>

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Back to login
                </button>
              )}

              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Back to email input
                </button>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/signup/user"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

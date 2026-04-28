"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { verifyEmailOtp, sendOtpApi } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const nextRedirect = searchParams.get("next") || "";
  const { refreshUser } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) value = value.slice(-1); // Only take last digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length >= 6) {
      const newOtp = pastedData.slice(0, 6).split("");
      setOtp(newOtp as string[]);
      inputRefs.current[5]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleVerify = async () => {
    if (!isOtpComplete) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const otpString = otp.join("");
      await verifyEmailOtp({
        email,
        otp: otpString,
      });

      const refreshedUser = await refreshUser();
      setSuccess(true);

      const destination = nextRedirect && nextRedirect.startsWith("/")
        ? nextRedirect
        : refreshedUser.role === "GUIDE"
          ? refreshedUser.isProfileComplete
            ? "/guide/dashboard"
            : "/guide/complete-profile"
          : refreshedUser.role === "DRIVER"
            ? "/driver/dashboard"
            : "/";

      setTimeout(() => router.push(destination), 1500);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");

    try {
      await sendOtpApi({ email });
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Email Verified!
              </h2>
              <p className="text-slate-600">
                Redirecting to profile completion...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground">
            Book • Feel • Remember
          </p>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Mail className="h-6 w-6 text-orange-500" />
            <span className={`${poppins.className} text-orange-600`}>
              Verify Email
            </span>
          </CardTitle>
          <CardDescription className="text-base mt-3">
            We've sent a verification code to
            <br />
            <span className="font-semibold text-slate-900">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">
                Enter 6-Digit Code
              </label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={loading || !isOtpComplete}
              className="w-full bg-primary hover:bg-primay/95 text-white h-10 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-slate-600">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendTimer > 0}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>

            {/* Info Text */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
              <p>
                The verification code will expire in 10 minutes. Check your spam
                folder if you don't see the email.
              </p>
            </div>
          </form>
          <button
            onClick={() => router.push("/signup/goguide-guide")}
            className="cursor-pointer border border-primary hover:bg-primary/95 text-primary w-full py-2 mt-2 transition-all duration-300 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back to Signup
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

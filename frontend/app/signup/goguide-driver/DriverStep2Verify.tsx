"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DriverStep2VerifyProps {
  email: string;
  otp: string;
  error: string;
  success: string;
  loading: boolean;
  sending: boolean;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
}

export function DriverStep2Verify({
  email,
  otp,
  error,
  success,
  loading,
  sending,
  onOtpChange,
  onVerify,
  onResend,
}: DriverStep2VerifyProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Verify your email</h2>
            <p className="text-sm text-slate-600">
              We sent a 6-digit code to {email || "your email"}. Enter it below to
              confirm your address.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">OTP code</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(event) => onOtpChange(event.target.value.replace(/[^0-9]/g, ""))}
              placeholder="123456"
              className="bg-muted"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onVerify} disabled={loading} className="w-full">
              {loading ? "Verifying…" : "Verify OTP"}
            </Button>
            <Button
              variant="outline"
              onClick={onResend}
              disabled={sending}
              className="w-full"
            >
              {sending ? "Resending…" : "Resend code"}
            </Button>
          </div>

          <p className="text-sm text-slate-500">
            Didn’t receive the code? Check spam or try resending after a few
            seconds.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}
        </div>
      </div>
    </div>
  );
}

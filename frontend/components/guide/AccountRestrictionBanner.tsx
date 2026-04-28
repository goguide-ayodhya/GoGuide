import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AccountRestrictionBannerProps {
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  accountStatus?: string;
  email?: string;
}

export function AccountRestrictionBanner({
  isEmailVerified,
  isProfileComplete,
  accountStatus,
  email,
}: AccountRestrictionBannerProps) {
  // Determine if there are any restrictions
  const hasRestrictions =
    !isEmailVerified || !isProfileComplete || accountStatus !== "ACTIVE";

  if (!hasRestrictions) {
    return null;
  }

  // Determine what needs to be done
  const needsEmailVerification = !isEmailVerified;
  const needsProfileCompletion = !isProfileComplete;
  const isInactive = accountStatus !== "ACTIVE";

  return (
    <div className="bg-gradient-to-r from-amber-50 to-red-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-2">
            Account Needs Attention
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            Complete the following to activate your account and start accepting bookings:
          </p>

          <div className="space-y-2 mb-4">
            {needsEmailVerification && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-700 font-bold">✓</span>
                </div>
                <span>Email Verification</span>
              </div>
            )}

            {needsProfileCompletion && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-700 font-bold">✓</span>
                </div>
                <span>Complete Your Profile</span>
              </div>
            )}

            {isInactive && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold">⟳</span>
                </div>
                <span>Account Activation Pending</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {needsEmailVerification && (
              <Link href={`/verify-email?email=${encodeURIComponent(email || "")}`}>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Verify Email
                </Button>
              </Link>
            )}

            {needsProfileCompletion && (
              <Link href="/guide/complete-profile">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Complete Profile
                </Button>
              </Link>
            )}

            {isInactive && !needsEmailVerification && !needsProfileCompletion && (
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Activation pending admin review
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

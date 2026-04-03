"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingsContext";
import { GuideProvider } from "@/contexts/GuideContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { EarningsProvider } from "@/contexts/EarningContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { Analytics } from "@vercel/analytics/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BookingProvider>
        <PaymentProvider>
          <EarningsProvider>
            <ReviewProvider>
              <GuideProvider>{children}</GuideProvider>
            </ReviewProvider>
          </EarningsProvider>
        </PaymentProvider>
        <Analytics />
      </BookingProvider>
    </AuthProvider>
  );
}

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingsContext";
import { GuideProvider } from "@/contexts/GuideContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { EarningsProvider } from "@/contexts/EarningContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { DriverProvider } from "@/contexts/DriverContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BookingProvider>
        <DriverProvider>
          <PaymentProvider>
            <EarningsProvider>
              <ReviewProvider>
                <GuideProvider>
                  {children}
                  <Toaster />
                </GuideProvider>
              </ReviewProvider>
            </EarningsProvider>
          </PaymentProvider>
        </DriverProvider>
        <Analytics />
      </BookingProvider>
    </AuthProvider>
  );
}

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
import { PackageProvider } from "@/contexts/TourPackageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FCMNotificationProvider } from "@/contexts/FCMNotificationContext";
import SocketProvider from "@/contexts/cabs/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <FCMNotificationProvider>
        <AuthProvider>
          <BookingProvider>
            <DriverProvider>
              <PaymentProvider>
                <EarningsProvider>
                  <SocketProvider>
                    <ReviewProvider>
                      <GuideProvider>
                        <PackageProvider>{children}</PackageProvider>
                      </GuideProvider>
                    </ReviewProvider>
                  </SocketProvider>
                </EarningsProvider>
              </PaymentProvider>
            </DriverProvider>
          </BookingProvider>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </FCMNotificationProvider>
    </NotificationProvider>
  );
}

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingsContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
import { ActiveRideProvider } from "@/contexts/ActiveRideContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { DisableConsole } from "./disable-console";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisableConsole />
      <GoogleOAuthProvider clientId={googleClientId}>
      <NotificationProvider>
        <FCMNotificationProvider>
          <AuthProvider>
            <BookingProvider>
              <DriverProvider>
                <PaymentProvider>
                  <EarningsProvider>
                    <SocketProvider>
                      <GoogleMapsProvider>
                        <ReviewProvider>
                          <GuideProvider>
                            <PackageProvider>
                              <ActiveRideProvider>
                                {children}
                              </ActiveRideProvider>
                            </PackageProvider>
                          </GuideProvider>
                        </ReviewProvider>
                      </GoogleMapsProvider>
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
    </GoogleOAuthProvider>
    </>
  );
}

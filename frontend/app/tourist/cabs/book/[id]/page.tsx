"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
// import { cabs } from '@/lib/mockData'
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import { CabBookingForm } from "@/components/booking/CabBookingForm";
import { notFound } from "next/navigation";
import { useEffect } from "react";

export default function CabBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { bookings } = useBooking();

  const cabId = params.id as string;
  // const cab = cabs.find((c) => c.id === cabId)

  // Store redirect URL for login page
  useEffect(() => {
    if (!isLoggedIn) {
      // Store the current page URL for redirect after login
      // This allows developers to see the template without logging in first
    }
  }, [isLoggedIn]);

  // if (!cab) {
  //   notFound()
  // }

  const handleProceedToPayment = () => {
    // setBookingType('cab', cab.id, `${cab.type} - ${cab.driver}`, cab.pricePerKm)
    router.push("/payment");
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} title="Book a Cab" />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Cab Summary */}
          {/* <BookingSummaryCard
            itemName={`${cab.type} - ${cab.driver}`}
            itemPrice={cab.pricePerKm}
            itemType="cab"
            details={{
              'Vehicle Type': cab.type,
              'Driver': cab.driver,
              'Capacity': `${cab.capacity} seats`,
              'Rate': `₹${cab.pricePerKm}/km`,
            }}
          /> */}

          {/* Booking Form */}
          {!isLoggedIn ? (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Booking Details
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Please{" "}
                  <a
                    href={`/login?redirect=/cabs/book/${cabId}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    sign in
                  </a>{" "}
                  to complete your booking.
                </p>
                <div className="opacity-50 pointer-events-none">
                  <CabBookingForm onSubmit={handleProceedToPayment} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Booking Details
              </h2>
              <CabBookingForm onSubmit={handleProceedToPayment} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

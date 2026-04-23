"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Smartphone } from "lucide-react";
import { useBooking } from "@/contexts/BookingsContext";

export function SuccessConfirmation() {
  const { currentBooking } = useBooking();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 
 bg-gradient-to-br from-secondary/10 via-background to-primary/10"
    >
      ```
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-secondary/10 shadow-lg shadow-secondary/20">
            <CheckCircle className="h-20 w-20 text-secondary" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3 tracking-tight">
          Booking Confirmed!
        </h1>

        <p className="text-center text-muted-foreground mb-10 text-sm md:text-base">
          Your {currentBooking?.tourType} has been successfully booked.
        </p>

        {/* Booking Details */}
        <Card
          className="p-6 mb-6 space-y-5 
    bg-background/80 backdrop-blur-md 
    border border-secondary/20 
    shadow-xl shadow-black/5 rounded-2xl"
        >
          {/* Booking ID */}
          <div className="bg-secondary/10 p-4 rounded-xl text-center border border-secondary/20">
            <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
            <p className="text-2xl font-mono font-bold text-primary">
              {currentBooking?.id}
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 pt-4 border-t border-muted/30">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-semibold text-foreground capitalize">
                  {currentBooking?.touristName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-semibold text-foreground">
                  ₹{currentBooking?.finalPrice}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold text-foreground capitalize">
                  {currentBooking?.paymentMethod || "Cash In Hand"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-xs text-muted-foreground border-t border-muted/30 pt-4">
            Confirmed on{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button
              className="w-full bg-secondary hover:bg-secondary/90 
        shadow-md shadow-secondary/20 rounded-xl"
            >
              Back to Home
            </Button>
          </Link>

          <Link href="/tourist/bookings" className="block">
            <Button
              variant="outline"
              className="w-full rounded-xl border-muted/40 hover:bg-muted/20"
            >
              View My Bookings
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-8 leading-relaxed">
          You will receive a confirmation email and SMS shortly. Keep your
          booking ID for reference.
        </p>
      </div>
    </div>
  );
}

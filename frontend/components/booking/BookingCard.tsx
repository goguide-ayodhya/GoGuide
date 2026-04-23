"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Star,
  Users,
  CreditCard,
  Wallet,
} from "lucide-react";
import type { Booking } from "@/contexts/BookingsContext";
import { getPaymentStatusLabel } from "@/lib/payment-status";
import { useBooking } from "@/contexts/BookingsContext";

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onLeaveReview?: (bookingId: string) => void;
  onViewReview?: (bookingId: string) => void;
}

export function BookingCard({
  booking,
  onCancel,
  onLeaveReview,
  onViewReview,
}: BookingCardProps) {
  const router = useRouter();
  const { setCurrentBooking } = useBooking();

  const needsPayment =
    booking.status === "ACCEPTED" && booking.paymentStatus !== "COMPLETED";

  const isCodBooking = booking.paymentType === "COD";

  const paid = booking.paidAmount ?? 0;
  const remaining = booking.remainingAmount ?? 0;
  const isPartialRemaining = paid > 0 && remaining > 0.01;

  const handlePaymentNavigation = () => {
    setCurrentBooking(booking);
    router.push(`/tourist/payment?bookingId=${encodeURIComponent(booking.id)}`);
  };

  const canCancel =
    booking.status === "PENDING" || booking.status === "ACCEPTED";
  const canLeaveReview =
    booking.status === "COMPLETED" &&
    booking.paymentStatus === "COMPLETED" &&
    !booking.reviewed;
  const canViewReview = booking.reviewed;

  return (
    <Card className="relative p-6 rounded-[28px] bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-xl border border-border/40 transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

      <div className="relative flex flex-col gap-5 z-10">
        {/* TOP */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {booking.touristName}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {booking.tourType === "guide"
                  ? "Tour Guide"
                  : booking.tourType === "driver"
                    ? "Cab Ride"
                    : booking.tourType}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* MAIN STATUS (BIG) */}
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${
                booking.status === "COMPLETED"
                  ? "bg-green-500/10 text-green-600 border border-green-500/30"
                  : booking.status === "PENDING"
                    ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
                    : booking.status === "REJECTED"
                      ? "bg-red-500/10 text-red-600 border border-red-500/30"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {booking.status}
            </span>

            {/* PAYMENT STATUS (SMALL + FADED) */}
            <span
              className={`text-[12px] px-2 py-1 rounded-full font-medium ${
                booking.paymentStatus === "COMPLETED"
                  ? "text-green-500/80"
                  : booking.paymentStatus === "FAILED"
                    ? "text-red-500/80"
                    : "text-secondary"
              }`}
            >
              Payment: {getPaymentStatusLabel(booking)}
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {new Date(booking.bookingDate).toLocaleDateString()} •{" "}
              {booking.startTime}
            </span>
          </div>

          {(booking.meetingPoint || booking.dropoffLocation) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {booking.meetingPoint} → {booking.dropoffLocation}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{booking.groupSize} people</span>
          </div>

          {booking.paymentMethod && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>{booking.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* NOTES */}
        {booking.notes && (
          <div className="rounded-2xl border border-border/50 bg-muted/40 backdrop-blur-md p-3 text-sm text-muted-foreground shadow-inner">
            {booking.notes}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ₹{booking.totalPrice}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {needsPayment && (
              <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-1.5">
                <Button
                  size="sm"
                  onClick={handlePaymentNavigation}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4 mr-1.5" />
                  {booking.paymentStatus === "FAILED"
                    ? "Retry Payment"
                    : isPartialRemaining
                      ? "Pay Left"
                      : "Pay Now"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-right max-w-[220px] leading-snug">
                  {isCodBooking
                    ? "Pay now online or collect cash on arrival"
                    : "Complete payment to confirm your booking"}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 transition"
                >
                  Cancel Booking
                </Button>
              )}

              {canLeaveReview && onLeaveReview && (
                <Button
                  size="sm"
                  onClick={() => onLeaveReview(booking.id)}
                  className="bg-secondary text-secondary-foreground cursor-pointer hover:scale-105 transition"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Leave Review
                </Button>
              )}

              {canViewReview && onViewReview && (
                <Button
                  size="sm"
                  onClick={() => onViewReview(booking.id)}
                  className="bg-accent text-accent-foreground cursor-pointer hover:scale-105 transition"
                >
                  <Star className="h-4 w-4 mr-1" />
                  View Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

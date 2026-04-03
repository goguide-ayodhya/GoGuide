"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { Calendar, MapPin, Star } from "lucide-react";
import type { Booking } from "@/contexts/BookingsContext";

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onReview: (bookingId: string) => void;
}

export function BookingCard({ booking, onCancel, onReview }: BookingCardProps) {
  const canReview =
    booking.paymentStatus === "COMPLETED" && booking.status === "COMPLETED";

  const canCancel = booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED" &&
    (booking.paymentStatus === "PENDING" || booking.status === "CONFIRMED");

  return (
    <Card className="p-6 border">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {booking.touristName}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {booking.tourType === "guide" ? "Tour Guide" : booking.tourType}
            {/* {booking. && " • VIP"}  */}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(booking.bookingDate).toLocaleDateString()} at{" "}
            {new Date(booking.bookingDate).toLocaleTimeString()}
          </span>
        </div>
        {booking.meetingPoint && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{booking.meetingPoint}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
          <p className="text-xl font-bold text-primary">
            ₹{booking.totalPrice}
          </p>
        </div>

        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(booking.id)}
              className="text-destructive border-destructive/50"
            >
              Cancel
            </Button>
          )}
          {canReview && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onReview(booking.id)}
              className="bg-primary hover:bg-primary/90"
            >
              <Star className="h-4 w-4 mr-1" />
              Review
            </Button>
          )}
          {/* {booking.reviews && (
            <div className="flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded text-sm">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="text-foreground font-semibold">
                {booking.reviews.rating}
              </span>
            </div>
          )} */}
        </div>
      </div>
    </Card>
  );
}

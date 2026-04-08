"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { Calendar, MapPin, Star, Users, CreditCard } from "lucide-react";
import type { Booking } from "@/contexts/BookingsContext";

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
  const canCancel = booking.status === "PENDING";
  const canLeaveReview =
    booking.status === "COMPLETED" &&
    booking.paymentStatus === "COMPLETED" &&
    !booking.reviewed;
  const canViewReview = booking.reviewed;

  return (
    <Card className="p-6 rounded-[28px] bg-card border border-border shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={booking.avatar || "/avatar-placeholder.png"}
              alt={booking.touristName}
              className="h-12 w-12 rounded-full object-cover border border-border"
            />
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
            <BookingStatusBadge status={booking.status} />
            <span
              className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                booking.paymentStatus === "COMPLETED"
                  ? "bg-secondary/10 text-secondary"
                  : booking.paymentStatus === "FAILED"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent/10 text-accent"
              }`}
            >
              {booking.paymentStatus}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(booking.bookingDate).toLocaleDateString()} • {booking.startTime}
            </span>
          </div>
          {booking.meetingPoint && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {booking.meetingPoint} → {booking.dropoffLocation}
              </span>
            </div>
          )}
          {booking.dropoffLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {booking.meetingPoint} → {booking.dropoffLocation}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{booking.groupSize} people</span>
          </div>
          {booking.paymentMethod && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{booking.paymentMethod}</span>
            </div>
          )}
        </div>

        {booking.notes && (
          <div className="rounded-2xl border border-border/80 bg-muted p-3 text-sm text-muted-foreground">
            {booking.notes}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-xl font-bold text-primary">₹{booking.totalPrice}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
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
            {canLeaveReview && onLeaveReview && (
              <Button
                size="sm"
                onClick={() => onLeaveReview(booking.id)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Star className="h-4 w-4 mr-1" />
                Leave Review
              </Button>
            )}
            {canViewReview && onViewReview && (
              <Button
                size="sm"
                onClick={() => onViewReview(booking.id)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Star className="h-4 w-4 mr-1" />
                View Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

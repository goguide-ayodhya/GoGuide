"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingCard } from "@/components/booking/BookingCard";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookmarkX, Calendar } from "lucide-react";
import Link from "next/link";
import type { BookingReview } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const { bookings, cancelBooking, setBookings } = useBooking();
  const { createReview } = useReview();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED"
  >("ALL");

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col bg-background ">
        <Header title="My Bookings" showBack={true} />
        <div className="flex items-center justify-center px-4">
          <Card className="p-8 text-center">
            <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your booking history
            </p>
            <Link href="/login" className="block">
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                Sign In
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const filteredBookings = sortedBookings.filter((b) =>
    filter === "ALL" ? true : b.status === filter,
  );

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    setCancellingId(null);
  };

  const handleReview = (bookingId: string, review: BookingReview) => {
    createReview(bookingId, review);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, reviewed: true } : b)),
    );

    setReviewingId(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title="My Bookings" showBack={true} />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Bookings Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start booking your Ayodhya tour experience today
              </p>
              <Link href="/" className="block">
                <Button className="w-full bg-secondary hover:bg-secondary/90">
                  Explore Services
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Sort Controls */}
              <div className="flex justify-end">
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-32 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  {["ALL", "PENDING", "CONFIRMED", "COMPLETED"].map((f) => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={(id) => setCancellingId(id)}
                    onReview={(id) => setReviewingId(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        open={!!cancellingId}
        onOpenChange={(open) => !open && setCancellingId(null)}
        onConfirm={() => cancellingId && handleCancel(cancellingId)}
      />

      {/* Review Modal */}
      <ReviewModal
        open={!!reviewingId}
        onOpenChange={(open) => !open && setReviewingId(null)}
        onSubmit={(review) => reviewingId && handleReview(reviewingId, review)}
      />

      <Footer />
    </main>
  );
}

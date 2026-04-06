"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";
import { useToast } from "@/hooks/use-toast";
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

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const { bookings, cancelBooking, setBookings } = useBooking();
  const { createReview, updateReview, getBookingReview } = useReview();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<"create" | "edit">("create");
  const [initialRating, setInitialRating] = useState(0);
  const [initialComment, setInitialComment] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED"
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

  const handleSubmitReview = async (
    bookingId: string,
    review: any,
    existingReviewId?: string | null,
  ) => {
    try {
      if (existingReviewId) {
        await updateReview(existingReviewId, {
          rating: review.rating,
          comments: review.comment,
        });

        toast({
          title: "Review updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        await createReview(bookingId, {
          rating: review.rating,
          comments: review.comment,
        });

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, reviewed: true }
              : booking,
          ),
        );

        toast({
          title: "Review submitted",
          description: "Thanks for sharing your experience.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Unable to submit review",
        description:
          error?.message ||
          "Something went wrong while submitting your review.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setReviewOpen(false);
      setSelectedBookingId(null);
      setReviewId(null);
      setReviewMode("create");
      setInitialRating(0);
      setInitialComment("");
    }
  };

  const handleOpenReview = async (bookingId: string) => {
    setSelectedBookingId(bookingId);

    try {
      const existingReview = await getBookingReview(bookingId);

      if (existingReview) {
        setReviewMode("edit");
        setReviewId(existingReview.id);
        setInitialRating(existingReview.rating);
        setInitialComment(existingReview.comments);
      } else {
        setReviewMode("create");
        setReviewId(null);
        setInitialRating(0);
        setInitialComment("");
      }

      setReviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Unable to load review",
        description:
          error?.message || "Could not load review details for this booking.",
        variant: "destructive",
      });
      setSelectedBookingId(null);
    }
  };

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

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header title="My Bookings" showBack={true} />

      <div className="flex-1 px-4 py-8">
        <div className="mx-auto">
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
              <div className="flex justify-between items-center gap-3">
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-32 bg-background shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2">
                  {[
                    "ALL",
                    "PENDING",
                    "ACCEPTED",
                    "COMPLETED",
                    "REJECTED",
                    "CANCELLED",
                  ].map((f) => (
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
              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 space-x-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancel}
                    onReview={() => handleOpenReview(booking.id)}
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
      {selectedBookingId && (
        <ReviewModal
          open={reviewOpen}
          bookingId={selectedBookingId}
          reviewId={reviewId}
          mode={reviewMode}
          initialRating={initialRating}
          initialComment={initialComment}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBookingId(null);
              setReviewId(null);
              setReviewMode("create");
              setInitialRating(0);
              setInitialComment("");
            }
            setReviewOpen(open);
          }}
          onSubmit={handleSubmitReview}
        />
      )}

      <Footer />
    </main>
  );
}

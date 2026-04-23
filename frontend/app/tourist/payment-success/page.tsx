"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBooking } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { PaymentReviewModal } from "@/components/booking/PaymentReviewModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin } from "lucide-react";
import HeadingTitle from "@/components/common/headingTitle";
import Link from "next/link";
import { getPaymentStatusLabel } from "@/lib/payment-status";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { currentBooking, setCurrentBooking } = useBooking();
  const { createReview } = useReview();
  const { toast } = useToast();
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!currentBooking?.id) {
      router.replace("/");
    }
  }, [currentBooking, router]);

  if (!currentBooking?.id) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header />
        <HeadingTitle title="Payment Successful" />
        <div className="flex-1 flex items-center min-h-screen justify-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={false} hideHome={true} />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            {(currentBooking.paymentStatus === "COMPLETED" ? "Payment Successful!" : "Payment Updated!")}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {currentBooking.paymentStatus === "COMPLETED"
              ? "Your booking payment is complete. Check your email for details."
              : "Your payment was recorded. Complete remaining amount before the trip."}
          </p>

          {/* Booking Summary */}
          <Card className="p-6 mb-6 space-y-4 bg-secondary/5 border-secondary/20">
            {/* Booking ID */}
            <div className="bg-background p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {currentBooking.id}
              </p>
            </div>

            {/* Status */}
            <div className="flex justify-center">
              <BookingStatusBadge status={currentBooking.status as any} />
            </div>
            {(currentBooking.remainingAmount ?? 0) > 0.01 && (
              <p className="text-center text-sm text-amber-600">
                Remaining payment pending: ₹{currentBooking.remainingAmount}
              </p>
            )}

            {/* Details */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-3">
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  Service:
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {currentBooking.touristName}
                </p>
              </div>

              {currentBooking.bookingDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-foreground">
                      {new Date(currentBooking.bookingDate).toLocaleDateString()} at{" "}
                      {currentBooking.startTime || "TBD"}
                    </p>
                  </div>
                </div>
              )}

              {currentBooking.meetingPoint && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Meeting Point
                    </p>
                    <p className="font-semibold text-foreground">
                      {currentBooking.meetingPoint}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                <p className="text-lg font-bold text-primary">
                  ₹{currentBooking.paidAmount ?? currentBooking.totalPrice}
                </p>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Payment Status:</span>
                <p className="text-sm font-semibold text-foreground">
                  {getPaymentStatusLabel(currentBooking)}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tourist/bookings" className="block">
                <Button className="w-full bg-secondary cursor-pointer hover:bg-secondary/90">
                  View My Bookings
                </Button>
              </Link>
              <Button
                onClick={() => setReviewOpen(true)}
                className="w-full border border-secondary text-black bg-transparent cursor-pointer hover:bg-secondary/5"
              >
                Create a Review
              </Button>
            </div>
            <Link href="/" className="block">
              <Button className="w-full cursor-pointer bg-secondary hover:bg-secondary/90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <PaymentReviewModal
        open={reviewOpen}
        bookingId={currentBooking.id}
        onOpenChange={setReviewOpen}
        onSubmit={async (bookingId, review) => {
          try {
            await createReview(bookingId, {
              rating: review.rating,
              comments: review.comment,
            });

            toast({
              title: "Review submitted",
              description: "Thanks for sharing your experience!",
            });
          } catch (error: any) {
            toast({
              title: "Unable to submit review",
              description:
                error?.message ||
                "Something went wrong while submitting your review.",
              variant: "destructive",
            });
            throw error;
          }
        }}
      />

      <Footer />
    </main>
  );
}

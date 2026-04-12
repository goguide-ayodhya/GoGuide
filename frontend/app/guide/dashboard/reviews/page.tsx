"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useGuide } from "@/contexts/GuideContext";
import { useReview } from "@/contexts/ReviewContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { useBooking } from "@/contexts/BookingsContext";

export default function ReviewsPage() {
  const { myGuide } = useGuide();
  const { reviews, getGuideReview } = useReview();
  const { bookings } = useBooking();

  useEffect(() => {
    if (myGuide?.id) {
      getGuideReview(myGuide.id).catch((error) => {
        console.error("Failed to load guide reviews", error);
      });
    }
  }, [myGuide?.id, getGuideReview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guide Reviews</h1>
          <p className="text-muted-foreground mt-2">
            See all reviews left by tourists for your guide profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/guide/dashboard/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} /> Back to Profile
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            {myGuide?.name
              ? `Showing reviews for ${myGuide.name}`
              : "Sign in as a guide to see your reviews."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border p-4 bg-background"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Booking ID -{review.bookingId}
                      </p>
                      <p className="text-sm font-semibold">
                        {bookings.find((b) => b.id === review.bookingId)
                          ?.touristName
                          ? `${bookings.find((b) => b.id === review.bookingId)?.touristName}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, index) => (
                        <span key={index}>
                          {index < review.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {review.comments}
                  </p>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                    <span>
                      Review Date:{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  You don’t have any reviews yet. Complete more bookings to
                  receive feedback.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

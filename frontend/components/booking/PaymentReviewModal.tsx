"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import type { BookingReview } from "@/contexts/BookingsContext";

interface PaymentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bookingId: string, review: BookingReview) => Promise<void> | void;
  bookingId: string;
}

export function PaymentReviewModal({
  open,
  onOpenChange,
  onSubmit,
  bookingId,
}: PaymentReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsLoading(true);

    const review: BookingReview = {
      rating,
      comment,
      date: new Date().toISOString(),
    };

    try {
      await onSubmit(bookingId, review);
      setRating(0);
      setComment("");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve and assists other travelers in making the right choice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              How would you rate this service?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none cursor-pointer transition-all"
                  disabled={isLoading}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground hover:text-secondary"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Your Review (Optional)
            </label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              className="min-h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

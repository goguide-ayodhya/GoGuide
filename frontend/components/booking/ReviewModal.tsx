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

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    bookingId: string,
    review: BookingReview,
    reviewId?: string | null,
  ) => Promise<void> | void;
  bookingId: string;
  reviewId?: string | null;
  initialRating?: number;
  initialComment?: string;
  mode?: "create" | "edit";
}

export function ReviewModal({
  open,
  onOpenChange,
  onSubmit,
  bookingId,
  reviewId,
  initialRating = 0,
  initialComment = "",
  mode = "create",
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(initialRating);
      setComment(initialComment);
    }
  }, [open, initialRating, initialComment]);

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
      await onSubmit(bookingId, review, reviewId);
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
          <DialogTitle>
            {mode === "edit" ? "Edit Review" : "Leave a Review"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your review for this booking."
              : "Share your experience with this guide to help other travelers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none cursor-pointer transition-all"
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
              Comment
            </label>
            <Textarea
              placeholder="Share your thoughts about this guide..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              required
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "edit" ? "Saving..." : "Submitting..."}
              </>
            ) : mode === "edit" ? (
              "Save Changes"
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

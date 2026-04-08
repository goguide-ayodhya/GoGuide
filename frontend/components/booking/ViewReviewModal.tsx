"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface ViewReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: {
    rating: number;
    comment: string;
    date?: string;
  } | null;
  guideName?: string;
}

export function ViewReviewModal({
  open,
  onOpenChange,
  review,
  guideName = "Guide",
}: ViewReviewModalProps) {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your Review</DialogTitle>
          <DialogDescription>
            Review for {guideName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${
                    star <= review.rating
                      ? "fill-secondary text-secondary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {review.rating.toFixed(1)} out of 5 stars
            </p>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Your Comment
              </label>
              <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                {review.comment}
              </p>
            </div>
          )}

          {/* Date */}
          {review.date && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Date
              </label>
              <p className="text-sm text-muted-foreground">
                {new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

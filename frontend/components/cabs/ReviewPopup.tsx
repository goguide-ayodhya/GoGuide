"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewPopupProps {
  ride: any;
  driverName?: string;
  onSubmit: (rating: number, review: string) => void;
  onSkip?: () => void;
}

export default function ReviewPopup({
  ride,
  driverName,
  onSubmit,
  onSkip,
}: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(rating, review);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Close Button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Rate Your Ride</h2>
          <p className="text-sm text-slate-600 mt-2">
            How was your experience with {driverName || "your driver"}?
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={40}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Text */}
        {rating > 0 && (
          <div className="text-center mb-6 text-sm font-medium text-slate-700">
            {rating === 1 && "Poor experience"}
            {rating === 2 && "Below average"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good experience"}
            {rating === 5 && "Excellent experience"}
          </div>
        )}

       {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>

          {onSkip && (
            <Button
              onClick={onSkip}
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-700 font-medium py-3 rounded-lg transition-colors"
            >
              Skip for Now
            </Button>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Your feedback helps us improve our service
        </div>
      </div>
    </div>
  );
}

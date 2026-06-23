"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGuideByTokenApi, submitQRReviewApi } from "@/lib/api/guide-extras";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { Star, CheckCircle, AlertCircle } from "lucide-react";

// Generate a simple device fingerprint from browser properties
function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency || "unknown",
    (navigator as any).deviceMemory || "unknown",
    navigator.maxTouchPoints || "unknown",
  ];

  // Simple hash function (not cryptographically secure, but good enough for spam prevention)
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export default function ReviewByTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    getGuideByTokenApi(token)
      .then(setGuide)
      .catch((e) => setError(e.message || "Guide not found"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await submitQRReviewApi(token, {
        rating,
        comments,
        reviewerName,
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Review Unavailable
          </h1>
          <p className="text-slate-500 text-sm">
            {error || "This review link is no longer active."}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <CheckCircle className="h-14 w-14 text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary mb-2">Thank You!</h1>
          <p className="text-slate-500">
            Your review has been submitted successfully.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            We appreciate your feedback.
          </p>
        </div>
      </div>
    );
  }

  const guideName = guide.userId?.name || "Your Guide";
  const guideAvatar = guide.userId?.avatar || assets.guideImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/50 via-secondary/10 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-orange-100/50 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/50 p-8 text-white text-center">
          <div className="relative w-20 h-20 rounded-full border-2 border-white/50 overflow-hidden mx-auto mb-4">
            <Image
              src={guideAvatar}
              alt={guideName}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-xl font-bold">{guideName}</h1>
          <p className="text-white text-sm mt-1">GoGuide · Ayodhya</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              How was your experience?
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Your honest feedback helps future travelers
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-secondary fill-secondary"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-semibold text-secondary">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
            </p>
          )}

          {/* Reviewer Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Name{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comments{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Share your experience with this guide..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all bg-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

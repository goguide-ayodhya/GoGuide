"use client";

import { useContext, createContext, useState, Children } from "react";
import {
  createReviewApi,
  getBookingReviewApi,
  getGuideReviewsApi,
  updateReviewApi,
  deleteReviewApi,
} from "@/lib/api/reviews";

export interface Review {
  id: string;
  bookingId: string;
  guideId: string;
  userId: string;
  rating: number;
  comments: string;
  createdAt: string;
}

interface ReviewData {
  rating: number;
  comments: string;
}

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;

  getGuideReview: (guideId: string) => Promise<void>;
  getBookingReview: (bookingId: string) => Promise<void>;
  createReview: (bookingId: string, data: any) => Promise<void>;
  updateReview: (reviewId: string, data: any) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: React.ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const getGuideReview = async (guideId: string) => {
    setLoading(true);
    try {
      const data = await getGuideReviewsApi(guideId);
      const formatted = data.map((review: any) => ({
        id: review._id,
        bookingId: review.bookingId,
        guideId: review.guideId,
        userId: review.userId,
        rating: review.rating,
        comments: review.comments,
        createdAt: review.createdAt,
      }));
      setReviews(formatted);
    } catch (error) {
      console.log("Get Reviews Error", error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingReview = async (bookingId: string) => {
    setLoading(true);
    try {
      const data = await getBookingReviewApi(bookingId);

      if (data) {
        setReviews([
          {
            id: data._id,
            bookingId: data.bookingId,
            guideId: data.guideId,
            userId: data.userId,
            rating: data.rating,
            comments: data.comments,
            createdAt: data.createdAt,
          },
        ]);
      }
    } catch (error) {
      console.log("Get Booking Reviews Error", error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (bookingId: string, reviewData: any) => {
    setLoading(true);
    try {
      const data = await createReviewApi(bookingId, reviewData);
      const newReview: Review = {
        id: data._id,
        bookingId: data.bookingId,
        guideId: data.guideId,
        userId: data.userId,
        rating: data.rating,
        comments: data.comments,
        createdAt: data.createdAt,
      };
      setReviews((prev) => [newReview, ...prev]);
    } catch (error) {
      console.log("Error creating reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId: string, data: ReviewData) => {
    setLoading(true);
    try {
      await updateReviewApi(reviewId, data);
      setReviews((review) =>
        review.map((r) =>
          r.id === reviewId
            ? { ...r, rating: data.rating, comments: data.comments }
            : r,
        ),
      );
    } catch (error) {
      console.log("Error update review", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setLoading(true);
    try {
      await deleteReviewApi(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.log("Error: Deleting review", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        loading,
        reviews,
        getGuideReview,
        getBookingReview,
        createReview,
        updateReview,
        deleteReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("useReview must be used within ReviewProvider");
  }
  return context;
}

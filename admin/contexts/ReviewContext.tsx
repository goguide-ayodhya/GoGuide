"use client";

import { useContext, createContext, useState, Children } from "react";
import {
  createReviewApi,
  getBookingReviewApi,
  getGuideReviewsApi,
  getDriverReviewsApi,
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

  getGuideReview: (guideId: string) => Promise<Review[]>;
  getDriverReview: (driverId: string) => Promise<Review[]>;
  getBookingReview: (bookingId: string) => Promise<Review | null>;
  createReview: (bookingId: string, data: any) => Promise<Review>;
  updateReview: (reviewId: string, data: any) => Promise<Review>;
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
      return formatted;
    } catch (error) {
      console.log("Get Reviews Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDriverReview = async (driverId: string) => {
    setLoading(true);
    try {
      const data = await getDriverReviewsApi(driverId);
      const formatted = data.map((review: any) => ({
        id: review._id,
        bookingId: review.bookingId,
        driverId: review.driverId,
        userId: review.userId,
        rating: review.rating,
        comments: review.comments,
        createdAt: review.createdAt,
      }));
      setReviews(formatted);
      return formatted;
    } catch (error) {
      console.log("Get Driver Reviews Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBookingReview = async (bookingId: string) => {
    setLoading(true);
    try {
      const data = await getBookingReviewApi(bookingId);

      if (data) {
        const formattedReview = {
          id: data._id,
          bookingId: data.bookingId,
          guideId: data.guideId,
          userId: data.userId,
          rating: data.rating,
          comments: data.comments,
          createdAt: data.createdAt,
        };
        setReviews([formattedReview]);
        return formattedReview;
      }

      setReviews([]);
      return null;
    } catch (error) {
      console.log("Get Booking Reviews Error", error);
      throw error;
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
      return newReview;
    } catch (error) {
      console.log("Error creating reviews", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId: string, data: ReviewData) => {
    setLoading(true);
    try {
      const updated = await updateReviewApi(reviewId, data);
      const updatedReview: Review = {
        id: updated._id,
        bookingId: updated.bookingId,
        guideId: updated.guideId,
        userId: updated.userId,
        rating: updated.rating,
        comments: updated.comments,
        createdAt: updated.createdAt,
      };
      setReviews((review) =>
        review.map((r) =>
          r.id === reviewId ? updatedReview : r,
        ),
      );
      return updatedReview;
    } catch (error) {
      console.log("Error update review", error);
      throw error;
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
        getDriverReview,
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

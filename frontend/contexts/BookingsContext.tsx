"use client";

import {
  cancelBookingApi,
  getMyBookings,
  getGuideBookings,
  acceptBookingApi,
  rejectBookingApi,
  completeBookingApi,
} from "@/lib/api/bookings";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";
export type BookingType = "CAB" | "PACKAGE" | "TOKEN" | "GUIDE";

export interface Booking {
  id: string;
  guideId: string;
  touristName: string;
  email: string;
  phone: string;
  groupSize: number;
  bookingDate: string;
  startTime: string;
  tourType: string;
  meetingPoint: string;
  dropoffLocation: string;
  totalPrice: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
  notes?: string;
  paymentMethod?: string;
  isVip: boolean;
  avatar: string;
  reviewed?: boolean;
}

export interface BookingReview {
  rating: number;
  comment: string;
  date: string;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  setPaymentMethod: (method: "upi" | "card") => void;
  currentBooking: Booking | null;

  setCurrentBooking: (b: Booking) => void;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  // const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("currentBooking");
    return stored ? JSON.parse(stored) : null;
  });

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data =
          user?.role === "GUIDE" || "ADMIN"
            ? await getGuideBookings()
            : await getMyBookings();

        const formattedData = data.map((b: any) => ({
          id: b._id,
          guideId: b.guideId,
          touristName: b.touristName,
          email: b.email,
          phone: b.phone,
          groupSize: b.groupSize,
          bookingDate: b.bookingDate,
          startTime: b.startTime,
          tourType: b.tourType,
          meetingPoint: b.meetingPoint,
          dropoffLocation: b.dropoffLocation,
          totalPrice: b.totalPrice,
          status: b.status,
          paymentStatus: b.paymentStatus,
          createdAt: b.createdAt,
          notes: b.notes,
        }));

        setBookings(formattedData);
      } catch (error) {
        console.log("Error fetching bookings", error);
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;
    if (!localStorage.getItem("token") || !user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [user, authLoading]);

  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    if (status === "ACCEPTED") {
      await acceptBookingApi(bookingId);
    } else if (status === "REJECTED") {
      await rejectBookingApi(bookingId);
    } else if (status === "COMPLETED") {
      await completeBookingApi(bookingId);
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
  };

  const cancelBooking = async (bookingId: string) => {
    await cancelBookingApi(bookingId);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b)),
    );
  };

  const setPaymentMethod = (method: "upi" | "card") => {
    setCurrentBooking((prev) =>
      prev
        ? {
            ...prev,
            paymentMethod: method,
          }
        : prev,
    );
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        updateBookingStatus,
        cancelBooking,
        setPaymentMethod,
        currentBooking,
        setCurrentBooking,
        setBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within BookingsProvider");
  }
  return context;
}

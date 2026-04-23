"use client";

import {
  cancelBookingApi,
  getMyBookings,
  getGuideBookings,
  getDriverBookings,
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
import { useGuide } from "@/contexts/GuideContext";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";
export type BookingType = "CAB" | "PACKAGE" | "TOKEN" | "GUIDE";

export interface Booking {
  bookingId: any;
  _id: string;
  id: string;
  guideId: string;
  driverId: string;
  touristName: string;
  email: string;
  phone: string;
  groupSize: number;
  participants?: number;
  bookingDate: string;
  date?: string;
  startTime: string;
  tourType: string;
  meetingPoint: string;
  location?: string;
  dropoffLocation: string;
  totalPrice: number;
  totalAmount?: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  paymentStatus:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "PARTIAL"
    | "REFUNDED";
  paymentType?: "FULL" | "PARTIAL" | "COD";
  paidAmount?: number;
  remainingAmount?: number;
  discount?: number;
  finalPrice?: number;
  originalPrice?: number;
  guideEarning?: number;
  adminCommission?: number;
  createdAt: string;
  notes?: string;
  paymentMethod?: string;
  avatar: string;
  reviewed?: boolean;
  hours?: number;
}

export interface BookingReview {
  rating: number;
  comment: string;
  date: string;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("currentBooking");
    return stored ? JSON.parse(stored) : null;
  });

  const { user, loading: authLoading } = useAuth();

  const refreshBookings = async () => {
      console.log("Fetching bookings for user:", user);
      console.log("User role:", user?.role);
      console.log("Auth loading:", authLoading);

      if (authLoading) {
        console.log("Auth still loading, skipping fetch");
        return;
      }

      if (!user) {
        console.log("No user, setting empty bookings");
        setBookings([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data =
          user?.role === "GUIDE"
            ? await getGuideBookings()
            : user?.role === "DRIVER"
              ? await getDriverBookings()
              : await getMyBookings();

        console.log("API response data:", data);
        const formattedData = data.map((b: any) => ({
          id: b._id,
          guideId: typeof b.guideId === "object" ? b.guideId._id : b.guideId,
          driverId:
            typeof b.driverId === "object" ? b.driverId._id : b.driverId,
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
          paymentType: b.paymentType,
          paidAmount: b.paidAmount,
          remainingAmount: b.remainingAmount,
          discount: b.discount,
          finalPrice: b.finalPrice,
          originalPrice: b.originalPrice,
          guideEarning: b.guideEarning,
          adminCommission: b.adminCommission,
          createdAt: b.createdAt,
          notes: b.notes,
          paymentMethod: b.paymentMethod,
          avatar: b.userId?.avatar || b.userId?.profileImage || "",
          reviewed: b.reviewed || false,
        }));

        console.log("Formatted bookings:", formattedData);
        setBookings(formattedData);
      } catch (error) {
        console.log("Error fetching bookings", error);
        setError(error instanceof Error ? error.message : "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const fetchBookings = async () => {
      await refreshBookings();
    };

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
    } else if (status === "CANCELLED") {
      await cancelBookingApi(bookingId, "Cancelled");
    }

    await refreshBookings();
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    return await cancelBookingApi(bookingId, reason);
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
        error,
        refreshBookings,
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

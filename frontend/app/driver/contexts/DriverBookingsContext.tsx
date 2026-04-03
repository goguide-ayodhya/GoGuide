"use client";

import {
  cancelBookingApi,
  updateBookingStatusApi,
} from "@/lib/api/bookings";
import { getDriverBookings } from "@/app/driver/lib/api/driver-bookings";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { Booking, BookingStatus } from "@/contexts/BookingsContext";
import { useDriver } from "@/app/driver/contexts/DriverContext";

interface DriverBookingContextType {
  bookings: Booking[];
  loading: boolean;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

const DriverBookingContext = createContext<
  DriverBookingContextType | undefined
>(undefined);

export function DriverBookingProvider({ children }: { children: ReactNode }) {
  const { myDriver } = useDriver();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!myDriver?.id) {
        setBookings([]);
        setLoading(false);
        return;
      }
      try {
        const data = await getDriverBookings(myDriver.id);
        const formattedData = data.map((b: any) => ({
          id: b._id,
          guideId: b.driverId ?? b.guideId,
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
        console.log("Error fetching driver rides");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [myDriver?.id]);

  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    await updateBookingStatusApi(bookingId, status);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: status.toUpperCase() as Booking["status"] }
          : b,
      ),
    );
  };

  const cancelBooking = async (bookingId: string) => {
    await cancelBookingApi(bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "CANCELLED" as Booking["status"] }
          : b,
      ),
    );
  };

  return (
    <DriverBookingContext.Provider
      value={{
        bookings,
        loading,
        updateBookingStatus,
        cancelBooking,
        setBookings,
      }}
    >
      {children}
    </DriverBookingContext.Provider>
  );
}

export function useDriverBooking() {
  const context = useContext(DriverBookingContext);
  if (context === undefined) {
    throw new Error(
      "useDriverBooking must be used within DriverBookingProvider",
    );
  }
  return context;
}

"use client";

import { useState, useEffect } from "react";
import {
  getAllBookings,
  acceptBookingApi,
  cancelBookingApi,
  seenBooking,
  completeBookingApi,
  refundBookingApi,
} from "@/lib/api/bookings";
import type { Booking as ApiBooking } from "@/contexts/BookingsContext";
import { BookingFilters } from "@/components/admin/bookings/BookingFilters";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";

interface AdminBooking {
  id: string;
  touristName: string;
  touristEmail?: string;
  touristPhone?: string;
  guideName?: string;
  guideId?: string;
  tourType?: string;
  date?: string;
  meetingPoint?: string;
  dropoffLocation?: string;
  bookingType?: string;
  price?: number;
  finalPrice?: number;
  paidAmount?: number;
  remainingAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
  isSeenByAdmin?: boolean;
  createdAt?: string;
  startTime?: string;
  groupSize?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

// Helper function to resolve the display name for guide/driver bookings
const getAssignedName = (booking: any) => {
  if (booking.guideId && typeof booking.guideId === "object") {
    return (
      booking.guideId.userId?.name ||
      booking.guideId.name ||
      "Guide not assigned"
    );
  }

  if (booking.driverId && typeof booking.driverId === "object") {
    return (
      booking.driverId.userId?.name ||
      booking.driverId.name ||
      "Driver not assigned"
    );
  }

  return booking.guideName || booking.touristName || "Not assigned";
};

// Helper function to convert API booking to UI booking format
const convertApiBookingToUi = (apiBooking: any): AdminBooking => {
  const statusMap: Record<
    string,
    "Pending" | "Confirmed" | "On the Way" | "Completed" | "Cancelled"
  > = {
    PENDING: "Pending",
    ACCEPTED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Cancelled",
  };

  const bookingType =
    apiBooking.bookingType === "GUIDE"
      ? "Guide"
      : apiBooking.bookingType === "DRIVER"
        ? "Driver"
        : apiBooking.bookingType === "TOKEN"
          ? "Token"
          : "Normal";

  const rawDate =
    apiBooking.bookingDate ?? apiBooking.date ?? apiBooking.createdAt;
  const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "";
  const priceVal =
    typeof apiBooking.totalPrice === "number"
      ? apiBooking.totalPrice
      : Number(apiBooking.totalPrice) || 0;

  return {
    id: apiBooking._id || apiBooking.id,
    touristName: apiBooking.touristName || apiBooking.touristName || "",
    touristEmail: apiBooking.email || apiBooking.touristEmail || "",
    touristPhone: apiBooking.phone || apiBooking.touristPhone || "",
    guideName: getAssignedName(apiBooking),
    guideId:
      apiBooking.guideId && typeof apiBooking.guideId === "object"
        ? apiBooking.guideId._id
        : apiBooking.guideId,
    tourType: apiBooking.tourType || "",
    date: dateStr,
    meetingPoint: apiBooking.meetingPoint || "",
    dropoffLocation: apiBooking.dropoffLocation || "",
    bookingType: apiBooking.bookingType || "",
    price: priceVal,
    finalPrice: apiBooking.finalPrice || priceVal,
    paidAmount: apiBooking.paidAmount || 0,
    remainingAmount: apiBooking.remainingAmount || priceVal,
    status: statusMap[apiBooking.status] || ("Pending" as const),
    paymentStatus: apiBooking.paymentStatus || "PENDING",
    paymentMethod: apiBooking.paymentMethod || "",
    notes: apiBooking.notes || "",
    isSeenByAdmin: !!apiBooking.isSeenByAdmin,
    createdAt: apiBooking.createdAt,
    startTime: apiBooking.startTime || "",
    groupSize: apiBooking.groupSize || 1,
    cancellationReason: apiBooking.cancellationReason || "",
    cancelledBy: apiBooking.cancelledBy || "",
    cancelledAt: apiBooking.cancelledAt,
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch bookings on component mount and when filters change
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = {
          status: filterStatus,
          paymentStatus: filterPayment,
          dateRange: filterDate,
          search: searchQuery.trim() || undefined,
        };
        const raw = await getAllBookings(filters);
        const list = Array.isArray(raw)
          ? raw
          : (raw && (raw.data || raw.items)) || [];

        // Convert API bookings to UI format (defensive)
        const uiBookings = list.map((booking: ApiBooking | any) =>
          convertApiBookingToUi(booking),
        );
        setBookings(uiBookings);
      } catch (err: any) {
        console.error("Failed to fetch bookings:", err);
        setError(err?.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filterStatus, filterPayment, filterDate, searchQuery]);

  const handleApprove = async (booking: AdminBooking) => {
    try {
      await acceptBookingApi(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "Confirmed" } : b,
        ),
      );
    } catch (err: any) {
      console.error("Failed to approve booking:", err);
      setError(err.message || "Failed to approve booking");
    }
  };

  const handleMarkSeen = async (booking: AdminBooking) => {
    try {
      await seenBooking(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, isSeenByAdmin: true } : b,
        ),
      );
    } catch (err: any) {
      console.error("Failed to mark booking seen:", err);
      setError(err.message || "Failed to mark booking as seen");
    }
  };

  const handleCancel = async (booking: AdminBooking) => {
    try {
      await cancelBookingApi(
        booking.id,
        booking.status === "Pending" ? "PENDING" : "CANCELLED",
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "Cancelled" } : b,
        ),
      );
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
      setError(err.message || "Failed to cancel booking");
    }
  };

  const handleComplete = async (booking: AdminBooking) => {
    try {
      await completeBookingApi(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "Completed" } : b,
        ),
      );
    } catch (err: any) {
      console.error("Failed to complete booking:", err);
      setError(err.message || "Failed to complete booking");
    }
  };

  const handleRefund = async (booking: AdminBooking) => {
    try {
      await refundBookingApi(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, paymentStatus: "REFUNDED" } : b,
        ),
      );
    } catch (err: any) {
      console.error("Failed to refund booking:", err);
      setError(err.message || "Failed to refund booking");
    }
  };

  const viewDetails = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Booking Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          View and manage all tour bookings.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Filters */}
          <BookingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterPayment={filterPayment}
            onPaymentChange={setFilterPayment}
            filterDate={filterDate}
            onDateChange={setFilterDate}
          />

          {/* Bookings Table */}
          <BookingTable
            bookings={bookings}
            onViewDetails={viewDetails}
            onApprove={handleApprove}
            onMarkSeen={handleMarkSeen}
            onCancel={handleCancel}
            onComplete={handleComplete}
            onRefund={handleRefund}
          />

          {/* Details Modal */}
          <BookingDetailsModal
            booking={selectedBooking}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
}
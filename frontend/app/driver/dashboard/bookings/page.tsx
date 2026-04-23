"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingDetailsModal } from "@/components/booking-details-modal";
import {
  acceptBookingApi,
  completeBookingApi,
  rejectBookingApi,
} from "@/lib/api/bookings";
import { BookingStatus, useBooking } from "@/contexts/BookingsContext";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Booking } from "@/contexts/BookingsContext";
import {
  completeCodPaymentApi,
  retryPaymentApi,
  getBookingPaymentsApi,
} from "@/lib/api/payments";
import { getPaymentStatusLabel } from "@/lib/payment-status";

const ITEMS_PER_PAGE = 10;

type PaymentStatus =
  | "ALL"
  | "PENDING"
  | "PARTIAL"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | BookingStatus>(
    "ALL",
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { bookings, setBookings, loading, error, refreshBookings } =
    useBooking();

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    try {
      if (newStatus === "ACCEPTED") {
        await acceptBookingApi(bookingId);
      } else if (newStatus === "REJECTED") {
        await rejectBookingApi(bookingId);
      } else if (newStatus === "COMPLETED") {
        await completeBookingApi(bookingId);
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );
      await refreshBookings();
    } catch (error) {
      console.error("Failed to update booking status", error);
    }
  };

  const handleCashCollected = async (bookingId: string) => {
    const data = await completeCodPaymentApi(bookingId);
    const patch = {
      paymentStatus: data.paymentStatus as Booking["paymentStatus"],
      paidAmount: data.paidAmount,
      remainingAmount: data.remainingAmount,
      paymentType: data.paymentType as Booking["paymentType"],
      discount: data.discount,
      finalPrice: data.finalPrice,
      originalPrice: data.originalPrice,
    };
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)),
    );
    setSelectedBooking((prev) =>
      prev?.id === bookingId ? { ...prev, ...patch } : prev,
    );
    await refreshBookings();
  };

  const handleRetryPayment = async (bookingId: string) => {
    // Get the booking's current payment info
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Get payments for this booking
    const payments = await getBookingPaymentsApi(bookingId);
    if (!Array.isArray(payments) || payments.length === 0) {
      throw new Error("No payments found for this booking");
    }

    // Find the failed payment
    const failedPayment = payments.find((p: any) => p.status === "FAILED");
    if (!failedPayment) {
      throw new Error("No failed payment found");
    }

    // Retry the payment
    await retryPaymentApi(failedPayment._id || failedPayment.id);

    // Refresh bookings to get updated status
    await refreshBookings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading bookings...
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => refreshBookings()}>
          Retry
        </Button>
      </div>
    );
  }

  // Filter bookings
  const filtered = bookings.filter((booking) => {
    const matchesSearch =
      booking.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" || booking.status === selectedStatus;

    // Payment status filtering
    let matchesPaymentStatus = selectedPaymentStatus === "ALL";
    if (!matchesPaymentStatus) {
      if (selectedPaymentStatus === "PENDING") {
        matchesPaymentStatus =
          booking.paymentStatus === "PENDING" ||
          (booking.paymentType === "COD" &&
            booking.paymentStatus !== "COMPLETED");
      } else if (selectedPaymentStatus === "PARTIAL") {
        matchesPaymentStatus = booking.paymentStatus === "PARTIAL";
      } else if (selectedPaymentStatus === "COMPLETED") {
        matchesPaymentStatus = booking.paymentStatus === "COMPLETED";
      } else if (selectedPaymentStatus === "FAILED") {
        matchesPaymentStatus = booking.paymentStatus === "FAILED";
      } else if (selectedPaymentStatus === "REFUNDED") {
        matchesPaymentStatus = booking.paymentStatus === "REFUNDED";
      }
    }

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const statusOptions: Array<BookingStatus> = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your tour bookings
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                placeholder="Search by tourist name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-muted border-border"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? "bg-primary cursor-pointer text-primary-foreground"
                        : "bg-muted border-border cursor-pointer text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Payment Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "ALL",
                    "PENDING",
                    "PARTIAL",
                    "COMPLETED",
                    "FAILED",
                    "REFUNDED",
                  ] as PaymentStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedPaymentStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPaymentStatus === status
                        ? "bg-secondary cursor-pointer text-secondary-foreground"
                        : "bg-muted border-border cursor-pointer text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-card border border-border overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Booking List</CardTitle>
            <CardDescription>{filtered.length} bookings found</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-sm">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Tourist Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Tour Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Group Size
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Payment Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Payment Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.touristName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {booking.tourType}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {booking.groupSize} people
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        ₹{booking.totalPrice}
                      </td>
                      <td className="py-3 px-4">
                        <BookingStatusBadge
                          status={
                            booking.status as
                              | "PENDING"
                              | "ACCEPTED"
                              | "REJECTED"
                              | "COMPLETED"
                              | "CANCELLED"
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getPaymentStatusLabel(booking) === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : getPaymentStatusLabel(booking) ===
                                  "PENDING (COD)"
                                ? "bg-amber-100 text-amber-900"
                                : getPaymentStatusLabel(booking) === "PARTIAL"
                                  ? "bg-sky-100 text-sky-900"
                                  : getPaymentStatusLabel(booking) === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getPaymentStatusLabel(booking)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs font-medium">
                        {booking.paymentType ?? "—"}
                      </td>
                      <td className="py-3 px-4 space-y-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-primary cursor-pointer hover:text-blue-600 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        {booking.status === "PENDING" && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 cursor-pointer"
                              onClick={() =>
                                handleStatusChange(booking.id, "ACCEPTED")
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(booking.id, "REJECTED")
                              }
                              className="cursor-pointer"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        {booking.status === "ACCEPTED" && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(booking.id, "COMPLETED")
                              }
                              className="cursor-pointer"
                            >
                              Complete
                            </Button>
                            {booking.paymentType === "COD" &&
                              booking.status === "ACCEPTED" &&
                              booking.paymentStatus !== "COMPLETED" && (
                                <Button
                                  size="sm"
                                  className="bg-amber-600 hover:bg-amber-700 cursor-pointer"
                                  onClick={() =>
                                    handleCashCollected(booking.id)
                                  }
                                >
                                  Mark as Cash Collected
                                </Button>
                              )}
                            {booking.paymentStatus === "FAILED" &&
                              booking.paymentType !== "COD" && (
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                  onClick={() => handleRetryPayment(booking.id)}
                                >
                                  Retry Payment
                                </Button>
                              )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {startIdx + 1} to{" "}
                {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
          onCashCollected={handleCashCollected}
          onRetryPayment={handleRetryPayment}
        />
      )}
    </div>
  );
}

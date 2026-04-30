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
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingDetailsModal } from "@/components/booking-details-modal";
import { BookingStatus, useBooking } from "@/contexts/BookingsContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  IndianRupee,
  MoreHorizontal,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/contexts/BookingsContext";
import {
  completeCodPaymentApi,
  retryPaymentApi,
  getBookingPaymentsApi,
} from "@/lib/api/payments";
import { getPaymentStatusLabel } from "@/lib/payment-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CancellationReasonModal } from "@/components/booking/CancellationReasonModal";
import { useBooking as useBookingContext } from "@/contexts/BookingsContext";

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | BookingStatus>(
    "ALL",
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const {
    bookings,
    updateBookingStatus,
    setBookings,
    loading,
    error,
    refreshBookings,
    cancelBooking,
  } = useBooking();
  const { toast } = useToast();
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setStatusLoadingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus as BookingStatus);
      toast({
        title: "Booking updated",
        description: `Booking marked ${newStatus.toLowerCase()}.`,
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update booking status.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      console.error("Booking status update failed", error);
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleCashCollected = async (bookingId: string) => {
    setStatusLoadingId(bookingId);
    try {
      const data = await completeCodPaymentApi(bookingId);
      const patch = {
        status: data.status,
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
      toast({
        title: "Cash collected",
        description: "COD payment has been marked as collected.",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update COD payment status.";
      toast({
        title: "Action failed",
        description: message,
        variant: "destructive",
      });
      console.error("COD cash collection failed", error);
    } finally {
      setStatusLoadingId(null);
      await refreshBookings();
    }
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

  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancelId(bookingId);
    setIsCancellationModalOpen(true);
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!bookingToCancelId) return;
    
    setIsCancelLoading(true);
    try {
      await cancelBooking(bookingToCancelId, reason);
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancelId
            ? { 
                ...b, 
                status: "CANCELLED" as BookingStatus,
                cancellationReason: reason,
                paymentStatus: "REJECTED" as Booking["paymentStatus"],
              }
            : b
        ),
      );
      
      setSelectedBooking((prev) =>
        prev?.id === bookingToCancelId
          ? {
              ...prev,
              status: "CANCELLED" as BookingStatus,
              cancellationReason: reason,
              paymentStatus: "REJECTED" as Booking["paymentStatus"],
            }
          : prev,
      );

      toast({
        title: "Booking cancelled",
        description: "The booking has been cancelled successfully.",
        variant: "success",
      });

      await refreshBookings();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to cancel booking.";
      toast({
        title: "Cancellation failed",
        description: message,
        variant: "destructive",
      });
      console.error("Booking cancellation failed", error);
    } finally {
      setIsCancelLoading(false);
      setBookingToCancelId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">
                  Unable to load bookings
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={() => refreshBookings()} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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

  // Sort bookings: Pending first (by date), then others by status priority and date
  const statusPriority = {
    PENDING: 1,
    ACCEPTED: 2,
    REJECTED: 3,
    CANCELLED: 4,
    COMPLETED: 5,
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aPriority =
      statusPriority[a.status as keyof typeof statusPriority] || 99;
    const bPriority =
      statusPriority[b.status as keyof typeof statusPriority] || 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (
      new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
    );
  });

  // Pagination
  const totalPages = Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = sortedFiltered.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  const statusOptions: Array<BookingStatus> = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by tourist name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 h-11 rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Booking Status */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Booking Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <Button
                key={status}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`rounded-full capitalize transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-secondary"
                }`}
              >
                {status.toLowerCase()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Payment Status */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Payment Status
        </h4>
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
          ).map((status) => {
            const isActive = selectedPaymentStatus === status;
            return (
              <Button
                key={status}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPaymentStatus(status);
                  setCurrentPage(1);
                }}
                className={`rounded-full capitalize transition-all ${
                  isActive
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                    : "hover:bg-secondary"
                }`}
              >
                {status.toLowerCase()}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Tour Bookings
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage and track all your tour reservations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshBookings()}
                className="rounded-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Filter Bookings</SheetTitle>
                    <SheetDescription>
                      Refine your booking list with advanced filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {bookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {bookings.filter((b) => b.status === "PENDING").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {bookings.filter((b) => b.status === "COMPLETED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <IndianRupee className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Revenue
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ₹
                    {bookings
                      .filter((b) => b.status === "COMPLETED")
                      .reduce((sum, b) => sum + (b.paidAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Desktop */}
        <Card className="hidden lg:block mb-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardContent className="p-6">
            <FilterContent />
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-background to-secondary/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Recent Bookings</CardTitle>
                <CardDescription>
                  {sortedFiltered.length} booking
                  {sortedFiltered.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Tourist
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Tour Details
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        St. Time
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Group
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Payment
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.length > 0 ? (
                      paginatedBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className={`border-t border-border/50 hover:bg-secondary/20 transition-colors ${booking.status === "PENDING" ? "bg-primary/10" : ""}`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold">
                                {booking.touristName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground">
                                    {booking.touristName}
                                  </p>
                                  {booking.status === "PENDING" && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-1.5 py-0.5"
                                    >
                                      NEW
                                    </Badge>
                                  )}
                                  {booking.status === "ACCEPTED" && (
                                    <Badge className="text-[10px] px-2 py-0.5 bg-green-500/90 text-white rounded-full">
                                      ACTIVE
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {booking.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-foreground">
                              {booking.tourType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.meetingPoint}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {new Date(
                                  booking.bookingDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {new Date(
                                  booking.startTime,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {booking.groupSize}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-foreground">
                                {booking.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <BookingStatusBadge
                              status={booking.status as any}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant={
                                getPaymentStatusLabel(booking) === "COMPLETED"
                                  ? "default"
                                  : getPaymentStatusLabel(booking) ===
                                      "PENDING (COD)"
                                    ? "secondary"
                                    : getPaymentStatusLabel(booking) ===
                                        "PARTIAL"
                                      ? "outline"
                                      : "destructive"
                              }
                              className="rounded-full"
                            >
                              {getPaymentStatusLabel(booking)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(booking)}
                                className="rounded-full"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  {booking.status === "PENDING" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(
                                            booking.id,
                                            "ACCEPTED",
                                          )
                                        }
                                        className="text-green-600"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept Booking
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(
                                            booking.id,
                                            "REJECTED",
                                          )
                                        }
                                        className="text-red-600"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Decline Booking
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {booking.status === "ACCEPTED" && (
                                    <>
                                      {!(booking.paymentMethod === "COD") && (
                                        <DropdownMenuItem
                                          disabled={
                                            statusLoadingId === booking.id
                                          }
                                          onClick={() =>
                                            handleStatusChange(
                                              booking.id,
                                              "COMPLETED",
                                            )
                                          }
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Mark Completed
                                        </DropdownMenuItem>
                                      )}
                                      {booking.paymentMethod === "COD" &&
                                        booking.paymentStatus !==
                                          "COMPLETED" && (
                                          <DropdownMenuItem
                                            disabled={
                                              statusLoadingId === booking.id
                                            }
                                            onClick={() =>
                                              handleCashCollected(booking.id)
                                            }
                                            className="text-amber-600"
                                          >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Cash Collected
                                          </DropdownMenuItem>
                                        )}
                                      {booking.paymentStatus === "FAILED" &&
                                        booking.paymentType !== "COD" && (
                                          <DropdownMenuItem
                                            disabled={
                                              statusLoadingId === booking.id
                                            }
                                            onClick={() =>
                                              handleRetryPayment(booking.id)
                                            }
                                            className="text-blue-600"
                                          >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Retry Payment
                                          </DropdownMenuItem>
                                        )}
                                    </>
                                  )}
                                  {(booking.status === "PENDING" ||
                                    booking.status === "ACCEPTED") && (
                                    <>
                                      <div className="border-t border-slate-200 my-1" />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleCancelBooking(booking.id)
                                        }
                                        className="text-red-600"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Booking
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                No bookings found
                              </h3>
                              <p className="text-muted-foreground">
                                Try adjusting your filters
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {paginatedBookings.length > 0 ? (
                <div className="divide-y divide-border">
                  {paginatedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-4 hover:bg-secondary/20 transition-colors ${booking.status === "PENDING" ? "bg-primary/20  border-l-4 border-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold">
                            {booking.touristName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">
                                {booking.touristName}
                              </h4>
                              {booking.status === "PENDING" && (
                                <Badge className="text-[10px] px-2 py-0.5 bg-primary text-white rounded-full animate-pulse">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.email}
                            </p>
                          </div>
                        </div>
                        <BookingStatusBadge status={booking.status as any} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tour Type</p>
                          <p className="font-medium text-foreground">
                            {booking.tourType}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Group Size</p>
                          <p className="font-medium text-foreground">
                            {booking.groupSize} people
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium text-foreground">
                            ₹{booking.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            getPaymentStatusLabel(booking) === "COMPLETED"
                              ? "default"
                              : getPaymentStatusLabel(booking) ===
                                  "PENDING (COD)"
                                ? "secondary"
                                : getPaymentStatusLabel(booking) === "PARTIAL"
                                  ? "outline"
                                  : "destructive"
                          }
                          className="rounded-full"
                        >
                          {getPaymentStatusLabel(booking)}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(booking)}
                            className="rounded-full"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {booking.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(booking.id, "ACCEPTED")
                                    }
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept Booking
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(booking.id, "REJECTED")
                                    }
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline Booking
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === "ACCEPTED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "COMPLETED",
                                      )
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  {booking.paymentMethod === "COD" &&
                                    booking.paymentStatus !== "COMPLETED" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleCashCollected(booking.id)
                                        }
                                        className="text-amber-600"
                                      >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Cash Collected
                                      </DropdownMenuItem>
                                    )}
                                  {booking.paymentStatus === "FAILED" &&
                                    booking.paymentType !== "COD" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRetryPayment(booking.id)
                                        }
                                        className="text-blue-600"
                                      >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retry Payment
                                      </DropdownMenuItem>
                                    )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Smartphone className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        No bookings found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-border bg-secondary/10">
                <p className="text-sm text-muted-foreground">
                  Showing {startIdx + 1} to{" "}
                  {Math.min(startIdx + ITEMS_PER_PAGE, sortedFiltered.length)}{" "}
                  of {sortedFiltered.length} bookings
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 rounded-full"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
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

        {/* Cancellation Reason Modal */}
        <CancellationReasonModal
          isOpen={isCancellationModalOpen}
          onClose={() => {
            setIsCancellationModalOpen(false);
            setBookingToCancelId(null);
          }}
          onConfirm={handleConfirmCancellation}
          isLoading={isCancelLoading}
          userRole="GUIDE"
        />
      </div>
    </div>
  );
}

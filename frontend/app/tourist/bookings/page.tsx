"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BookingCard } from "@/components/booking/BookingCard";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { ViewReviewModal } from "@/components/booking/ViewReviewModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  User,
  Filter,
  RefreshCw,
  Car,
  Heart,
  MapPin,
  Users,
  Eye,
  Clock,
  CreditCard,
  AlertTriangle,
  Info,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getMyCabBookingsApi,
  updateCabBookingStatusApi,
  rescheduleCabBookingApi,
} from "@/lib/api/cabBookings";
import Link from "next/link";
import HeadingTitle from "@/components/common/headingTitle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cancelBookingApi } from "@/lib/api/bookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Utility to parse Date & Time to local JS Date
const parseDateTime = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let hours = 0;
  let minutes = 0;

  const cleanTime = timeStr.trim().toLowerCase();
  const ampmMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm === "pm" && hours < 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
  } else {
    const normalMatch = cleanTime.match(/^(\d+):(\d+)$/);
    if (normalMatch) {
      hours = parseInt(normalMatch[1], 10);
      minutes = parseInt(normalMatch[2], 10);
    }
  }

  return new Date(year, month, day, hours, minutes);
};

// Check if booking is within 1 hour cancellation/rescheduling limit
const isWithinOneHourLimit = (startDate: string | Date, timeStr: string) => {
  try {
    const bookingDateTime = parseDateTime(new Date(startDate).toISOString(), timeStr || "12:00 PM");
    const now = new Date();
    return bookingDateTime.getTime() - now.getTime() < 60 * 60 * 1000;
  } catch (e) {
    return false;
  }
};

function CabBookingCard({
  booking,
  onCancel,
  onReschedule,
  onViewDetails,
}: {
  booking: any;
  onCancel: (id: string) => void;
  onReschedule: (booking: any) => void;
  onViewDetails: (booking: any) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getSpecialAssistanceText = (assist: any) => {
    const list = [];
    if (assist?.wheelchair) list.push("Wheelchair");
    if (assist?.medicalSupport) list.push("Medical Support");
    if (assist?.elderlyCare) list.push("Elderly Care");
    if (assist?.childCare) list.push("Child Care");
    return list.join(", ");
  };

  // Determine if booking is within the 1-hour window limit
  const isRestricted = isWithinOneHourLimit(booking.startDate, booking.pickupTime);

  const handleCancelClick = () => {
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") return;
    if (isRestricted) {
      alert("Cab bookings cannot be cancelled or rescheduled within 1 hour of pickup time.");
      return;
    }
    onCancel(booking._id);
  };

  const handleRescheduleClick = () => {
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") return;
    if (isRestricted) {
      alert("Cab bookings cannot be cancelled or rescheduled within 1 hour of pickup time.");
      return;
    }
    onReschedule(booking);
  };

  return (
    <Card className="overflow-hidden border border-slate-200 rounded-3xl bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{booking.vehicleType}</h4>
          </div>
        </div>
        <Badge className={getStatusColor(booking.status)} variant="outline">
          {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex justify-between text-xs font-semibold text-indigo-600">
          <span>Booking ID:</span>
          <span>{booking.bookingId || booking._id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {new Date(booking.startDate).toLocaleDateString()} at {booking.pickupTime || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {booking.numPeople} people
          </span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="truncate">
            {booking.pickupLocation} → {booking.dropoffLocation}
          </span>
        </div>
        {getSpecialAssistanceText(booking.specialAssistance) ? (
          <div className="flex items-center gap-2 text-rose-600 font-medium text-xs">
            <Heart className="w-4 h-4 shrink-0 fill-rose-500 text-rose-500" />
            <span>Assistance: {getSpecialAssistanceText(booking.specialAssistance)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2 text-base">
          <span>Amount:</span>
          <span>₹{booking.totalAmount || booking.price || 0}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <Button
          onClick={() => onViewDetails(booking)}
          variant="outline"
          className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded-2xl h-10 font-semibold flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> View Details
        </Button>

        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <div className="flex gap-2">
            <Button
              onClick={handleRescheduleClick}
              variant="outline"
              className={`flex-1 rounded-2xl h-10 font-semibold transition ${
                isRestricted
                  ? "border-slate-200 text-slate-400 bg-slate-50 cursor-pointer"
                  : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              Reschedule
            </Button>
            <Button
              onClick={handleCancelClick}
              variant="outline"
              className={`flex-1 rounded-2xl h-10 font-semibold transition ${
                isRestricted
                  ? "border-slate-200 text-slate-400 bg-slate-50 cursor-pointer"
                  : "border-rose-200 text-rose-600 hover:bg-rose-50"
              }`}
            >
              Cancel Request
            </Button>
          </div>
        )}

        {isRestricted && (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <p className="text-[10px] text-rose-500 text-center font-medium">
            * Cancellation/Rescheduling restricted (within 1 hour)
          </p>
        )}
      </div>
    </Card>
  );
}

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const { bookings, cancelBooking, setBookings, refreshBookings } = useBooking();
  const [cabBookings, setCabBookings] = useState<any[]>([]);
  const [loadingCabs, setLoadingCabs] = useState(true);

  // Modals / Popups for Cab Bookings
  const [selectedCab, setSelectedCab] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // Reschedule Date & Time state
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  const fetchCabBookings = async () => {
    try {
      setLoadingCabs(true);
      const data = await getMyCabBookingsApi();
      setCabBookings(Array.isArray(data) ? data : data?.bookings || data?.data || []);
    } catch (err) {
      console.error("Failed to load cab bookings", err);
    } finally {
      setLoadingCabs(false);
    }
  };

  const handleCancelCabRequest = async (bookingId: string) => {
    try {
      await updateCabBookingStatusApi(bookingId, "CANCELLED");
      setCabBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
      toast({
        title: "Cab request cancelled",
        description: "Your cab booking request has been successfully cancelled.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to cancel",
        description: err.message || "Failed to cancel request.",
        variant: "destructive",
      });
    }
  };

  const openRescheduleModal = (booking: any) => {
    setSelectedCab(booking);
    setRescheduleDate(new Date(booking.startDate).toISOString().split("T")[0]);
    setRescheduleTime(booking.pickupTime || "");
    setRescheduleError(null);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedCab || !rescheduleDate || !rescheduleTime) return;
    setRescheduleError(null);

    // Dynamic advance time validation on frontend
    try {
      const parsedTime = parseDateTime(rescheduleDate, rescheduleTime);
      const now = new Date();
      if (parsedTime.getTime() - now.getTime() < 60 * 60 * 1000) {
        setRescheduleError("Rescheduled pickup time must be at least 1 hour in advance.");
        return;
      }
    } catch (e) {
      setRescheduleError("Invalid date or time.");
      return;
    }

    setRescheduleSubmitting(true);
    try {
      await rescheduleCabBookingApi(selectedCab._id, rescheduleDate, rescheduleTime);
      setRescheduleModalOpen(false);
      await fetchCabBookings();
      toast({
        title: "Rescheduled successfully",
        description: "Your pickup time has been updated successfully.",
      });
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule booking.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const openDetailsModal = (booking: any) => {
    setSelectedCab(booking);
    setDetailsModalOpen(true);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const hrStr = String(displayHour).padStart(2, "0");
      slots.push(`${hrStr}:00 ${ampm}`);
      slots.push(`${hrStr}:30 ${ampm}`);
    }
    return slots;
  };

  const isRescheduleSlotDisabled = (slot: string) => {
    if (!rescheduleDate) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    if (rescheduleDate !== todayStr) return false;

    try {
      const parsedDateTime = parseDateTime(rescheduleDate, slot);
      const now = new Date();
      return parsedDateTime.getTime() - now.getTime() < 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCabBookings();
    }
  }, [isLoggedIn]);

  const { createReview, getBookingReview } = useReview();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "month" | "year" | "specific">("all");
  const [specificDate, setSpecificDate] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewReviewOpen, setViewReviewOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<
    string | null
  >(null);
  const [viewingReview, setViewingReview] = useState<{
    rating: number;
    comment: string;
    date?: string;
  } | null>(null);
  const statusOptions = [
    "ALL",
    "PENDING",
    "ACCEPTED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ] as const;
  const reviewOptions = ["REVIEWED", "UNREVIEWED"] as const;
  const paymentStatusOptions = [
    "ALL",
    "PENDING",
    "PARTIAL",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
    "REJECTED",
  ] as const;
  const [selectedStatuses, setSelectedStatuses] = useState<
    (typeof statusOptions)[number][]
  >([...statusOptions]);
  const [selectedReviewStatuses, setSelectedReviewStatuses] = useState<
    (typeof reviewOptions)[number][]
  >(["REVIEWED", "UNREVIEWED"]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<
    (typeof paymentStatusOptions)[number][]
  >([...paymentStatusOptions]);

  const toggleStatus = (status: (typeof statusOptions)[number]) => {
    setSelectedStatuses([status]);
  };

  const toggleReviewStatus = (reviewStatus: (typeof reviewOptions)[number]) => {
    setSelectedReviewStatuses((prev) =>
      prev.includes(reviewStatus)
        ? prev.filter((item) => item !== reviewStatus)
        : [...prev, reviewStatus]
    );
  };

  const togglePaymentStatus = (
    paymentStatus: (typeof paymentStatusOptions)[number]
  ) => {
    setSelectedPaymentStatuses([paymentStatus]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses(["ALL"]);
    setSelectedReviewStatuses([...reviewOptions]);
    setSelectedPaymentStatuses([...paymentStatusOptions]);
    setSortBy("newest");
    setDateFilter("all");
    setSpecificDate("");
  };

  const refreshBookingList = async () => {
    setIsRefreshing(true);
    try {
      await refreshBookings();
      await fetchCabBookings();
      toast({
        title: "Bookings refreshed",
        description: "Your booking list is now up to date.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to refresh",
        description: error?.message || "Could not refresh your bookings.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <Header showBack={true} />
        <HeadingTitle title={"My Bookings"} />

        <div className="flex items-center justify-center pt-8 px-4">
          <Card className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your booking history
            </p>
            <Link href={`/login?redirect=/tourist/bookings`}>
              <Button className="w-full bg-secondary cursor-pointer hover:bg-secondary/90">
                Sign In
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const filteredBookings = sortedBookings.filter((b) => {
    const statusMatch =
      selectedStatuses.includes("ALL") || selectedStatuses.includes(b.status as any);
    const reviewMatch = selectedReviewStatuses.some((option) =>
      option === "REVIEWED"
        ? b.reviewed === true
        : b.reviewed === false || b.reviewed === undefined
    );
    const paymentStatusLabel = b.paymentStatus || "PENDING";
    const paymentMatch =
      selectedPaymentStatuses.includes("ALL") ||
      selectedPaymentStatuses.includes(
        paymentStatusLabel as (typeof paymentStatusOptions)[number]
      );
    const searchMatch = searchTerm
      ? [b.touristName, b.tourType, b.bookingId]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    // Date Filter match
    let dateMatch = true;
    if (dateFilter !== "all" && b.bookingDate) {
      const travelDate = new Date(b.bookingDate);
      const travelDateStr = travelDate.toISOString().split("T")[0];

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (dateFilter === "today") {
        dateMatch = travelDateStr === todayStr;
      } else if (dateFilter === "yesterday") {
        dateMatch = travelDateStr === yesterdayStr;
      } else if (dateFilter === "month") {
        dateMatch = travelDate.getMonth() === today.getMonth() && travelDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "year") {
        dateMatch = travelDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "specific" && specificDate) {
        dateMatch = travelDateStr === specificDate;
      }
    }

    return statusMatch && reviewMatch && paymentMatch && searchMatch && dateMatch;
  });

  const filteredCabBookings = cabBookings.filter((b) => {
    const searchMatch = searchTerm
      ? [b.fullName, b.pickupLocation, b.dropoffLocation, b.bookingId || b._id]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;
    if (!searchMatch) return false;

    const statusMatch =
      selectedStatuses.includes("ALL") || selectedStatuses.includes(b.status as any);
    if (!statusMatch) return false;

    const paymentStatusLabel = b.paymentStatus || "PENDING";
    const paymentMatch =
      selectedPaymentStatuses.includes("ALL") ||
      selectedPaymentStatuses.includes(
        paymentStatusLabel as (typeof paymentStatusOptions)[number]
      );
    if (!paymentMatch) return false;

    let dateMatch = true;
    if (dateFilter !== "all" && b.startDate) {
      const travelDate = new Date(b.startDate);
      const travelDateStr = travelDate.toISOString().split("T")[0];

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (dateFilter === "today") {
        dateMatch = travelDateStr === todayStr;
      } else if (dateFilter === "yesterday") {
        dateMatch = travelDateStr === yesterdayStr;
      } else if (dateFilter === "month") {
        dateMatch = travelDate.getMonth() === today.getMonth() && travelDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "year") {
        dateMatch = travelDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "specific" && specificDate) {
        dateMatch = travelDateStr === specificDate;
      }
    }

    return dateMatch;
  });

  const packagesCount = filteredBookings.filter((b) => b.bookingType === "PACKAGE").length;
  const guidesCount = filteredBookings.filter((b) => b.bookingType === "GUIDE").length;
  const cabsCount = filteredCabBookings.length;
  const totalDisplayBookingsCount = packagesCount + guidesCount + cabsCount;

  const handleViewReview = async (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    try {
      const review = await getBookingReview(bookingId);
      if (review) {
        setViewingReview({
          rating: review.rating,
          comment: review.comments,
          date: review.createdAt,
        });
        setViewReviewOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "Unable to load review",
        description: error?.message || "Could not load your review for this booking.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveReview = (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (
    bookingId: string,
    review: any,
    reviewId?: string | null
  ) => {
    try {
      await createReview(bookingId, {
        rating: review.rating,
        comments: review.comment,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, reviewed: true } : booking
        )
      );

      toast({
        title: "Review submitted",
        description: "Thanks for sharing your experience.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to submit review",
        description: error?.message || "Could not submit your review.",
        variant: "destructive",
      });
    } finally {
      setReviewModalOpen(false);
      setSelectedBookingForReview(null);
    }
  };

  async function handleCancel(cancellingId: string, reason: string): Promise<void> {
    const booking = bookings.find((b) => b.id === cancellingId);
    if (!booking) return;

    try {
      const res = await cancelBookingApi(cancellingId, reason);

      setCancellingId(null);
      await refreshBookings();

      toast({
        title: "Booking cancelled",
        description:
          res?.refundAmount > 0 ? `₹${res.refundAmount} refund initiated` : "Booking cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Unable to cancel booking",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header showBack={true} />

      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="mx-auto flex items-center justify-center">
          {bookings.length === 0 && cabBookings.length === 0 ? (
            <Card className="p-6 sm:p-8 md:p-10 text-center max-w-xl">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start booking your Ayodhya tour experience today
              </p>
              <Link href={`/login?redirect=/tourist/bookings`} className="block">
                <Button className="max-w-lg bg-secondary cursor-pointer hover:bg-secondary/90">
                  Explore Services
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="hidden lg:block sticky top-32 self-start">
                  <Card className="space-y-3 sm:space-y-4">
                    <CardHeader>
                      <CardTitle className="text-xl">Filters</CardTitle>
                      <CardDescription>Refine your booking list</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="booking-search" className="text-sm font-semibold">
                          Search bookings
                        </Label>
                        <Input
                          id="booking-search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search tourist, type or booking ID"
                          className="bg-background"
                        />
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-4 space-y-3">
                        <p className="text-sm font-semibold">Date Filter</p>
                        <Select
                          value={dateFilter}
                          onValueChange={(val: any) => {
                            setDateFilter(val);
                            if (val !== "specific") setSpecificDate("");
                          }}
                        >
                          <SelectTrigger className="w-full bg-background border-border rounded-2xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="specific">Specific Date...</SelectItem>
                          </SelectContent>
                        </Select>

                        {dateFilter === "specific" && (
                          <div className="space-y-1 mt-2">
                            <Label htmlFor="specific-date" className="text-xs text-muted-foreground">Choose Date</Label>
                            <Input
                              id="specific-date"
                              type="date"
                              value={specificDate}
                              onChange={(e) => setSpecificDate(e.target.value)}
                              className="rounded-2xl border-border bg-background h-10"
                            />
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Booking Status</p>
                          <span className="text-xs text-muted-foreground">
                            {selectedStatuses.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {statusOptions.map((status) => (
                            <label
                              key={status}
                              className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                            >
                              <Checkbox
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={() => toggleStatus(status)}
                              />
                              <span className="text-sm font-medium capitalize">
                                {status.toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Payment Status</p>
                          <span className="text-xs text-muted-foreground">
                            {selectedPaymentStatuses.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {paymentStatusOptions.map((status) => (
                            <label
                              key={status}
                              className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                            >
                              <Checkbox
                                checked={selectedPaymentStatuses.includes(status)}
                                onCheckedChange={() => togglePaymentStatus(status)}
                              />
                              <span className="text-sm font-medium capitalize">
                                {status.toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Reset filters
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {totalDisplayBookingsCount} results
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </aside>

                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-destructive">My Bookings</p>
                      <p className="text-sm text-muted-foreground">
                        {totalDisplayBookingsCount} bookings match your filters
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={refreshBookingList}
                        disabled={isRefreshing}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {isRefreshing ? "Refreshing" : "Refresh"}
                      </Button>
                      <Select
                        value={sortBy}
                        onValueChange={(value: any) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-32 bg-background shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                           <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="lg:hidden space-y-4 mb-6">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </div>
                  </div>

                  <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                      </DialogHeader>
                      <Card className="border-0 space-y-4">
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-3">
                            <Label htmlFor="mobile-booking-search" className="text-sm font-semibold">
                              Search bookings
                            </Label>
                            <Input
                              id="mobile-booking-search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search tourist, type or booking ID"
                              className="bg-background"
                            />
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4 space-y-3">
                            <p className="text-sm font-semibold">Date Filter</p>
                            <Select
                              value={dateFilter}
                              onValueChange={(val: any) => {
                                setDateFilter(val);
                                if (val !== "specific") setSpecificDate("");
                              }}
                            >
                              <SelectTrigger className="w-full bg-background border-border rounded-2xl h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="specific">Specific Date...</SelectItem>
                              </SelectContent>
                            </Select>

                            {dateFilter === "specific" && (
                              <div className="space-y-1 mt-2">
                                <Label htmlFor="mobile-specific-date" className="text-xs text-muted-foreground">Choose Date</Label>
                                <Input
                                  id="mobile-specific-date"
                                  type="date"
                                  value={specificDate}
                                  onChange={(e) => setSpecificDate(e.target.value)}
                                  className="rounded-2xl border-border bg-background h-10"
                                />
                              </div>
                            )}
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">Booking Status</p>
                              <span className="text-xs text-muted-foreground">
                                {selectedStatuses.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {statusOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                                >
                                  <Checkbox
                                    checked={selectedStatuses.includes(status)}
                                    onCheckedChange={() => toggleStatus(status)}
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {status.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">Payment Status</p>
                              <span className="text-xs text-muted-foreground">
                                {selectedPaymentStatuses.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {paymentStatusOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                                >
                                  <Checkbox
                                    checked={selectedPaymentStatuses.includes(status)}
                                    onCheckedChange={() => togglePaymentStatus(status)}
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {status.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold">Review Status</p>
                              <span className="text-xs text-muted-foreground">
                                {selectedReviewStatuses.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {reviewOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-2 cursor-pointer transition hover:border-primary"
                                >
                                  <Checkbox
                                    checked={selectedReviewStatuses.includes(status)}
                                    onCheckedChange={() => toggleReviewStatus(status)}
                                  />
                                  <span className="text-sm font-medium capitalize">
                                    {status.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="flex-1"
                            >
                              Reset
                            </Button>
                            <Button
                              onClick={() => setMobileFiltersOpen(false)}
                              className="flex-1 bg-secondary hover:bg-secondary/90"
                            >
                              Apply Filters
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  </Dialog>

                  <Tabs defaultValue="tourPackages" className="w-full">
                    <TabsList className="mb-6 w-full flex bg-slate-100 rounded-xl p-1 overflow-x-auto no-scrollbar justify-start sm:justify-center h-auto">
                      <TabsTrigger
                        value="tourPackages"
                        className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
                      >
                        Tour Packages ({packagesCount})
                      </TabsTrigger>
                      <TabsTrigger
                        value="guideBookings"
                        className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
                      >
                        Guide Bookings ({guidesCount})
                      </TabsTrigger>
                      <TabsTrigger
                        value="cabRequests"
                        className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
                      >
                        Cab Requests ({cabsCount})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tourPackages" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredBookings.filter((b) => b.bookingType === "PACKAGE").length >
                        0 ? (
                          filteredBookings
                            .filter((b) => b.bookingType === "PACKAGE")
                            .map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={(bookingId) => setCancellingId(bookingId)}
                                onLeaveReview={handleLeaveReview}
                                onViewReview={handleViewReview}
                              />
                            ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            No tour packages match your filters.
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="guideBookings" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredBookings.filter((b) => b.bookingType === "GUIDE").length >
                        0 ? (
                          filteredBookings
                            .filter((b) => b.bookingType === "GUIDE")
                            .map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={(bookingId) => setCancellingId(bookingId)}
                                onLeaveReview={handleLeaveReview}
                                onViewReview={handleViewReview}
                              />
                            ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            No guide bookings match your filters.
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="cabRequests" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredCabBookings.length > 0 ? (
                          filteredCabBookings.map((booking) => (
                            <CabBookingCard
                              key={booking._id}
                              booking={booking}
                              onCancel={handleCancelCabRequest}
                              onReschedule={openRescheduleModal}
                              onViewDetails={openDetailsModal}
                            />
                          ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            No cab requests found matching filters.
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="cabBookings" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredBookings.filter((b) => b.bookingType === "DRIVER").length >
                        0 ? (
                          filteredBookings
                            .filter((b) => b.bookingType === "DRIVER")
                            .map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={(bookingId) => setCancellingId(bookingId)}
                                onLeaveReview={handleLeaveReview}
                                onViewReview={handleViewReview}
                              />
                            ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            No cab bookings match your filters.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        open={!!cancellingId}
        onOpenChange={(open) => !open && setCancellingId(null)}
        onConfirm={(reason) => cancellingId && handleCancel(cancellingId, reason)}
      />

      {/* View Review Modal */}
      <ViewReviewModal
        open={viewReviewOpen}
        onOpenChange={setViewReviewOpen}
        review={viewingReview}
        guideName={
          selectedBookingForReview
            ? bookings.find((b) => b.id === selectedBookingForReview)?.touristName
            : undefined
        }
      />

      {selectedBookingForReview && (
        <ReviewModal
          open={reviewModalOpen}
          bookingId={selectedBookingForReview}
          onOpenChange={(open) => {
            if (!open) setSelectedBookingForReview(null);
            setReviewModalOpen(open);
          }}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* ============================================================ */}
      {/* CAB BOOKING DETAILS DIALOG */}
      {/* ============================================================ */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Car className="text-indigo-600 w-5 h-5" /> Cab Booking Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete details for cab booking reference.
            </DialogDescription>
          </DialogHeader>

          {selectedCab && (
            <div className="space-y-4 py-2 text-slate-700">
              <div className="flex justify-between border-b pb-2 text-xs text-muted-foreground">
                <span>Created Date:</span>
                <span className="font-semibold">
                  {new Date(selectedCab.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedCab.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-muted-foreground">Booking ID</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedCab.bookingId || selectedCab._id}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Car Category</span>
                  <span className="font-bold text-orange-600 text-sm">
                    {selectedCab.vehicleType}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Travel Date</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(selectedCab.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Pickup Time</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {selectedCab.pickupTime}
                  </span>
                </div>

                <div>
                  <span className="block text-muted-foreground">Passengers</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> {selectedCab.numPeople} people
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Booking Status</span>
                  <span className="font-bold uppercase text-xs">{selectedCab.status}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2 text-xs">
                <div>
                  <span className="block text-muted-foreground">Pickup Location</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {selectedCab.pickupLocation}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Dropoff Location</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {selectedCab.dropoffLocation}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 text-xs">
                <span className="block text-muted-foreground mb-1">Passenger Contact Details</span>
                <p className="font-semibold text-slate-900">{selectedCab.fullName}</p>
                <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {selectedCab.phone}
                </p>
              </div>

              {selectedCab.specialAssistance && (
                <div className="border-t pt-3 text-xs">
                  <span className="block text-muted-foreground mb-1.5">
                    Special Assistance Required
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCab.specialAssistance.wheelchair && (
                      <Badge variant="destructive" className="text-[10px]">
                        Wheelchair
                      </Badge>
                    )}
                    {selectedCab.specialAssistance.medicalSupport && (
                      <Badge variant="destructive" className="text-[10px]">
                        Medical Support
                      </Badge>
                    )}
                    {selectedCab.specialAssistance.elderlyCare && (
                      <Badge variant="destructive" className="text-[10px]">
                        Elderly Care
                      </Badge>
                    )}
                    {selectedCab.specialAssistance.childCare && (
                      <Badge variant="destructive" className="text-[10px]">
                        Child Care
                      </Badge>
                    )}
                    {!selectedCab.specialAssistance.wheelchair &&
                      !selectedCab.specialAssistance.medicalSupport &&
                      !selectedCab.specialAssistance.elderlyCare &&
                      !selectedCab.specialAssistance.childCare && (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                  </div>
                </div>
              )}

              {/* Pricing Breakdown inside details */}
              <div className="border-t pt-3 bg-slate-50 p-3 rounded-2xl border">
                <span className="block text-xs font-bold text-slate-900 uppercase mb-2">
                  Pricing Breakdown
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Price:</span>
                    <span className="font-semibold text-slate-900">₹{selectedCab.price || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">GST / Tax:</span>
                    <span className="font-semibold text-slate-900">₹{selectedCab.tax || 0}</span>
                  </div>
                  {selectedCab.wheelchairCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Wheelchair Assistance Fee:</span>
                      <span className="font-semibold text-slate-900">₹{selectedCab.wheelchairCharge}</span>
                    </div>
                  )}
                  {selectedCab.medicalSupportCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Support Fee:</span>
                      <span className="font-semibold text-slate-900">₹{selectedCab.medicalSupportCharge}</span>
                    </div>
                  )}
                  <div className="border-t pt-1.5 flex justify-between font-bold text-sm text-indigo-900">
                    <span>Total Amount Paid:</span>
                    <span>₹{selectedCab.totalAmount || selectedCab.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mt-1 pt-1 border-t text-muted-foreground">
                    <span>Payment Status:</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {selectedCab.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              onClick={() => setDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* CAB RESCHEDULE MODAL */}
      {/* ============================================================ */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-indigo-600 w-5 h-5" /> Reschedule Cab Booking
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pick a new date and time slot for your pickup.
            </DialogDescription>
          </DialogHeader>

          {rescheduleError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{rescheduleError}</span>
            </div>
          )}

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">New Date *</Label>
              <Input
                type="date"
                value={rescheduleDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleTime("");
                }}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">New Pickup Time *</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Pickup Time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((slot) => {
                    const disabled = isRescheduleSlotDisabled(slot);
                    return (
                      <SelectItem key={slot} value={slot} disabled={disabled}>
                        {slot} {disabled ? "(Too early)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-800">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Rescheduling is only allowed if scheduled pickup is more than 1 hour away. New pickup
                time must also be at least 1 hour in advance.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              onClick={handleRescheduleSubmit}
              disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime}
            >
              {rescheduleSubmitting ? "Updating..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

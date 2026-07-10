"use client";

import { useState, useEffect } from "react";
import {
  getAllBookings,
  acceptBookingApi,
  cancelBookingApi,
  seenBooking,
  completeBookingApi,
  refundBookingApi,
  adminAcceptBookingApi,
  createAdminBookingApi,
} from "@/lib/api/bookings";
import { getAllGuides } from "@/lib/api/guides";
import type { Booking as ApiBooking } from "@/contexts/BookingsContext";
import { formatDate } from "@/lib/utils";
import { BookingFilters } from "@/components/admin/bookings/BookingFilters";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

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
          : apiBooking.bookingType === "PACKAGE"
            ? "Package"
            : "Normal";

  const rawDate =
    apiBooking.bookingDate ?? apiBooking.date ?? apiBooking.createdAt;
  const dateStr = rawDate ? formatDate(rawDate) : "";
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

interface GuideOption {
  id: string;
  name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [guides, setGuides] = useState<GuideOption[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [formData, setFormData] = useState({
    touristName: "",
    email: "",
    phone: "",
    touristUserId: "",
    guideId: "",
    bookingDate: "",
    startTime: "",
    tourType: "half_day",
    groupSize: 1,
    meetingPoint: "",
    dropoffLocation: "",
    notes: "",
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPayment, filterDate, filterType, searchQuery]);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setGuidesLoading(true);
        const rawGuides = await getAllGuides();
        const guideList = Array.isArray(rawGuides)
          ? rawGuides
          : rawGuides?.data || rawGuides?.guides || [];
        setGuides(
          guideList
            .filter((guide: any) => guide?._id || guide?.id)
            .map((guide: any) => ({
              id: guide._id || guide.id,
              name: guide.userId?.name || guide.name || "Unnamed guide",
            })),
        );
      } catch (err) {
        console.error("Failed to load guides", err);
      } finally {
        setGuidesLoading(false);
      }
    };

    loadGuides();
  }, []);

  // Fetch bookings on page or filter changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = {
          status: filterStatus,
          paymentStatus: filterPayment,
          dateRange: filterDate,
          bookingType: filterType,
          search: searchQuery.trim() || undefined,
          page: currentPage,
          limit: 20
        };
        const raw = await getAllBookings(filters);
        const list = raw?.bookings || (Array.isArray(raw) ? raw : raw?.data || []);
        const totalCount = raw?.totalCount ?? list.length;
        const totalP = raw?.totalPages ?? Math.ceil(totalCount / 20);

        // Convert API bookings to UI format (defensive)
        const uiBookings = list.map((booking: ApiBooking | any) =>
          convertApiBookingToUi(booking),
        );
        setBookings(uiBookings);
        setTotalBookingsCount(totalCount);
        setTotalPages(totalP);
      } catch (err: any) {
        console.error("Failed to fetch bookings:", err);
        setError(err?.message || "Failed to load bookings");
        setBookings([]);
        setTotalBookingsCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filterStatus, filterPayment, filterDate, filterType, searchQuery, currentPage]);

  const handleApprove = async (booking: AdminBooking) => {
    try {
      // For package bookings, use admin accept endpoint
      if (booking.bookingType === "PACKAGE") {
        await adminAcceptBookingApi(booking.id);
      } else {
        // For guide/driver bookings, use regular accept
        await acceptBookingApi(booking.id);
      }
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

  const resetCreateForm = () => {
    setFormData({
      touristName: "",
      email: "",
      phone: "",
      touristUserId: "",
      guideId: "",
      bookingDate: "",
      startTime: "",
      tourType: "half_day",
      groupSize: 1,
      meetingPoint: "",
      dropoffLocation: "",
      notes: "",
    });
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingBooking(true);
      setError(null);

      const payload = {
        ...formData,
        groupSize: Number(formData.groupSize),
        bookingType: "GUIDE",
        guideId: formData.guideId,
        bookingDate: new Date(formData.bookingDate).toISOString(),
        touristUserId: formData.touristUserId || undefined,
        createdByAdmin: true,
      };

      await createAdminBookingApi(payload);
      setCreateDialogOpen(false);
      resetCreateForm();
      setCurrentPage(1);
      const raw = await getAllBookings({
        status: filterStatus,
        paymentStatus: filterPayment,
        dateRange: filterDate,
        bookingType: filterType,
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: 20,
      });
      const list = raw?.bookings || (Array.isArray(raw) ? raw : raw?.data || []);
      const uiBookings = list.map((booking: ApiBooking | any) =>
        convertApiBookingToUi(booking),
      );
      setBookings(uiBookings);
      setTotalBookingsCount(raw?.totalCount ?? list.length);
      setTotalPages(raw?.totalPages ?? Math.ceil((raw?.totalCount ?? list.length) / 20));
    } catch (err: any) {
      console.error("Failed to create booking", err);
      setError(err?.message || "Failed to create booking");
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Booking Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            View and manage all tour bookings.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Create Booking
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <BookingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterPayment={filterPayment}
            onPaymentChange={setFilterPayment}
            filterDate={filterDate}
            onDateChange={setFilterDate}
            filterType={filterType}
            onTypeChange={setFilterType}
          />
          <Card className="border-border">
            <CardHeader className="pb-2 sm:pb-4">
              <Skeleton className="h-6 w-32 bg-muted/60 animate-pulse" />
              <Skeleton className="h-4 w-48 bg-muted/60 animate-pulse mt-1.5" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-3 border-b border-border last:border-none">
                  <Skeleton className="h-4 w-16 bg-muted/60 animate-pulse" />
                  <Skeleton className="h-4 flex-1 bg-muted/60 animate-pulse" />
                  <Skeleton className="h-4 w-32 bg-muted/60 animate-pulse" />
                  <Skeleton className="h-4 w-20 bg-muted/60 animate-pulse" />
                  <Skeleton className="h-4 w-24 bg-muted/60 animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
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
            filterType={filterType}
            onTypeChange={setFilterType}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 20, totalBookingsCount)}
                    </span>{" "}
                    of <span className="font-medium">{totalBookingsCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs gap-1" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-md"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium text-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-r-md"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal */}
          <BookingDetailsModal
            booking={selectedBooking}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />

          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetCreateForm();
          }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create guide booking</DialogTitle>
                <DialogDescription>
                  Create a guide booking on behalf of a tourist when they cannot book themselves.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="touristName">Tourist name</Label>
                    <Input
                      id="touristName"
                      value={formData.touristName}
                      onChange={(e) => setFormData({ ...formData, touristName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="touristEmail">Tourist email</Label>
                    <Input
                      id="touristEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="touristPhone">Tourist phone</Label>
                    <Input
                      id="touristPhone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="touristUserId">Existing tourist user ID (optional)</Label>
                    <Input
                      id="touristUserId"
                      value={formData.touristUserId}
                      onChange={(e) => setFormData({ ...formData, touristUserId: e.target.value })}
                      placeholder="Leave blank to create without a linked account"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="guideId">Guide</Label>
                    <Select
                      value={formData.guideId}
                      onValueChange={(value) => setFormData({ ...formData, guideId: value })}
                      required
                    >
                      <SelectTrigger id="guideId">
                        <SelectValue placeholder={guidesLoading ? "Loading guides..." : "Select a guide"} />
                      </SelectTrigger>
                      <SelectContent>
                        {guides.map((guide) => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Booking date</Label>
                    <Input
                      id="bookingDate"
                      type="date"
                      min={new Date().toLocaleDateString("en-CA")}
                      value={formData.bookingDate}
                      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tourType">Tour type</Label>
                    <Select
                      value={formData.tourType}
                      onValueChange={(value) => setFormData({ ...formData, tourType: value })}
                    >
                      <SelectTrigger id="tourType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="full_day">Full Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupSize">Group size</Label>
                    <Input
                      id="groupSize"
                      type="number"
                      min="1"
                      value={formData.groupSize}
                      onChange={(e) => setFormData({ ...formData, groupSize: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="meetingPoint">Meeting point</Label>
                    <Input
                      id="meetingPoint"
                      value={formData.meetingPoint}
                      onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="dropoffLocation">Drop-off location</Label>
                    <Input
                      id="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes for the booking"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingBooking || guidesLoading}>
                    {submittingBooking ? "Creating..." : "Create booking"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
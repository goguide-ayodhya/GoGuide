"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  User,
  IndianRupee,
} from "lucide-react";
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
  bookingType?: string;
  price?: number;
  status?: string;
  paymentStatus?: string;
  notes?: string;
  isSeenByAdmin?: boolean;
  createdAt?: string;
}
import {
  getAllBookings,
  acceptBookingApi,
  cancelBookingApi,
  seenBooking,
} from "@/lib/api/bookings";
import type { Booking as ApiBooking } from "@/contexts/BookingsContext";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning-foreground border-warning/20",
  PENDING: "bg-warning/10 text-warning-foreground border-warning/20",
  Confirmed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  ACCEPTED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "On the Way": "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Completed: "bg-success/10 text-success border-success/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

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
    bookingType: apiBooking.bookingType || "",
    price: priceVal,
    status: statusMap[apiBooking.status] || ("Pending" as const),
    paymentStatus: apiBooking.paymentStatus || "PENDING",
    notes: apiBooking.notes || "",
    isSeenByAdmin: !!apiBooking.isSeenByAdmin,
    createdAt: apiBooking.createdAt,
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await getAllBookings();
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
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const q = searchQuery.trim().toLowerCase();
    const id = (booking.id || "").toString().toLowerCase();
    const tourist = (booking.touristName || "").toLowerCase();
    const guide = (booking.guideName || "").toLowerCase();

    const matchesSearch =
      !q || id.includes(q) || tourist.includes(q) || guide.includes(q);
    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchesPayment =
      filterPayment === "all" || booking.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

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
          <Card className="border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, tourist or guide..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="On the Way">On the Way</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <Select
                    value={filterPayment}
                    onValueChange={setFilterPayment}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Filter by payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings - Mobile Cards / Desktop Table */}
          <Card className="border-border">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">
                All Bookings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredBookings.length} bookings found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile View - Cards */}
              <div className="block lg:hidden space-y-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 sm:p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {booking.id}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {booking.touristName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.touristEmail}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${statusColors[booking.status ?? "Pending"]}`}
                      >
                        {booking.status ?? "Pending"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guide:</span>
                        <span className="text-foreground font-medium">
                          {booking.guideName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tour:</span>
                        <span className="text-foreground">
                          {booking.tourType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-foreground">{booking.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="text-foreground font-medium flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {(booking.price ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge variant="outline" className="text-xs">
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge
                          variant={
                            booking.bookingType === "VIP"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {booking.bookingType}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        className="h-10 flex-1 text-xs"
                        onClick={() => viewDetails(booking)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                      {booking.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="h-10 flex-1 text-xs"
                            onClick={() => handleApprove(booking)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 flex-1 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleCancel(booking)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Booking ID
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Tourist
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Guide
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Tour Type
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Date
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Meeting Point
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Price
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Payment Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 text-sm font-medium text-foreground">
                          {booking.id}
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {booking.touristName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.touristEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-foreground">
                          {booking.guideName}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {booking.tourType}
                        </td>
                        <td className="py-3 text-sm text-foreground">
                          {booking.date}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {booking.meetingPoint}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              booking.bookingType === "VIP"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {booking.bookingType}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm font-medium text-foreground">
                          <span className="flex items-center gap-0.5">
                            <IndianRupee className="w-3 h-3" />
                            {(booking.price ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">
                            {booking.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColors[booking.status ?? "Pending"]}`}
                          >
                            {booking.status ?? "Pending"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => viewDetails(booking)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {!booking.isSeenByAdmin && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkSeen(booking)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Seen
                                </DropdownMenuItem>
                              )}
                              {booking.status === "Pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(booking)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancel(booking)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(booking.status === "Confirmed" ||
                                booking.status === "On the Way") && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleCancel(booking)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Details Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Booking Details
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Booking ID: {selectedBooking?.id}
                </DialogDescription>
              </DialogHeader>
              {selectedBooking && (
                <div className="space-y-4 py-2 sm:py-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Email
                      </p>
                      <p className="text-xs sm:text-sm font-medium">
                        {selectedBooking.touristEmail}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-xs sm:text-sm font-medium">
                        {selectedBooking.touristPhone || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Tourist
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          {selectedBooking.touristName}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Guide
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          {selectedBooking.guideName}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Tour Type
                      </p>
                      <p className="text-xs sm:text-sm font-medium">
                        {selectedBooking.tourType}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Booking Type
                      </p>
                      <Badge
                        variant={
                          selectedBooking.bookingType === "VIP"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] sm:text-xs"
                      >
                        {selectedBooking.bookingType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          {selectedBooking.date}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Meeting Point
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          {selectedBooking.meetingPoint}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Price
                      </p>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          {(selectedBooking.price ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${statusColors[selectedBooking.status ?? "Pending"]}`}
                      >
                        {selectedBooking.status ?? "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Payment
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs"
                      >
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  {selectedBooking.notes && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-xs sm:text-sm">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

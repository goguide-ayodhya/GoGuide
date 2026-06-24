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
import {
  Car,
  Calendar,
  User,
  Check,
  X,
  Clock,
  MapPin,
  AlertTriangle,
  Heart,
  Thermometer,
  Eye,
} from "lucide-react";
import { getAllCabBookingsApi, updateCabBookingStatusApi } from "@/lib/api/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type CabBookingType = {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  fullName: string;
  phone: string;
  numPeople: number;
  specialAssistance: {
    wheelchair: boolean;
    medicalSupport: boolean;
    elderlyCare: boolean;
    childCare: boolean;
  };
  startDate: string;
  numDays: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  acPreference: "AC" | "Non-AC";
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
};

export default function CabBookingsAdminPage() {
  const [bookings, setBookings] = useState<CabBookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CabBookingType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCabBookingsApi();
      setBookings(Array.isArray(data) ? data : data?.bookings || []);
    } catch (err: any) {
      console.error("Failed to fetch cab bookings:", err);
      setError(err?.message || "Failed to load cab bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      setError(null);
      await updateCabBookingStatusApi(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: status as any } : b))
      );
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: status as any } : null));
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(err.message || "Failed to update status");
    }
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter((b) => {
    const start = new Date(b.startDate);
    return b.status === "CONFIRMED" && start >= today;
  }).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">
            Confirmed
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200" variant="outline">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const hasSpecialAssistance = (assist: CabBookingType["specialAssistance"]) => {
    return assist.wheelchair || assist.medicalSupport || assist.elderlyCare || assist.childCare;
  };

  const getSpecialAssistanceText = (assist: CabBookingType["specialAssistance"]) => {
    const list = [];
    if (assist.wheelchair) list.push("Wheelchair");
    if (assist.medicalSupport) list.push("Medical Support");
    if (assist.elderlyCare) list.push("Elderly Care");
    if (assist.childCare) list.push("Child Care");
    return list.join(", ");
  };

  const openDetails = (booking: CabBookingType) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Cab Booking Requests
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Review and confirm custom cab bookings submitted by tourists.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Submitted in total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              New Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{pendingBookings}</div>
            <p className="text-xs text-amber-600 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{upcomingBookings}</div>
            <p className="text-xs text-emerald-600 mt-1">Confirmed and scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-center">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Table/List */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">All Custom Cab Bookings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest requests appear first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cab requests...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl border-border">
              <Car className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No cab booking requests found.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className={`p-4 rounded-xl border border-border bg-card space-y-3 relative ${
                      booking.status === "PENDING" ? "ring-1 ring-amber-400/50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {booking.fullName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.phone}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Stay:</span>
                        <span className="font-medium text-foreground">
                          {new Date(booking.startDate).toLocaleDateString()} ({booking.numDays} days)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium text-foreground text-right truncate max-w-[200px]">
                          {booking.pickupLocation} → {booking.dropoffLocation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="font-medium text-foreground">
                          {booking.vehicleType} ({booking.acPreference})
                        </span>
                      </div>
                      {hasSpecialAssistance(booking.specialAssistance) && (
                        <div className="flex justify-between mt-1 text-rose-600 font-medium">
                          <span>Assistance:</span>
                          <span>{getSpecialAssistanceText(booking.specialAssistance)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetails(booking)}
                        className="h-8 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Button>
                      {booking.status === "PENDING" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking._id, "CONFIRMED")}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Confirm
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking._id, "CANCELLED")}
                            className="h-8 text-xs"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(booking._id, "COMPLETED")}
                          className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                      <th className="py-3 px-2">Tourist</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2">Travel Date</th>
                      <th className="py-3 px-2">Days</th>
                      <th className="py-3 px-2">Vehicle (AC)</th>
                      <th className="py-3 px-2">Route</th>
                      <th className="py-3 px-2">Assistance</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((booking) => {
                      const isUpcoming =
                        booking.status === "CONFIRMED" &&
                        new Date(booking.startDate) >= today;

                      return (
                        <tr
                          key={booking._id}
                          className={`text-sm hover:bg-slate-50 transition-colors ${
                            booking.status === "PENDING"
                              ? "bg-amber-500/5 hover:bg-amber-500/10 font-medium"
                              : isUpcoming
                              ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                              : ""
                          }`}
                        >
                          <td className="py-3.5 px-2 font-medium text-foreground">
                            {booking.fullName}
                          </td>
                          <td className="py-3.5 px-2 text-muted-foreground">
                            {booking.phone}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {new Date(booking.startDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">{booking.numDays}</td>
                          <td className="py-3.5 px-2">
                            <span className="font-semibold">{booking.vehicleType}</span>
                            <span className="text-xs text-muted-foreground ml-1.5">
                              ({booking.acPreference})
                            </span>
                          </td>
                          <td className="py-3.5 px-2 max-w-[200px] truncate">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{booking.pickupLocation} → {booking.dropoffLocation}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            {hasSpecialAssistance(booking.specialAssistance) ? (
                              <Badge
                                className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                                variant="outline"
                              >
                                Yes: {getSpecialAssistanceText(booking.specialAssistance)}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDetails(booking)}
                                title="View Details"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {booking.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUpdateStatus(booking._id, "CONFIRMED")}
                                    title="Confirm Booking"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUpdateStatus(booking._id, "CANCELLED")}
                                    title="Cancel Booking"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(booking._id, "COMPLETED")}
                                  className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cab Booking Details</DialogTitle>
            <DialogDescription>
              Full information for this booking request.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Tourist Name</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Travel Start Date</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(selectedBooking.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Number of Days Stay</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.numDays} days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Number of People</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.numPeople}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AC / Non-AC Preference</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.acPreference}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle Requested</p>
                  <p className="font-semibold text-orange-600 mt-0.5">{selectedBooking.vehicleType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedBooking.pickupLocation}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Dropoff Location</p>
                  <p className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedBooking.dropoffLocation}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Special Assistance Required</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.wheelchair
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.wheelchair && "✓"}
                    </div>
                    <span>Wheelchair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.medicalSupport
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.medicalSupport && "✓"}
                    </div>
                    <span>Medical Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.elderlyCare
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.elderlyCare && "✓"}
                    </div>
                    <span>Elderly Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.childCare
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.childCare && "✓"}
                    </div>
                    <span>Child Care</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-3">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedBooking?.status === "PENDING" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleUpdateStatus(selectedBooking._id, "CANCELLED");
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    handleUpdateStatus(selectedBooking._id, "CONFIRMED");
                  }}
                >
                  Confirm Request
                </Button>
              </>
            )}
            {selectedBooking?.status === "CONFIRMED" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  handleUpdateStatus(selectedBooking._id, "COMPLETED");
                }}
              >
                Mark Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

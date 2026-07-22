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
  Calendar,
  Clock,
  MapPin,
  Eye,
  Phone,
  User,
  Info,
} from "lucide-react";
import { getAllBookings } from "@/lib/api/bookings";
import { getAllCabBookingsApi } from "@/lib/api/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type UnifiedBooking = {
  _id: string;
  bookingId: string;
  touristName: string;
  bookingType: "Cab" | "Guide" | "Package";
  location: string;
  date: string;
  time: string;
  status: string;
  phone: string;
  raw: any;
};

const parseBookingDateTime = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let hours = 12;
  let minutes = 0;

  if (timeStr) {
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
  }

  return new Date(year, month, day, hours, minutes);
};

export default function UpcomingBookingsPage() {
  const [upcoming, setUpcoming] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedBooking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "Cab" | "Guide" | "Package">("ALL");

  const fetchUpcomingBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsData, cabsData] = await Promise.all([
        getAllBookings({ limit: 100 }),
        getAllCabBookingsApi(),
      ]);

      const extractArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data?.bookings)) return res.data.bookings;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.bookings)) return res.bookings;
        return [];
      };

      const bookingsList = extractArray(bookingsData);
      const cabsList = extractArray(cabsData);

      const unified: UnifiedBooking[] = [
        ...bookingsList.map((b: any) => ({
          _id: b._id,
          bookingId: b.bookingId || b._id,
          touristName: b.touristName || "Unknown",
          bookingType: (b.bookingType === "PACKAGE" ? "Package" : "Guide") as "Package" | "Guide",
          location: b.meetingPoint || "N/A",
          date: b.bookingDate,
          time: b.startTime || "N/A",
          status: b.status,
          phone: b.phone || "N/A",
          raw: b,
        })),
        ...cabsList.map((c: any) => ({
          _id: c._id,
          bookingId: c.bookingId || c._id,
          touristName: c.fullName || "Unknown",
          bookingType: "Cab" as const,
          location: `${c.pickupLocation} → ${c.dropoffLocation}`,
          date: c.startDate,
          time: c.pickupTime || "N/A",
          status: c.status,
          phone: c.phone || "N/A",
          raw: c,
        })),
      ];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter: Travel date >= today and active status (CONFIRMED or ACCEPTED)
      const filtered = unified.filter((item) => {
        if (!item.date) return false;
        const travelDate = new Date(item.date);
        travelDate.setHours(0, 0, 0, 0);
        const isFutureOrToday = travelDate.getTime() >= today.getTime();
        const isActive = item.status === "CONFIRMED" || item.status === "ACCEPTED";
        return isFutureOrToday && isActive;
      });

      // Sort: Earliest date/time first
      const sorted = filtered.sort((a, b) => {
        const dateA = parseBookingDateTime(a.date, a.time).getTime();
        const dateB = parseBookingDateTime(b.date, b.time).getTime();
        return dateA - dateB;
      });

      setUpcoming(sorted);
    } catch (err: any) {
      console.error("Failed to load upcoming bookings", err);
      setError(err?.message || "Failed to load upcoming bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const cabCount = upcoming.filter((item) => item.bookingType === "Cab").length;
  const guideCount = upcoming.filter((item) => item.bookingType === "Guide").length;
  const packageCount = upcoming.filter((item) => item.bookingType === "Package").length;

  const displayedUpcoming = activeTab === "ALL"
    ? upcoming
    : upcoming.filter((item) => item.bookingType === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">Pending</Badge>;
      case "ACCEPTED":
      case "CONFIRMED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">Confirmed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenDetails = (item: UnifiedBooking) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Upcoming Bookings</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Displays all active Guide, Package, and Cab bookings sorted by nearest schedule.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center bg-white border border-border rounded-3xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Retrieving upcoming bookings list...</p>
        </div>
      ) : (
        <Card className="border-border">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
            <div>
              <CardTitle className="text-base">Upcoming Schedules ({displayedUpcoming.length})</CardTitle>
              <CardDescription>Chronological list of active rides, guides, and packages</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUpcomingBookings} className="h-8 text-xs font-semibold">
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === "ALL"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>All</span>
                <Badge className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "ALL" ? "bg-white text-slate-900 font-bold" : "bg-slate-200 text-slate-700"
                }`}>
                  {upcoming.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Cab")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === "Cab"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <span>Cab</span>
                <Badge className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "Cab" ? "bg-white text-amber-900 font-bold" : "bg-amber-200 text-amber-900"
                }`}>
                  {cabCount}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Guide")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === "Guide"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <span>Guide</span>
                <Badge className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "Guide" ? "bg-white text-rose-900 font-bold" : "bg-rose-200 text-rose-900"
                }`}>
                  {guideCount}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Package")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeTab === "Package"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-indigo-600/90 text-white hover:bg-indigo-700"
                }`}
              >
                <span>Packages</span>
                <Badge className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "Package" ? "bg-white text-indigo-900 font-bold" : "bg-indigo-200 text-indigo-900"
                }`}>
                  {packageCount}
                </Badge>
              </button>
            </div>

            {displayedUpcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No upcoming confirmed {activeTab === "ALL" ? "" : activeTab.toLowerCase()} bookings found for today or future dates.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                      <th className="py-3 px-2">Booking ID</th>
                      <th className="py-3 px-2">Tourist Name</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Locations / Meeting Point</th>
                      <th className="py-3 px-2">Schedule Date</th>
                      <th className="py-3 px-2">Time</th>
                      <th className="py-3 px-2">Contact</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedUpcoming.map((item) => (
                      <tr key={item.bookingId} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-2 font-bold text-slate-900">
                          {item.bookingId}
                        </td>
                        <td className="py-3.5 px-2 font-medium text-foreground">
                          {item.touristName}
                        </td>
                        <td className="py-3.5 px-2">
                          <Badge variant="outline" className={
                            item.bookingType === "Cab" 
                              ? "bg-amber-50 text-amber-700 border-amber-200" 
                              : item.bookingType === "Guide" 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }>
                            {item.bookingType}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-2 max-w-[200px] truncate">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> {item.time}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {item.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetails(item)}
                            className="h-8 w-8 text-indigo-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Booking Detailed View</DialogTitle>
            <DialogDescription>
              Complete details of this upcoming schedule request.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedItem.bookingId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking Type</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.bookingType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tourist Name</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.touristName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Phone</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Schedule Date</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(selectedItem.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {selectedItem.time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Meeting / Pickup Location</p>
                <p className="font-medium text-slate-900 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedItem.location}</span>
                </p>
              </div>

              {selectedItem.bookingType === "Cab" && selectedItem.raw && (
                <div className="border-t pt-3 bg-slate-50 p-3 rounded-2xl border space-y-1.5 text-xs">
                  <p className="font-bold text-slate-900 uppercase">Cab Fare Breakdown</p>
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-semibold">₹{selectedItem.raw.price || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Tax:</span>
                    <span className="font-semibold">₹{selectedItem.raw.tax || 0}</span>
                  </div>
                  {selectedItem.raw.wheelchairCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Wheelchair Charge:</span>
                      <span className="font-semibold">₹{selectedItem.raw.wheelchairCharge}</span>
                    </div>
                  )}
                  {selectedItem.raw.medicalSupportCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Medical Support Charge:</span>
                      <span className="font-semibold">₹{selectedItem.raw.medicalSupportCharge}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 flex justify-between font-bold text-sm text-indigo-900">
                    <span>Total Amount:</span>
                    <span>₹{selectedItem.raw.totalAmount || selectedItem.raw.price || 0}</span>
                  </div>
                </div>
              )}

              {selectedItem.bookingType !== "Cab" && selectedItem.raw && (
                <div className="border-t pt-3 bg-slate-50 p-3 rounded-2xl border space-y-1.5 text-xs">
                  <p className="font-bold text-slate-900 uppercase">Pricing Details</p>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-bold text-indigo-900 text-sm">₹{selectedItem.raw.totalPrice || selectedItem.raw.price || 0}</span>
                  </div>
                  {selectedItem.raw.paymentStatus && (
                    <div className="flex justify-between mt-1 pt-1 border-t text-muted-foreground">
                      <span>Payment Status:</span>
                      <span className="font-bold uppercase text-slate-800">{selectedItem.raw.paymentStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

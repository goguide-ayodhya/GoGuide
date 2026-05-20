"use client";

import { useEffect, useState, useContext } from "react";
import { StatsCard } from "@/components/stats-card";
import { DriverAvailabilityToggle } from "@/app/driver/components/driver-availability-toggle";
import { DriverStatusCard } from "@/app/driver/components/driver-status-card";
import { BookingDetailsModal } from "@/components/booking-details-modal";
import { acceptBookingApi, rejectBookingApi } from "@/lib/api/bookings";
import { getPendingRides, confirmRide } from "@/lib/api/rides";
import {
  getDriverEarnings,
  getDriverWeeklyEarnings,
  getDriverMonthlyEarnings,
} from "@/lib/api/payments";
import { getDriverReviewsApi } from "@/lib/api/reviews";
import { completeCodPaymentApi } from "@/lib/api/payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Star,
  IndianRupee,
  Clock3,
} from "lucide-react";
import { Booking } from "@/contexts/BookingsContext";
import Link from "next/link";
import { useDriver } from "@/contexts/DriverContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useEarnings } from "@/contexts/EarningContext";
import { useReview } from "@/contexts/ReviewContext";
import { SocketContext } from "@/contexts/cabs/SocketContext";
import { useActiveRide } from "@/contexts/ActiveRideContext";
import { Badge } from "@/components/ui/badge";
import DriverAssignedSheet from "@/components/cabs/DriverAssignedSheet";
import { useDriverAuthGuard } from "@/hooks/useDriverAuthGuard";
import { GuideAvailabilityToggle } from "@/components/guide-availability-toggle";

export default function DashboardPage() {
  // Auth Guard
  const { user, loading } = useDriverAuthGuard();

  const { myDriver } = useDriver();
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const monthlyData = earningsContext?.monthlyData;
  const { bookings, setBookings } = useBooking();
  const { reviews, getDriverReview } = useReview();
  const { socket } = useContext(SocketContext);
  const { activeRide, clearActiveRide, setActiveRide } = useActiveRide();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActiveRideSheet, setShowActiveRideSheet] = useState(false);

  const recentBookings = bookings.slice(0, 5);
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const completedCount = bookings.filter(
    (b) => b.status === "COMPLETED",
  ).length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "CANCELLED",
  ).length;
  const newBookings = bookings.filter((b) => b.status === "PENDING");

  const statusData = [
    { name: "Pending", value: pendingCount, fill: "#fbbf24" },
    { name: "Accepted", value: acceptedCount, fill: "#10b981" },
    { name: "Completed", value: completedCount, fill: "#3b82f6" },
    { name: "Cancelled", value: cancelledCount, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  const handleViewDetails = (booking: Booking): void => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const loadPendingRides = async () => {
    try {
      console.log("[DRIVER] Loading pending rides from database");
      const pendingRides = await getPendingRides();

      // Convert ride data to booking format
      const rideBookings = pendingRides.map((rideData: any) => ({
        bookingId: rideData._id,
        _id: rideData._id,
        id: rideData._id,
        guideId: "",
        driverId: user?.id || "",
        touristName:
          rideData.user?.fullname?.firstname ||
          rideData.user?.name ||
          "Unknown",
        email: rideData.user?.email || "",
        phone: rideData.user?.phone || "",
        groupSize: rideData.groupSize || 1,
        participants: rideData.groupSize || 1,
        bookingDate:
          rideData.bookingDate ||
          new Date(rideData.createdAt).toISOString().split("T")[0],
        date:
          rideData.bookingDate ||
          new Date(rideData.createdAt).toISOString().split("T")[0],
        startTime: rideData.startTime || "09:00",
        bookingType: "DRIVER" as const,
        tourType: rideData.tourType || "City Tour",
        meetingPoint: rideData.pickup || "",
        location: rideData.pickup || "",
        dropoffLocation: rideData.destination || "",
        totalPrice: rideData.fare || 0,
        totalAmount: rideData.fare || 0,
        status: "PENDING" as const,
        paymentStatus: "PENDING" as const,
        paymentType: "COD" as const,
        paidAmount: 0,
        remainingAmount: rideData.fare || 0,
        discount: 0,
        finalPrice: rideData.fare || 0,
        originalPrice: rideData.fare || 0,
        guideEarning: 0,
        adminCommission: 0,
        cancellationReason: "",
        cancelledBy: undefined,
        createdAt: new Date(rideData.createdAt).toISOString(),
        notes: rideData.notes || "",
        paymentMethod: "cod",
        avatar: rideData.user?.avatar || rideData.user?.profileImage || "",
        reviewed: false,
        hours: rideData.hours || 1,
      }));

      setBookings((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const newBookings = rideBookings.filter(
          (b: { id: string }) => !existingIds.has(b.id),
        );
        return [...newBookings, ...prev];
      });

      console.log(
        `[DRIVER] Loaded ${rideBookings.length} pending rides from database`,
      );
    } catch (error) {
      console.error("[DRIVER] Error loading pending rides:", error);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      if (newStatus === "ACCEPTED") {
        console.log(`[DRIVER] Accepting ride ${bookingId}`);
        const rideData = await confirmRide(bookingId);
        console.log(`[DRIVER] Successfully accepted ride ${bookingId}`);

        // Remove from pending bookings and show active ride sheet
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setShowActiveRideSheet(true);

        // Set active ride in context
        if (rideData) {
          // Convert to active ride format
          const activeRideData = {
            _id: rideData._id,
            id: rideData._id,
            user: rideData.user,
            driver: rideData.driver,
            pickup: rideData.pickup,
            destination: rideData.destination,
            fare: rideData.fare,
            status: rideData.status,
            otp: rideData.otp,
            createdAt: rideData.createdAt,
            updatedAt: rideData.updatedAt,
          };
          // This will be handled by the ActiveRideContext via socket events
        }
      } else if (newStatus === "REJECTED") {
        await rejectBookingApi(bookingId);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus as any } : b,
          ),
        );
      }
    } catch (err) {
      console.error("[DRIVER] Status update failed:", err);
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
  };

  useEffect(() => {
    earningsContext?.fetchEarnings();
    earningsContext?.fetchMonthlyEarnings();
    earningsContext?.fetchWeeklyEarnings();
    if (myDriver?.id) {
      getDriverReview(myDriver.id);
    }
    // Load pending rides from database
    loadPendingRides();
  }, [myDriver?.id]);

  // Socket integration for new ride requests
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Join driver room
    socket.emit("join", { userType: "driver", userId: user.id });

    // Handle new ride requests
    const handleNewRide = (rideData: any) => {
      console.log("[DRIVER] New ride request received:", rideData);

      // Convert ride data to booking format and add to bookings list
      const newBooking: Booking = {
        bookingId: rideData._id,
        _id: rideData._id,
        id: rideData._id,
        guideId: "",
        driverId: user?.id || "",
        touristName: rideData.user?.name || "Unknown",
        email: rideData.user?.email || "",
        phone: rideData.user?.phone || "",
        groupSize: rideData.groupSize || 1,
        participants: rideData.groupSize || 1,
        bookingDate:
          rideData.bookingDate ||
          new Date(rideData.createdAt).toISOString().split("T")[0],
        date:
          rideData.bookingDate ||
          new Date(rideData.createdAt).toISOString().split("T")[0],
        startTime: rideData.startTime || "09:00",
        bookingType: "DRIVER" as const,
        tourType: rideData.tourType || "City Tour",
        meetingPoint: rideData.pickup || "",
        location: rideData.pickup || "",
        dropoffLocation: rideData.destination || "",
        totalPrice: rideData.fare || 0,
        totalAmount: rideData.fare || 0,
        status: "PENDING" as const,
        paymentStatus: "PENDING" as const,
        paymentType: "COD" as const,
        paidAmount: 0,
        remainingAmount: rideData.fare || 0,
        discount: 0,
        finalPrice: rideData.fare || 0,
        originalPrice: rideData.fare || 0,
        guideEarning: 0,
        adminCommission: 0,
        cancellationReason: "",
        cancelledBy: undefined,
        createdAt: new Date(rideData.createdAt).toISOString(),
        notes: rideData.notes || "",
        paymentMethod: "cod",
        avatar: rideData.user?.avatar || rideData.user?.profileImage || "",
        reviewed: false,
        hours: rideData.hours || 1,
      };

      // Add to bookings list if not already present
      setBookings((prev) => {
        const exists = prev.some((b) => b.id === newBooking.id);
        if (!exists) {
          return [newBooking, ...prev];
        }
        return prev;
      });
    };

    socket.on("new-ride", handleNewRide);

    // Handle ride accepted by another driver
    const handleRideAccepted = (data: any) => {
      console.log("[DRIVER] Ride accepted by another driver:", data);
      // Remove the accepted ride from the bookings list
      setBookings((prev) => prev.filter((b) => b.id !== data.rideId));
    };

    // Handle ride accepted by this driver
    const handleRideAcceptedByMe = (data: any) => {
      console.log("[DRIVER] I accepted the ride:", data);
      // Remove from pending bookings and show active ride
      setBookings((prev) => prev.filter((b) => b.id !== data.rideId));
      setShowActiveRideSheet(true);

      // ActiveRideContext will handle setting the active ride data
      // No need to manually set here since context handles it
    };

    socket.on("ride-accepted", handleRideAccepted);
    socket.on("ride-accepted-driver", handleRideAcceptedByMe);

    return () => {
      socket.off("new-ride", handleNewRide);
      socket.off("ride-accepted", handleRideAccepted);
      socket.off("ride-accepted-driver", handleRideAcceptedByMe);
    };
  }, [socket, user?.id, setBookings]);

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl text-secondary md:text-3xl font-bold text-foreground flex items-center gap-3">
            {myDriver?.name}
            {myDriver?.verificationStatus === "VERIFIED" ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                VERIFIED
              </Badge>
            ) : (
              <Badge>UNVERIFIED</Badge>
            )}
          </h1>
          <DriverAvailabilityToggle />
        </div>

        <p className="text-muted-foreground text-sm mt-2">
          Dear, Best of Luck from <b className="text-secondary">GoGuide</b>{" "}
          Team{" "}
        </p>
      </div>

      {/* Verification Status Alert */}
      {myDriver?.verificationStatus !== "VERIFIED" && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock3 className="h-4 w-4 text-orange-600" />

          <AlertDescription className="text-orange-800">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">
                Your ID verification is under review
              </p>

              <p className="text-sm">
                Our team is reviewing your documents. You will be verified soon.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* New Rides Section */}
      {bookings.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">New Ride Requests</CardTitle>
            <CardDescription>
              You have {newBookings.length} pending ride request(s) waiting for
              your action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newBookings.map((booking) => (
                <div
                  key={booking.id || booking._id}
                  className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {booking.touristName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.tourType}
                        </p>
                      </div>
                      <div className="text-right flex items-center justify-end gap-1 whitespace-nowrap">
                        <IndianRupee className="w-3 h-3 shrink-0" />
                        <p className="text-sm font-medium">
                          {booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{booking.groupSize} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleStatusChange(booking.id, "ACCEPTED")
                        }
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDetails(booking as any)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`₹${earnings?.totalEarnings?.toLocaleString() ?? 0}`}
          icon={IndianRupee}
          description="This month"
        />
        <StatsCard
          title="Upcoming Rides"
          value={bookings.filter((b) => b.status === "ACCEPTED").length ?? 0}
          icon={Calendar}
          description="Next 30 days"
        />
        <StatsCard
          title="Average Rating"
          value={myDriver?.averageRating?.toFixed(1) ?? 0}
          icon={Star}
          description="Based on reviews"
        />
        <StatsCard
          title="Total Rides"
          value={bookings.length}
          icon={TrendingUp}
          description="All time"
        />
      </div>

      {/* Weekly Earnings & Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Earnings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Weekly Earnings</CardTitle>
            <CardDescription>This month's weekly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={earningsContext?.weeklyData || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.03 240)"
                />
                <XAxis dataKey="week" stroke="oklch(0.65 0 0)" />
                <YAxis stroke="oklch(0.65 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 240)",
                    border: "1px solid oklch(0.25 0.03 240)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.72 0.2 29)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Rides</CardTitle>
                <CardDescription>Your latest ride requests</CardDescription>
              </div>
              <Link href="/driver/dashboard/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id || booking._id}
                  className="flex items-start justify-between pb-4 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {booking.touristName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.tourType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.bookingDate).toLocaleDateString()} •{" "}
                      {booking.groupSize} people
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-sm font-semibold text-foreground mt-2">
                      ₹{booking.totalPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      {reviews && reviews.length > 0 && (
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>
                  Feedback from your recent bookings
                </CardDescription>
              </div>
              <Link href="/driver/dashboard/reviews">
                <Button variant="outline" size="sm">
                  View All Reviews
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="pb-4 border-b border-border last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < review.rating ? "text-yellow-500" : "text-muted"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground">{review.comments}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
        onCashCollected={handleCashCollected}
      />

      {/* Active Ride Sheet */}
      {showActiveRideSheet && (
        <DriverAssignedSheet
          ride={activeRide}
          onClose={() => {
            setShowActiveRideSheet(false);
            // Clear active ride when closing
            if (clearActiveRide) {
              clearActiveRide();
            }
          }}
          isDriver={true}
        />
      )}
    </div>
  );
}

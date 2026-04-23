"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { GuideAvailabilityToggle } from "@/components/guide-availability-toggle";
import { BookingDetailsModal } from "@/components/booking-details-modal";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import {
  acceptBookingApi,
  rejectBookingApi,
  completeBookingApi,
  cancelBookingApi,
} from "@/lib/api/bookings";
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
} from "lucide-react";
import { Booking } from "@/contexts/BookingsContext";
import Link from "next/link";
import { useGuide } from "@/contexts/GuideContext";
import { useEarnings } from "@/contexts/EarningContext";
import { useBooking } from "@/contexts/BookingsContext";
import { useReview } from "@/contexts/ReviewContext";

export default function DashboardPage() {
  const { myGuide } = useGuide();
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const monthlyData = earningsContext?.monthlyData;
  const { bookings, setBookings, refreshBookings } = useBooking();
  const { reviews, getGuideReview } = useReview();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Compute status data for pie chart
  const statusData = [
    {
      name: "Accepted",
      value: acceptedCount,
      fill: "#22c55e",
    },
    {
      name: "Pending",
      value: pendingCount,
      fill: "#f59e0b",
    },
    {
      name: "Rejected",
      value: rejectedCount,
      fill: "#ef4444",
    },
    {
      name: "Completed",
      value: completedCount,
      fill: "#3b82f6",
    },
    {
      name: "Cancelled",
      value: cancelledCount,
      fill: "#9ca3af",
    },
  ].filter((item) => item.value > 0);

  const handleViewDetails = (booking: Booking): void => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      if (newStatus === "ACCEPTED") {
        await acceptBookingApi(bookingId);
      } else if (newStatus === "REJECTED") {
        await rejectBookingApi(bookingId);
      } else if (newStatus === "COMPLETED") {
        await completeBookingApi(bookingId);
      } else if (newStatus === "CANCELLED") {
        await cancelBookingApi(bookingId, "Cancelled by guide");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus as any } : b,
        ),
      );
    } catch (err) {
      console.log("Status update failed", err);
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

  useEffect(() => {
    earningsContext?.fetchEarnings();
    earningsContext?.fetchMonthlyEarnings();
    earningsContext?.fetchWeeklyEarnings();
    if (myGuide?.id) {
      getGuideReview(myGuide.id);
    }
  }, [myGuide?.id]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="w-full flex space-between items-center">
          <h1 className="text-xl text-secondary md:text-3xl font-bold text-foreground">
            {myGuide?.name}
          </h1>
          {/* Status Cards */}
          <div className="absolute right-2">
            <GuideAvailabilityToggle />
          </div>
        </div>

        <p className="text-muted-foreground text-sm mt-2">
          Dear, Best of Luck from{" "}
          <b className="text-secondary">GoGuide</b> Team{" "}
        </p>
      </div>

      {/* Not Available Alert */}
      {myGuide && !myGuide.isAvailable && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            You are currently not accepting new bookings. Toggle your
            availability status to start receiving new booking requests.
          </AlertDescription>
        </Alert>
      )}

      {/* New Bookings Section */}
      {bookings.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">New Booking Requests</CardTitle>
            <CardDescription>
              You have {newBookings.length} pending booking request(s) waiting
              for your action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {newBookings.map((booking) => (
                <div
                  key={booking.id}
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
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          ${booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>Group of {booking.groupSize} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {new Date(booking.bookingDate).toLocaleDateString()} •
                          {" at "} {booking.startTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 cursor-pointer hover:bg-green-700"
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
                        className="flex-1 cursor-pointer border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleStatusChange(booking.id, "REJECTED")
                        }
                      >
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 cursor-pointer"
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
          value={`$${earnings?.totalEarnings?.toLocaleString() ?? 0}`}
          icon={DollarSign}
          description={`Completed: ${completedCount}, Pending: ${pendingCount}`}
          trend={{ value: 12, label: "vs last month", positive: true }}
        />
        <StatsCard
          title="Upcoming Tours"
          value={acceptedCount}
          icon={Calendar}
          description={`${acceptedCount} accepted bookings`}
          trend={{
            value: acceptedCount >= 0 ? 8 : 0,
            label: "vs last month",
            positive: true,
          }}
        />
        <StatsCard
          title="Average Rating"
          value={myGuide?.rating?.toFixed(1) ?? "0.0"}
          icon={Star}
          description={`${myGuide?.totalReviews ?? 0} reviews`}
          trend={{ value: 2, label: "since last month", positive: true }}
        />
        <StatsCard
          title="Total Bookings"
          value={bookings.length}
          icon={TrendingUp}
          description={`${rejectedCount} rejected • ${cancelledCount} cancelled`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Chart */}
        <Card className="lg:col-span-2 bg-card border border-border">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>
              Revenue trend over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.03 240)"
                />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" />
                <YAxis stroke="oklch(0.65 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 240)",
                    border: "1px solid oklch(0.25 0.03 240)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="oklch(0.65 0.2 262)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Pie Chart */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution of bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 240)",
                    border: "1px solid oklch(0.25 0.03 240)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Earnings & Recent Bookings */}
      <div className="">
        {/* Weekly Earnings */}
        {/* <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Weekly Earnings</CardTitle>
            <CardDescription>This month's weekly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData || []}>
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
        </Card> */}

        {/* Recent Bookings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest booking requests</CardDescription>
              </div>
              <Link href="/guide/dashboard/bookings">
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
                  key={booking.id}
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
                      {booking.startTime} • Group of {booking.groupSize} people
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {booking.dropoffLocation}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <p className="text-sm font-semibold text-foreground">
                      ${booking.totalPrice}
                    </p>

                    {/* Action Buttons based on status */}
                    {booking.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                          onClick={() =>
                            handleStatusChange(booking.id, "ACCEPTED")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 text-xs px-2 py-1 h-7"
                          onClick={() =>
                            handleStatusChange(booking.id, "REJECTED")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {booking.status === "ACCEPTED" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-7"
                        onClick={() =>
                          handleStatusChange(booking.id, "COMPLETED")
                        }
                      >
                        Complete
                      </Button>
                    )}

                    {/* View Details button for all statuses */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2 py-1 h-7 text-primary hover:text-primary/80"
                      onClick={() => handleViewDetails(booking)}
                    >
                      View Details
                    </Button>
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
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              Feedback from your recent bookings
            </CardDescription>
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
    </div>
  );
}

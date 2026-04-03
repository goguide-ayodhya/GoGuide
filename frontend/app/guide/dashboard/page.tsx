"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { GuideAvailabilityToggle } from "@/components/guide-availability-toggle";
import { GuideStatusCard } from "@/components/guide-status-card";
import { BookingDetailsModal } from "@/components/booking-details-modal";
import { acceptBookingApi, rejectBookingApi } from "@/lib/api/bookings";
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
} from "lucide-react";
import { Booking } from "@/contexts/BookingsContext";
import Link from "next/link";
import { useGuide } from "@/contexts/GuideContext";
import { useEarnings } from "@/contexts/EarningContext";
import { useBooking } from "@/contexts/BookingsContext";

export default function DashboardPage() {
  const { myGuide } = useGuide();
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const { bookings } = useBooking();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentBookings = bookings.slice(0, 5);
  const newBookings = bookings.filter((b) => b.status === "PENDING");

  const handleViewDetails = (booking: Booking): void => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const { setBookings } = useBooking();
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      if (newStatus === "ACCEPTED") {
        await acceptBookingApi(bookingId);
      } else if (newStatus === "REJECTED") {
        await rejectBookingApi(bookingId);
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
  useEffect(() => {
    earningsContext?.fetchEarnings();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your booking and earnings overview.
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GuideStatusCard />
        <GuideAvailabilityToggle />
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          handleStatusChange(booking.id, "CONFIRMED")
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
          value={`$${earnings?.totalEarnings?.toLocaleString() ?? 0}`}
          icon={DollarSign}
          description="This month"
          trend={{ value: 12, label: "vs last month", positive: true }}
        />
        <StatsCard
          title="Upcoming Tours"
          value={bookings.filter((b) => b.status === "ACCEPTED").length ?? 0}
          icon={Calendar}
          description="Next 30 days"
          trend={{ value: 8, label: "vs last month", positive: true }}
        />
        {/* <StatsCard
          title="Average Rating"
          value={earnings?.avgRating ?? 0}
          icon={Star}
          description="Based on reviews"
          trend={{ value: 2, label: "since last month", positive: true }}
        /> */}
        <StatsCard
          title="Total Bookings"
          value={bookings.length}
          icon={TrendingUp}
          description="All time"
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
            {/* <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
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
            </ResponsiveContainer> */}
          </CardContent>
        </Card>

        {/* Booking Status Pie Chart */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution of bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <ResponsiveContainer width="100%" height={300}>
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
            </ResponsiveContainer> */}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Earnings & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Earnings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Weekly Earnings</CardTitle>
            <CardDescription>This month's weekly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
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
            </ResponsiveContainer> */}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest booking requests</CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          {/* <CardContent>
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
                      {booking.groupSize} people
                    </p>
                  </div>
                  <div className="text-right">
                    <BookingStatusBadge status={booking.status} />
                    <p className="text-sm font-semibold text-foreground mt-2">
                      ${booking.totalPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent> */}
        </Card>
      </div>

      {/* Recent Reviews */}
      {/* {mockReviews.length > 0 && (
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              Feedback from your recent bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReviews.map((review) => (
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
                      {review.createdAt}
                    </span>
                  </div>
                  <p className="text-foreground">{review.comments}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useEarnings } from "@/contexts/EarningContext";

export default function EarningsPage() {
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const [timeframe, setTimeframe] = useState<"week" | "month">("month");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground mt-2">
          Track your revenue and payment history
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`$${earnings?.totalEarnings.toLocaleString() ?? 0}`}
          icon={DollarSign}
          description="All time"
        />
        <StatsCard
          title={`This ${timeframe === "week" ? "Month" : "Month"} Revenue`}
          value={`$${earnings?.bookingStats.total.toLocaleString() || 0}`}
          icon={TrendingUp}
          description={`Average per ${timeframe === "week" ? "week" : "week"}: $${earnings?.bookingStats.completed || 0}`}
        />
        <StatsCard
          title="Pending Payments"
          value={`$${earnings?.pendingAmount.toLocaleString() || 0}`}
          icon={Calendar}
          description="Awaiting processing"
        />
      </div>

      {/* Booking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {earnings?.bookingStats.total || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              All bookings received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Completed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {earnings?.bookingStats.completed || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tours completed successfully
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              Pending Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {earnings?.bookingStats.pending || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Awaiting acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Earnings Trend</CardTitle>
              <CardDescription>
                {timeframe === "week" ? "Weekly" : "Monthly"} revenue analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeframe === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("week")}
                className={
                  timeframe === "week"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                Weekly
              </Button>
              <Button
                variant={timeframe === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("month")}
                className={
                  timeframe === "month"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        {/* <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.03 240)"
              />
              <XAxis
                dataKey={timeframe === "week" ? "week" : "month"}
                stroke="oklch(0.65 0 0)"
              />
              <YAxis stroke="oklch(0.65 0 0)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.15 0.02 240)",
                  border: "1px solid oklch(0.25 0.03 240)",
                  borderRadius: "8px",
                }}
                formatter={(value) => `$${value}`}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="oklch(0.72 0.2 29)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent> */}
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
            <CardDescription>Current payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["completed", "pending", "failed"].map((status) => {
                const payments = earnings?.recentTransactions.filter(
                  (p) => p.status === (status as any),
                );
                const total =
                  payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                const percentage =
                  Math.round((total / (earnings?.totalEarnings || 1)) * 100) ||
                  0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground capitalize">
                        {status}
                      </p>
                      <span className="text-sm font-semibold text-foreground">
                        ${total}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          status === "completed"
                            ? "bg-green-500"
                            : status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Earning Days */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Revenue by Tour Type</CardTitle>
            <CardDescription>Earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Historical Tours", revenue: 3200, bookings: 12 },
                { type: "Adventure Tours", revenue: 2800, bookings: 10 },
                { type: "Food & Wine Tours", revenue: 3600, bookings: 8 },
                { type: "Cultural Tours", revenue: 2400, bookings: 9 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.bookings} bookings
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    ${item.revenue}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {earnings?.recentTransactions.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/50 hover:bg-secondary/30"
                  >
                    <td className="py-3 px-4 text-foreground">
                      TXN-{payment.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ${payment.amount}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {new Date(payment.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-500/20 text-green-600"
                            : payment.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-red-500/20 text-red-600"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  Banknote,
} from "lucide-react";
import { useEarnings } from "@/contexts/EarningContext";

import { Badge } from "@/components/ui/badge";
import {
  getPayoutHistoryApi,
  getPayoutSummaryApi,
  confirmPayoutApi,
  PayoutWalletSummary,
} from "@/lib/api/payout";

export default function EarningsPage() {
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const [timeframe, setTimeframe] = useState<"week" | "month">("month");
  const [wallet, setWallet] = useState<PayoutWalletSummary | null>(null);
  const [payoutRows, setPayoutRows] = useState<
    Array<{
      _id: string;
      amount: number;
      status: string;
      createdAt: string;
      confirmedAt?: string;
    }>
  >([]);
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const monthlyData = earningsContext?.monthlyData ?? [];
  const weeklyData = earningsContext?.weeklyData ?? [];
  const chartData = timeframe === "week" ? weeklyData : monthlyData;
  const bookingStats = earnings?.bookingStats ?? {
    total: 0,
    completed: 0,
    pending: 0,
  };
  const totalEarnings = earnings?.totalEarnings ?? 0;
  const pendingAmount = earnings?.pendingAmount ?? 0;
  const recentTransactions = earnings?.recentTransactions ?? [];
  const revenueByTourType = earnings?.revenueByTourType ?? [];
  const timeframeLabel = timeframe === "week" ? "Week" : "Month";
  const averageRevenue = chartData.length
    ? Math.round(
        chartData.reduce((sum, item) => sum + item.revenue, 0) /
          chartData.length,
      )
    : 0;

  // Calculate current timeframe revenue
  const currentTimeframeRevenue =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.revenue, 0)
      : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, h] = await Promise.all([
          getPayoutSummaryApi(),
          getPayoutHistoryApi(),
        ]);
        if (!cancelled) {
          setWallet(s);
          setPayoutRows(Array.isArray(h) ? h : []);
        }
      } catch (e) {
        console.error("Payout summary failed", e);
      } finally {
        if (!cancelled) setPayoutLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmPayout = async (payoutId: string) => {
    setConfirmingId(payoutId);
    try {
      await confirmPayoutApi(payoutId);
      const [s, h] = await Promise.all([
        getPayoutSummaryApi(),
        getPayoutHistoryApi(),
      ]);
      setWallet(s);
      setPayoutRows(Array.isArray(h) ? h : []);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground mt-2">
          Track your revenue and payment history (70% guide share after full
          payment).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          description="All time earnings"
        />
        <StatsCard
          title={`${timeframeLabel} Revenue`}
          value={`₹${currentTimeframeRevenue.toLocaleString()}`}
          icon={TrendingUp}
          description={`Average per ${timeframeLabel.toLowerCase()}: ₹${averageRevenue.toLocaleString()}`}
        />
        <StatsCard
          title="Pending Payments"
          value={`₹${pendingAmount.toLocaleString()}`}
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
              {bookingStats.total}
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
              {bookingStats.completed}
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
              {bookingStats.pending}
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
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData as any}>
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
                  formatter={(value) => `₹${value}`}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="oklch(0.72 0.2 29)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No earnings data available for the selected timeframe.
            </div>
          )}
        </CardContent>
      </Card>

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
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border/50 hover:bg-secondary/30"
                    >
                      <td className="py-3 px-4 text-foreground">
                        TXN-{payment.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        ₹{payment.amount}
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

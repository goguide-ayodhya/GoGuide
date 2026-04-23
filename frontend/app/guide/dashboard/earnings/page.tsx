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
  AlertCircle,
} from "lucide-react";
import { useEarnings } from "@/contexts/EarningContext";
import {
  getPayoutSummaryApi,
  getPayoutHistoryApi,
  confirmPayoutApi,
  type PayoutWalletSummary,
} from "@/lib/api/payout";
import { Badge } from "@/components/ui/badge";

export default function EarningsPage() {
  const earningsContext = useEarnings();
  const earnings = earningsContext?.earnings;
  const loading = earningsContext?.loading ?? false;
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
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const monthlyData = earningsContext?.monthlyData ?? [];
  const weeklyData = earningsContext?.weeklyData ?? [];
  const chartData =
    timeframe === "week"
      ? weeklyData.map((item) => ({ period: item.week, revenue: item.revenue }))
      : monthlyData.map((item) => ({
          period: item.month,
          revenue: item.revenue,
        }));
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

  // Fetch earnings data on mount
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (earningsContext?.fetchEarnings) {
          await earningsContext.fetchEarnings();
          await earningsContext.fetchMonthlyEarnings();
          await earningsContext.fetchWeeklyEarnings();
        }
      } catch (e) {
        console.error("Failed to fetch earnings", e);
      }
    };
    fetchEarnings();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPayoutError(null);
        const [s, h] = await Promise.all([
          getPayoutSummaryApi(),
          getPayoutHistoryApi(),
        ]);
        if (!cancelled) {
          setWallet(s);
          setPayoutRows(
            (Array.isArray(h) ? h : []).sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
      } catch (e) {
        console.error("Payout summary failed", e);
        if (!cancelled) {
          setPayoutError(
            e instanceof Error ? e.message : "Failed to load payout info",
          );
        }
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
      setPayoutRows(
        (Array.isArray(h) ? h : []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (e) {
      console.error("Failed to confirm payout", e);
      window.alert(e instanceof Error ? e.message : "Failed to confirm payout");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRefreshPayouts = async () => {
    setPayoutLoading(true);
    setPayoutError(null);
    try {
      const [s, h] = await Promise.all([
        getPayoutSummaryApi(),
        getPayoutHistoryApi(),
      ]);
      setWallet(s);
      setPayoutRows(
        (Array.isArray(h) ? h : []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (e) {
      console.error("Failed to refresh payouts", e);
      setPayoutError(
        e instanceof Error ? e.message : "Failed to refresh payout info",
      );
    } finally {
      setPayoutLoading(false);
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

      {/* Platform payout wallet */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Payouts (70% share)
              </CardTitle>
              <CardDescription>
                Admin sends transfers; confirm here when you receive the
                payment.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshPayouts}
              disabled={payoutLoading}
            >
              {payoutLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {payoutError && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle
                size={18}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Failed to load payout info
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                  {payoutError}
                </p>
              </div>
            </div>
          )}

          {payoutLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading payout info…
            </p>
          ) : wallet ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">
                  Total earnings (accrued)
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{wallet.totalEarnings.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">
                  Available for next payout
                </p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  ₹{wallet.availableForPayout.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Admin can send up to this (70% share, minus pending sends)
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Paid out</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ₹{wallet.paidOut.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ) : null}

          {wallet && wallet.pendingConfirmation > 0 && (
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              ₹{wallet.pendingConfirmation.toLocaleString("en-IN")} in payouts
              waiting for your confirmation.
            </p>
          )}

          {payoutRows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Sent</th>
                    <th className="p-3 font-medium">Confirmed</th>
                    <th className="p-3 font-medium w-[180px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {payoutRows.map((row) => (
                    <tr key={row._id} className="border-b border-border/60">
                      <td className="p-3 font-semibold">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            row.status === "COMPLETED" ? "default" : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {row.confirmedAt
                          ? new Date(row.confirmedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-3">
                        {row.status === "PENDING" && (
                          <Button
                            size="sm"
                            className="bg-primary"
                            disabled={confirmingId === row._id}
                            onClick={() => handleConfirmPayout(row._id)}
                          >
                            {confirmingId === row._id
                              ? "Confirming…"
                              : "Confirm payment received"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
              <BarChart data={chartData || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.03 240)"
                />
                <XAxis dataKey="period" stroke="oklch(0.65 0 0)" />
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
                const payments = recentTransactions.filter(
                  (p) => p.status === status,
                );
                const total =
                  payments.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
                const percentage =
                  Math.round((total / (totalEarnings || 1)) * 100) || 0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground capitalize">
                        {status} ({payments.length})
                      </p>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{total.toLocaleString()}
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

        {/* Revenue by Tour Type */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Revenue by Tour Type</CardTitle>
            <CardDescription>
              Earnings breakdown by tour category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByTourType.length > 0 ? (
                revenueByTourType.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pb-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.bookings} booking{item.bookings !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      ₹{item.revenue.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No tour type data available yet.
                </div>
              )}
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
                        ₹
                        {(
                          payment.amount ??
                          payment.amountPaid ??
                          0
                        ).toLocaleString()}
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

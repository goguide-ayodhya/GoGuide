"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  Clock,
  Wallet,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { getAdminPaymentsSummaryApi } from "@/lib/api/payments";

type Summary = {
  totalRevenue: number;
  totalPendingAmount: number;
  pendingBookingsCount: number;
  codPendingCount: number;
  totalBookings: number;
  completedPaymentsCount: number;
  recentPayments: Array<{
    _id: string;
    amount?: number;
    amountPaid?: number;
    paymentMethod?: string;
    paidAt?: string;
    createdAt?: string;
    bookingId?: {
      touristName?: string;
      tourType?: string;
    } | null;
  }>;
};

export default function PaymentsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminPaymentsSummaryApi();
        if (!cancelled) setSummary(data as Summary);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load summary");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading payment summary…
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-destructive text-sm">
        {error || "No data"}
      </div>
    );
  }

  const lineAmount = (p: Summary["recentPayments"][0]) =>
    p.amount || p.amountPaid || (p as any).paidAmount || p.bookingId?.finalPrice || p.bookingId?.totalPrice || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Payment Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Revenue, pending balances, and recent completed payments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  ₹{Math.round(summary.totalRevenue).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Pending Payments
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">
                  ₹{Math.round(summary.totalPendingAmount).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {summary.pendingBookingsCount} booking
                  {summary.pendingBookingsCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Cash Pending
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">
                  {summary.codPendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Completed Payments
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">
                  {summary.completedPaymentsCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {summary.totalBookings} total bookings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent completed payments</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Last {summary.recentPayments.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">
                    Method
                  </th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">
                    Tourist
                  </th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">
                    Tour
                  </th>
                  <th className="py-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No completed payments yet
                    </td>
                  </tr>
                ) : (
                  summary.recentPayments.map((p) => (
                    <tr key={p._id} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-medium">
                        ₹{lineAmount(p).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{p.paymentMethod ?? "—"}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {p.bookingId?.touristName ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {p.bookingId?.tourType ?? "—"}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleString()
                          : p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {summary.recentPayments.map((p) => (
              <div
                key={p._id}
                className="p-3 rounded-lg border border-border flex justify-between gap-2"
              >
                <div>
                  <p className="font-semibold">
                    ₹{lineAmount(p).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.bookingId?.touristName}
                  </p>
                </div>
                <Badge variant="outline">{p.paymentMethod}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

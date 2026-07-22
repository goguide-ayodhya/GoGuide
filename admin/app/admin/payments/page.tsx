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
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  Clock,
  Wallet,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { getAdminPaymentsSummaryApi, markAllPaymentsAsReadApi } from "@/lib/api/payments";

type Summary = {
  totalRevenue: number;
  totalPendingAmount: number;
  pendingBookingsCount: number;
  codPendingCount: number;
  totalBookings: number;
  completedPaymentsCount: number;
  unseenCount?: number;
  recentPayments: Array<{
    _id: string;
    amount?: number;
    amountPaid?: number;
    paymentMethod?: string;
    paidAt?: string;
    createdAt?: string;
    status?: string;
    bookingType?: "Cab" | "Guide" | "Package";
    touristName?: string;
    isNew?: boolean;
    bookingId?: {
      touristName?: string;
      tourType?: string;
      finalPrice?: number;
      totalPrice?: number;
    } | null;
  }>;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalPaymentsCount: number;
  };
};

export default function PaymentsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const fetchSummary = async (targetPage: number) => {
    setLoading(true);
    try {
      const data = await getAdminPaymentsSummaryApi(targetPage, 20);
      setSummary(data as Summary);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(page);
  }, [page]);

  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      await markAllPaymentsAsReadApi();
      await fetchSummary(page);
    } catch (e) {
      console.error("Failed to mark payments as read:", e);
    } finally {
      setIsMarkingRead(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading payment summary…
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-destructive text-sm p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        {error || "No data available."}
      </div>
    );
  }

  const lineAmount = (p: Summary["recentPayments"][0]) =>
    p.amount || p.amountPaid || (p as any).paidAmount || p.bookingId?.finalPrice || p.bookingId?.totalPrice || 0;

  const hasNewPayments = (summary?.unseenCount ?? 0) > 0 || summary?.recentPayments?.some((p) => p.isNew);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Payment Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Revenue, pending balances, and recent payments.
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
        <CardHeader className="pb-2 sm:pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm sm:text-base">Recent Payments Records</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Page {summary.pagination?.page || page} of {summary.pagination?.totalPages || 1} ({summary.pagination?.totalPaymentsCount || summary.recentPayments.length} total)
            </CardDescription>
          </div>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingRead || !hasNewPayments}
            variant="outline"
            size="sm"
            className={`font-semibold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm transition shrink-0 ${
              hasNewPayments
                ? "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
            }`}
          >
            {isMarkingRead ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            <span>Mark All as Read</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2.5 pr-4 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="py-2.5 pr-4 font-medium text-muted-foreground">
                    Booking Type
                  </th>
                  <th className="py-2.5 pr-4 font-medium text-muted-foreground">
                    Method
                  </th>
                  <th className="py-2.5 pr-4 font-medium text-muted-foreground">
                    Tourist
                  </th>
                  <th className="py-2.5 pr-4 font-medium text-muted-foreground">
                    Status / New
                  </th>
                  <th className="py-2.5 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  summary.recentPayments.map((p) => {
                    const bType = p.bookingType || (p.bookingId?.tourType === "Package Tour" ? "Package" : "Guide");
                    const tName = p.touristName || p.bookingId?.touristName || "—";

                    return (
                      <tr key={p._id} className="border-b border-border/60 hover:bg-slate-50/50 transition">
                        <td className="py-3 pr-4 font-bold text-foreground">
                          ₹{lineAmount(p).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={
                            bType === "Cab" 
                              ? "bg-amber-50 text-amber-700 border-amber-200" 
                              : bType === "Guide" 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }>
                            {bType}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">{p.paymentMethod ?? "RAZORPAY"}</Badge>
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {tName}
                        </td>
                        <td className="py-3 pr-4">
                          {p.isNew ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 animate-pulse">
                              NEW
                            </Badge>
                          ) : p.status === "COMPLETED" ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[11px]">
                              {p.status || "Pending"}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleString()
                            : p.createdAt
                              ? new Date(p.createdAt).toLocaleString()
                              : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {summary.recentPayments.map((p) => {
              const bType = p.bookingType || "Guide";
              const tName = p.touristName || p.bookingId?.touristName || "—";

              return (
                <div
                  key={p._id}
                  className="p-3 rounded-xl border border-border flex justify-between items-center gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        ₹{lineAmount(p).toLocaleString("en-IN")}
                      </p>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {bType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.isNew ? (
                      <Badge className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5">
                        NEW
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">{p.status || "Completed"}</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">{p.paymentMethod || "RAZORPAY"}</Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="pt-4 border-t border-border mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {summary.recentPayments.length === 0 ? 0 : ((summary.pagination?.page || page) - 1) * 20 + 1} -{" "}
              {Math.min(
                (summary.pagination?.page || page) * 20,
                summary.pagination?.totalPaymentsCount || summary.recentPayments.length
              )}{" "}
              of {summary.pagination?.totalPaymentsCount || summary.recentPayments.length} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="h-8 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <span className="font-semibold text-foreground px-2">
                Page {summary.pagination?.page || page} of {summary.pagination?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (summary.pagination?.totalPages || 1) || loading}
                onClick={() => setPage((prev) => Math.min(summary.pagination?.totalPages || 1, prev + 1))}
                className="h-8 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

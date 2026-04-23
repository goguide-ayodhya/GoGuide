"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Banknote, RefreshCw } from "lucide-react";
import {
  getPayoutSummaryApi,
  getPayoutHistoryApi,
  confirmPayoutApi,
  type PayoutWalletSummary,
} from "@/lib/api/payout";

export default function PayoutsPage() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    setLoading(true);
    setError(null);
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
      console.error("Failed to fetch payout data", e);
      setError(e instanceof Error ? e.message : "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayout = async (payoutId: string) => {
    setConfirmingId(payoutId);
    try {
      await confirmPayoutApi(payoutId);
      // Refresh data after confirmation
      await fetchPayoutData();
      window.alert("Payout confirmed successfully");
    } catch (e) {
      console.error("Failed to confirm payout", e);
      window.alert(
        e instanceof Error ? e.message : "Failed to confirm payout"
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const stats = {
    totalEarnings: wallet?.totalEarnings ?? 0,
    paidOut: wallet?.paidOut ?? 0,
    pendingConfirmation: wallet?.pendingConfirmation ?? 0,
    availableForPayout: wallet?.availableForPayout ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground mt-2">
          Track your payout wallet and confirm payments received (70% share)
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">
              Failed to load payout data
            </p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPayoutData}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Loading payout data...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Wallet Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Earnings (Accrued)
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      ₹{stats.totalEarnings.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Paid Out
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      ₹{stats.paidOut.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pending Confirmation
                    </p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                      ₹{stats.pendingConfirmation.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Available for Next Payout
                    </p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      ₹{stats.availableForPayout.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      After 70% share & pending sends
                    </p>
                  </div>
                  <Banknote size={24} className="text-primary/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Note */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-200">
                    How Payouts Work
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-300 mt-2 space-y-1 ml-4 list-disc">
                    <li>Admin sends payouts to your configured account</li>
                    <li>You receive 70% of completed bookings after platform fees</li>
                    <li>Confirm here once you receive the payment</li>
                    <li>Pending confirmation amount shows what's waiting for your confirmation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>
                    {payoutRows.length} payout{payoutRows.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchPayoutData}
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payoutRows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payouts yet
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="p-3 text-left font-medium">Amount</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Sent Date</th>
                        <th className="p-3 text-left font-medium">Confirmed Date</th>
                        <th className="p-3 text-left font-medium w-[200px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutRows.map((row) => (
                        <tr
                          key={row._id}
                          className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 font-semibold text-foreground">
                            ₹{row.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                row.status === "COMPLETED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {new Date(row.createdAt).toLocaleString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {row.confirmedAt
                              ? new Date(row.confirmedAt).toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="p-3">
                            {row.status === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayout(row._id)}
                                disabled={confirmingId === row._id}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {confirmingId === row._id
                                  ? "Confirming..."
                                  : "Confirm Received"}
                              </Button>
                            )}
                            {row.status === "COMPLETED" && (
                              <Badge variant="outline" className="text-green-700">
                                Confirmed
                              </Badge>
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
        </>
      )}
    </div>
  );
}

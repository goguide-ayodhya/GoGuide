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
import {
  AlertCircle,
  Banknote,
  RefreshCw,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useDriver } from "@/contexts/DriverContext";
import {
  getDriverWalletApi,
  getDriverPaymentHistoryApi,
} from "@/lib/api/finance";
import TouristLoader from "@/components/common/TouristLoader";

interface DriverWallet {
  driverId: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
}

interface CommissionPayment {
  _id: string;
  driverId: string;
  amount: number;
  commissionPercent: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdBy?: any;
  confirmedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PayoutsPage() {
  const { myDriver, loading: driverLoading } = useDriver();

  const [wallet, setWallet] = useState<DriverWallet | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (myDriver?.id) {
      fetchPayoutData();
    } else if (!driverLoading) {
      setLoading(false);
      setError("Unable to load driver profile. Please refresh the page.");
    }
  }, [myDriver?.id, driverLoading]);

  const fetchPayoutData = async () => {
    if (!myDriver?.id) {
      setError("Driver ID not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use driver._id which is mapped to myDriver.id
      console.log("[PAYOUTS] Fetching data for driver ID:", myDriver.id);

      const [walletData, historyData] = await Promise.all([
        getDriverWalletApi(myDriver.id),
        getDriverPaymentHistoryApi(myDriver.id),
      ]);

      setWallet(walletData);
      setPaymentHistory(
        (Array.isArray(historyData) ? historyData : []).sort(
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

  const stats = {
    totalEarned: wallet?.totalEarned ?? 0,
    adminCommissionGenerated: wallet?.adminCommissionGenerated ?? 0,
    adminCommissionPaid: wallet?.adminCommissionPaid ?? 0,
    pendingAdminCommission: wallet?.pendingAdminCommission ?? 0,
    netEarnings:
      (wallet?.totalEarned ?? 0) - (wallet?.adminCommissionGenerated ?? 0),
  };

  if (driverLoading) {
    return <TouristLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Financial Summary
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings, commissions, and payment history
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">
              Failed to load financial data
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
        <TouristLoader text="Loading financial data..." />
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Earned */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      ₹{stats.totalEarned.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-primary/50" />
                </div>
              </CardContent>
            </Card>

            {/* Admin Commission Generated */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Admin Commission Generated
                    </p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                      ₹{stats.adminCommissionGenerated.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            {/* Admin Commission Paid */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Paid to Admin
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      ₹{stats.adminCommissionPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Admin Commission */}
            <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pending Admin Commission
                    </p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      ₹{stats.pendingAdminCommission.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <DollarSign size={24} className="text-primary/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Earnings Summary */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Total Earned (Gross)
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    ₹{stats.totalEarned.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Admin Commission (Generated)
                  </span>
                  <span className="text-lg font-semibold text-amber-600">
                    - ₹{stats.adminCommissionGenerated.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">
                    Your Net Earnings (After Commission)
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{stats.netEarnings.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Breakdown Info */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-200">
                    Commission Breakdown
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                    <li>
                      <strong>Total Earned:</strong> All rides earnings combined
                    </li>
                    <li>
                      <strong>Admin Commission Generated:</strong> Commission
                      owed to admin
                    </li>
                    <li>
                      <strong>Paid to Admin:</strong> Commission already
                      transferred
                    </li>
                    <li>
                      <strong>Pending Admin Commission:</strong> Commission
                      still owed
                    </li>
                    <li>
                      <strong>Your Net Earnings:</strong> Total Earned - Admin
                      Commission Generated
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission Payment History</CardTitle>
                  <CardDescription>
                    {paymentHistory.length} payment
                    {paymentHistory.length !== 1 ? "s" : ""}
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
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commission payments yet
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="p-3 text-left font-medium">Amount</th>
                        <th className="p-3 text-left font-medium">
                          Commission %
                        </th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">
                          Created Date
                        </th>
                        <th className="p-3 text-left font-medium">
                          Confirmed Date
                        </th>
                        <th className="p-3 text-left font-medium">Note</th>
                        <th className="p-3 text-left font-medium">
                          Recorded By
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr
                          key={payment._id}
                          className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 font-semibold text-foreground">
                            ₹{payment.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {payment.commissionPercent}%
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                payment.status === "CONFIRMED"
                                  ? "default"
                                  : payment.status === "CANCELLED"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {new Date(payment.createdAt).toLocaleString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {payment.confirmedAt
                              ? new Date(payment.confirmedAt).toLocaleString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "—"}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">
                            {payment.note || "—"}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {payment.createdBy?.name || "Admin"}
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

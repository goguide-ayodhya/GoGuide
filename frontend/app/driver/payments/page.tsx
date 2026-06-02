"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import {
  getDriverWalletApi,
  getDriverPaymentHistoryApi,
} from "../../../lib/api/finance";
import { useAuth } from "@/contexts/AuthContext";

type Wallet = {
  driverId: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
};

type PaymentRecord = {
  _id: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  confirmedAt?: string;
  note?: string;
  createdBy?: { name?: string; email?: string };
};

export default function DriverPaymentHistoryPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletData, paymentData] = await Promise.all([
        getDriverWalletApi(user?.id || ""),
        getDriverPaymentHistoryApi(user?.id || ""),
      ]);
      setWallet(walletData);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading payment information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Commission & Payments
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings and admin commission obligations.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Financial Summary */}
      {wallet && (
        <>
          {/* Main Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ₹{wallet.totalEarned.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  All earnings from completed rides
                </p>
              </CardContent>
            </Card>

            {/* Commission Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="w-5 h-5" />
                  Commission Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Commission Generated:
                  </span>
                  <span className="font-medium">
                    ₹{wallet.adminCommissionGenerated.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Already Paid to Admin:
                  </span>
                  <span className="font-medium text-green-600">
                    ₹{wallet.adminCommissionPaid.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      Pending Payment:
                    </span>
                    <Badge
                      variant={
                        wallet.pendingAdminCommission > 0
                          ? "default"
                          : "secondary"
                      }
                    >
                      ₹{wallet.pendingAdminCommission.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Percentage Info */}
          <Card className="border-border bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-sm">How Commission Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Your Total Earnings:
                </span>
                <span className="font-medium">
                  ₹{wallet.totalEarned.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Less Admin Commission:
                </span>
                <span className="font-medium">
                  -₹{wallet.adminCommissionGenerated.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-800 pt-3 flex justify-between font-semibold">
                <span>Your Net Earnings:</span>
                <span>
                  ₹
                  {Math.max(
                    0,
                    wallet.totalEarned - wallet.adminCommissionGenerated,
                  ).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {payments.length} transaction{payments.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment records yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </span>
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
                      </div>
                      {payment.note && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Note: {payment.note}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          Created:{" "}
                          {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                        {payment.confirmedAt && (
                          <p>
                            Confirmed:{" "}
                            {new Date(payment.confirmedAt).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(payment.confirmedAt).toLocaleTimeString()}
                          </p>
                        )}
                        {payment.createdBy?.name && (
                          <p>By: {payment.createdBy.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Banknote,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDriver } from "@/contexts/DriverContext";
import {
  getDriverWalletApi,
  getDriverPaymentHistoryApi,
  submitCommissionPaymentRequestApi,
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "CONFIRMED" | "CANCELLED";
  requestedBy?: "DRIVER" | "ADMIN";
  transactionReference?: string;
  notes?: string;
  rejectionReason?: string;
  createdBy?: any;
  approvedBy?: any;
  approvedAt?: string;
  confirmedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10 border-green-500/30" },
  CONFIRMED: { label: "Confirmed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10 border-green-500/30" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-500/10 border-red-500/30" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted/20 border-border" },
};

export default function PayoutsPage() {
  const { myDriver, loading: driverLoading } = useDriver();

  const [wallet, setWallet] = useState<DriverWallet | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Commission request form
  const [showForm, setShowForm] = useState(false);
  const [reqAmount, setReqAmount] = useState("");
  const [reqRef, setReqRef] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Expandable rejection reason
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (myDriver?.id) {
      fetchPayoutData();
    } else if (!driverLoading) {
      setLoading(false);
      setError("Unable to load driver profile. Please refresh the page.");
    }
  }, [myDriver?.id, driverLoading]);

  const fetchPayoutData = async () => {
    if (!myDriver?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [walletData, historyData] = await Promise.all([
        getDriverWalletApi(myDriver.id),
        getDriverPaymentHistoryApi(myDriver.id),
      ]);
      setWallet(walletData);
      setPaymentHistory(
        (Array.isArray(historyData) ? historyData : []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  const hasPendingRequest = paymentHistory.some(
    (p) => p.status === "PENDING" && p.requestedBy === "DRIVER"
  );

  const handleSubmitRequest = async () => {
    if (!reqAmount || !reqRef.trim()) {
      setSubmitError("Amount and transaction reference are required");
      return;
    }
    const amount = Number(reqAmount);
    if (isNaN(amount) || amount <= 0) {
      setSubmitError("Enter a valid amount");
      return;
    }
    const pending = wallet?.pendingAdminCommission ?? 0;
    if (amount > pending) {
      setSubmitError(`Amount exceeds pending commission (₹${pending.toLocaleString("en-IN")})`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCommissionPaymentRequestApi(amount, reqRef.trim(), reqNotes.trim() || undefined);
      setSubmitSuccess(`✅ Payment request for ₹${amount.toLocaleString("en-IN")} submitted successfully. Admin will review shortly.`);
      setShowForm(false);
      setReqAmount("");
      setReqRef("");
      setReqNotes("");
      await fetchPayoutData();
      setTimeout(() => setSubmitSuccess(null), 6000);
    } catch (e: any) {
      setSubmitError(e.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    totalEarned: wallet?.totalEarned ?? 0,
    adminCommissionGenerated: wallet?.adminCommissionGenerated ?? 0,
    adminCommissionPaid: wallet?.adminCommissionPaid ?? 0,
    pendingAdminCommission: wallet?.pendingAdminCommission ?? 0,
    netEarnings: (wallet?.totalEarned ?? 0) - (wallet?.adminCommissionGenerated ?? 0),
  };

  if (driverLoading) return <TouristLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Summary</h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings, commissions, and payment history
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">Failed to load financial data</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchPayoutData} className="mt-3">Try Again</Button>
          </div>
        </div>
      )}

      {loading ? (
        <TouristLoader text="Loading financial data..." />
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      ₹{stats.totalEarned.toLocaleString("en-IN")}
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
                    <p className="text-xs text-muted-foreground">Admin Commission (Total)</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                      ₹{stats.adminCommissionGenerated.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Paid to Admin</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      ₹{stats.adminCommissionPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Banknote size={24} className="text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Commission</p>
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
                  <span className="text-sm font-medium text-foreground">Total Earned (Gross)</span>
                  <span className="text-lg font-bold text-foreground">₹{stats.totalEarned.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Admin Commission (Generated)</span>
                  <span className="text-lg font-semibold text-amber-600">- ₹{stats.adminCommissionGenerated.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">Your Net Earnings (After Commission)</span>
                  <span className="text-2xl font-bold text-green-600">₹{stats.netEarnings.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pay Admin Commission Section */}
          {stats.pendingAdminCommission > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Send size={20} />
                      Pay Admin Commission
                    </CardTitle>
                    <CardDescription className="mt-1">
                      You have <strong>₹{stats.pendingAdminCommission.toLocaleString("en-IN")}</strong> pending.
                      Submit a payment request after transferring to admin.
                    </CardDescription>
                  </div>
                  {!hasPendingRequest && (
                    <Button
                      size="sm"
                      onClick={() => setShowForm(!showForm)}
                      className="shrink-0"
                    >
                      {showForm ? <><ChevronUp size={16} className="mr-1" /> Cancel</> : <><Send size={16} className="mr-1" /> Submit Request</>}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {hasPendingRequest && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <Clock size={16} />
                    You have a pending payment request awaiting admin review. You can submit another once it is processed.
                  </div>
                </CardContent>
              )}

              {showForm && !hasPendingRequest && (
                <CardContent className="pt-0">
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Amount (Max: ₹{stats.pendingAdminCommission.toLocaleString("en-IN")})
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={stats.pendingAdminCommission}
                        value={reqAmount}
                        onChange={(e) => setReqAmount(e.target.value)}
                        placeholder="Enter amount paid"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Transaction Reference <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={reqRef}
                        onChange={(e) => setReqRef(e.target.value)}
                        placeholder="UPI ref / bank transaction ID / cheque no."
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Notes (Optional)
                      </label>
                      <Input
                        type="text"
                        value={reqNotes}
                        onChange={(e) => setReqNotes(e.target.value)}
                        placeholder="Any additional notes"
                        className="mt-2"
                      />
                    </div>

                    {submitError && (
                      <div className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {submitError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitRequest} disabled={submitting} className="flex-1">
                        {submitting ? (
                          <><RefreshCw size={16} className="mr-2 animate-spin" /> Submitting...</>
                        ) : (
                          <><Send size={16} className="mr-2" /> Submit Request</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Submit Success */}
          {submitSuccess && (
            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{submitSuccess}</p>
            </div>
          )}

          {/* Commission Breakdown Info */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-200">Commission Breakdown</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                    <li><strong>Total Earned:</strong> All rides earnings combined</li>
                    <li><strong>Admin Commission (Generated):</strong> Commission owed to admin</li>
                    <li><strong>Paid to Admin:</strong> Commission already transferred &amp; approved</li>
                    <li><strong>Pending Commission:</strong> Still owed — submit request after payment</li>
                    <li><strong>Your Net Earnings:</strong> Total Earned - Admin Commission Generated</li>
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
                    {paymentHistory.length} payment{paymentHistory.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={fetchPayoutData} disabled={loading}>
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No commission payments yet</div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => {
                    const cfg = statusConfig[payment.status] ?? statusConfig.CANCELLED;
                    const Icon = cfg.icon;
                    const isExpanded = expandedRow === payment._id;
                    return (
                      <div
                        key={payment._id}
                        className={`rounded-lg border p-4 transition-colors ${cfg.bg}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Icon size={20} className={cfg.color} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-foreground">
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </span>
                                <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                                  {cfg.label}
                                </Badge>
                                {payment.requestedBy && (
                                  <Badge variant="outline" className="text-xs">
                                    by {payment.requestedBy === "DRIVER" ? "You" : "Admin"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(payment.createdAt).toLocaleString("en-IN", {
                                  year: "numeric", month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                                {payment.transactionReference && (
                                  <span className="ml-2 text-foreground/70">
                                    · Ref: {payment.transactionReference}
                                  </span>
                                )}
                              </p>
                              {(payment.notes || payment.note) && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {payment.notes || payment.note}
                                </p>
                              )}
                            </div>
                          </div>

                          {payment.status === "REJECTED" && payment.rejectionReason && (
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : payment._id)}
                              className="text-xs text-red-600 flex items-center gap-1 shrink-0"
                            >
                              Reason
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                        </div>

                        {isExpanded && payment.rejectionReason && (
                          <div className="mt-3 text-sm text-red-700 dark:text-red-300 bg-red-500/10 rounded-md px-3 py-2 border border-red-500/20">
                            <strong>Rejection reason:</strong> {payment.rejectionReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

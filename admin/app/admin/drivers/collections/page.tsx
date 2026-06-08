"use client";

import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  Search,
} from "lucide-react";
import {
  getCommissionOverviewStatsApi,
  getAllCommissionRequestsApi,
  approveCommissionRequestApi,
  rejectCommissionRequestApi,
  getDriverCollectionOverviewApi,
} from "@/lib/api/finance";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface OverviewStats {
  totalGenerated: number;
  totalCollected: number;
  totalPending: number;
  driversWithDues: number;
  todayCollection: number;
  pendingRequestsCount: number;
}

interface CommissionRequest {
  _id: string;
  driverId: {
    _id: string;
    driverName?: string;
    userId?: { fullname?: { firstname?: string; lastname?: string }; email?: string };
  };
  amount: number;
  commissionPercent: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requestedBy?: "DRIVER" | "ADMIN";
  transactionReference?: string;
  notes?: string;
  rejectionReason?: string;
  approvedBy?: { fullname?: any; email?: string };
  approvedAt?: string;
  createdAt: string;
}

interface DriverOverview {
  driverId: string;
  driverName: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
  lastPaymentAt?: string;
}

type TabType = "PENDING" | "APPROVED" | "REJECTED" | "PRIORITY";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const getDriverDisplayName = (req: CommissionRequest): string => {
  const d = req.driverId;
  if (d?.driverName) return d.driverName;
  const fn = d?.userId?.fullname;
  if (fn?.firstname) return `${fn.firstname} ${fn.lastname || ""}`.trim();
  return "Unknown Driver";
};

export default function DriverCollectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [priorityList, setPriorityList] = useState<DriverOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Approve modal
  const [approving, setApproving] = useState<CommissionRequest | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Reject modal
  const [rejecting, setRejecting] = useState<CommissionRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ── Fetch overview stats ──────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getCommissionOverviewStatsApi();
      setStats(data);
    } catch (e: any) {
      console.error("Stats fetch error:", e.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch requests for active tab ──────────────────────
  const fetchRequests = useCallback(async (tab: TabType) => {
    if (tab === "PRIORITY") {
      setLoading(true);
      try {
        const data = await getDriverCollectionOverviewApi();
        setPriorityList(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const data = await getAllCommissionRequestsApi(tab);
        setRequests(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSearch("");
  };

  const handleRefresh = () => {
    fetchStats();
    fetchRequests(activeTab);
  };

  // ── Approve ───────────────────────────────────────────
  const handleApprove = async () => {
    if (!approving) return;
    setApproveLoading(true);
    setApproveError(null);
    try {
      await approveCommissionRequestApi(approving._id);
      showSuccess(`✅ Approved ₹${approving.amount.toLocaleString("en-IN")} from ${getDriverDisplayName(approving)}`);
      setApproving(null);
      await Promise.all([fetchStats(), fetchRequests(activeTab)]);
    } catch (e: any) {
      setApproveError(e.message || "Failed to approve");
    } finally {
      setApproveLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejecting || !rejectReason.trim()) {
      setRejectError("Rejection reason is required");
      return;
    }
    setRejectLoading(true);
    setRejectError(null);
    try {
      await rejectCommissionRequestApi(rejecting._id, rejectReason);
      showSuccess(`Rejected request from ${getDriverDisplayName(rejecting)}`);
      setRejecting(null);
      setRejectReason("");
      await Promise.all([fetchStats(), fetchRequests(activeTab)]);
    } catch (e: any) {
      setRejectError(e.message || "Failed to reject");
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Filter by search ──────────────────────────────────
  const filteredRequests = requests.filter((r) =>
    getDriverDisplayName(r).toLowerCase().includes(search.toLowerCase()) ||
    (r.transactionReference || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPriority = priorityList.filter((d) =>
    d.driverName.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "PENDING", label: "Pending", count: stats?.pendingRequestsCount },
    { id: "APPROVED", label: "Approved" },
    { id: "REJECTED", label: "Rejected" },
    { id: "PRIORITY", label: "Driver Priority List", count: stats?.driversWithDues },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Driver Commission Collections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Verify driver commission payments and track outstanding dues
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || statsLoading}>
          <RefreshCw size={16} className={(loading || statsLoading) ? "animate-spin mr-2" : "mr-2"} />
          Refresh
        </Button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-800 dark:text-green-200 text-sm">
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Generated</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {statsLoading ? "…" : `₹${(stats?.totalGenerated ?? 0).toLocaleString("en-IN")}`}
                </p>
              </div>
              <TrendingUp size={22} className="text-amber-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {statsLoading ? "…" : `₹${(stats?.totalCollected ?? 0).toLocaleString("en-IN")}`}
                </p>
              </div>
              <Banknote size={22} className="text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Pending</p>
                <p className="text-xl font-bold text-orange-600 mt-1">
                  {statsLoading ? "…" : `₹${(stats?.totalPending ?? 0).toLocaleString("en-IN")}`}
                </p>
              </div>
              <DollarSign size={22} className="text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Drivers with Dues</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {statsLoading ? "…" : stats?.driversWithDues ?? 0}
                </p>
              </div>
              <Users size={22} className="text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today's Collection</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {statsLoading ? "…" : `₹${(stats?.todayCollection ?? 0).toLocaleString("en-IN")}`}
                </p>
              </div>
              <Calendar size={22} className="text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-border pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search driver or ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-800 dark:text-red-200 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw size={20} className="animate-spin mr-3" />
          Loading...
        </div>
      ) : activeTab === "PRIORITY" ? (
        /* Priority List */
        <Card>
          <CardHeader>
            <CardTitle>Driver Priority List</CardTitle>
            <CardDescription>Drivers sorted by highest pending commission (only those with dues)</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPriority.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                🎉 No drivers with pending commission dues
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-4 font-medium text-muted-foreground">Driver</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Total Earned</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Commission Generated</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Paid to Admin</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Pending</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPriority.map((d) => (
                      <tr key={d.driverId} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium text-foreground">{d.driverName}</td>
                        <td className="py-3 px-4 text-right">₹{d.totalEarned.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-right text-amber-600 font-medium">₹{d.adminCommissionGenerated.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">₹{d.adminCommissionPaid.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={d.pendingAdminCommission > 0 ? "default" : "secondary"} className={d.pendingAdminCommission > 0 ? "bg-orange-500 hover:bg-orange-600" : ""}>
                            ₹{d.pendingAdminCommission.toLocaleString("en-IN")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {d.lastPaymentAt
                            ? new Date(d.lastPaymentAt).toLocaleDateString("en-IN")
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Requests List */
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "PENDING" ? "Pending Payment Requests" : activeTab === "APPROVED" ? "Approved Payments" : "Rejected Requests"}
            </CardTitle>
            <CardDescription>{filteredRequests.length} record{filteredRequests.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {activeTab === "PENDING" ? "No pending requests" : activeTab === "APPROVED" ? "No approved payments yet" : "No rejected requests"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => (
                  <div
                    key={req._id}
                    className={`rounded-lg border p-4 ${
                      activeTab === "PENDING"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : activeTab === "APPROVED"
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg text-foreground">
                            ₹{req.amount.toLocaleString("en-IN")}
                          </span>
                          <Badge variant="outline" className={`text-xs ${
                            activeTab === "PENDING" ? "text-amber-700 border-amber-500/40" :
                            activeTab === "APPROVED" ? "text-green-700 border-green-500/40" :
                            "text-red-700 border-red-500/40"
                          }`}>
                            {req.status}
                          </Badge>
                          {req.requestedBy && (
                            <Badge variant="secondary" className="text-xs">
                              by {req.requestedBy === "DRIVER" ? "Driver" : "Admin"}
                            </Badge>
                          )}
                        </div>

                        <p className="font-semibold text-foreground">
                          {getDriverDisplayName(req)}
                        </p>

                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>Submitted: {new Date(req.createdAt).toLocaleString("en-IN", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}</p>
                          {req.transactionReference && (
                            <p>Ref: <span className="text-foreground font-mono">{req.transactionReference}</span></p>
                          )}
                          {req.notes && <p>Notes: {req.notes}</p>}
                          {req.approvedAt && (
                            <p>
                              {activeTab === "APPROVED" ? "Approved" : "Reviewed"}: {new Date(req.approvedAt).toLocaleString("en-IN", {
                                year: "numeric", month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                              {req.approvedBy && ` by ${req.approvedBy?.fullname?.firstname || req.approvedBy?.email || "Admin"}`}
                            </p>
                          )}
                          {req.rejectionReason && (
                            <p className="text-red-600 font-medium mt-1">
                              Reason: {req.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {activeTab === "PENDING" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => { setApproving(req); setApproveError(null); }}
                          >
                            <CheckCircle2 size={16} className="mr-1.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => { setRejecting(req); setRejectReason(""); setRejectError(null); }}
                          >
                            <XCircle size={16} className="mr-1.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve Confirmation Modal */}
      <Dialog open={!!approving} onOpenChange={() => setApproving(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-600" />
              Approve Commission Payment
            </DialogTitle>
            <DialogDescription>
              Confirm that you have received this payment from the driver.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver</span>
                <span className="font-semibold">{approving ? getDriverDisplayName(approving) : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-green-600">₹{approving?.amount.toLocaleString("en-IN")}</span>
              </div>
              {approving?.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Ref</span>
                  <span className="font-mono">{approving.transactionReference}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-800 dark:text-amber-200">
              ⚠️ This will mark ₹{approving?.amount.toLocaleString("en-IN")} as collected and reduce the driver's pending commission.
            </div>

            {approveError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                {approveError}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setApproving(null)} className="flex-1" disabled={approveLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={approveLoading}
              >
                {approveLoading ? <><RefreshCw size={16} className="mr-2 animate-spin" />Approving…</> : "Confirm Approval"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejecting} onOpenChange={() => setRejecting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle size={20} className="text-red-600" />
              Reject Payment Request
            </DialogTitle>
            <DialogDescription>
              Provide a reason so the driver knows what to correct.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver</span>
                <span className="font-semibold">{rejecting ? getDriverDisplayName(rejecting) : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">₹{rejecting?.amount.toLocaleString("en-IN")}</span>
              </div>
              {rejecting?.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref</span>
                  <span className="font-mono">{rejecting.transactionReference}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-2"
                placeholder="e.g. Invalid transaction reference, amount mismatch..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            {rejectError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                {rejectError}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejecting(null)} className="flex-1" disabled={rejectLoading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                className="flex-1"
                disabled={rejectLoading || !rejectReason.trim()}
              >
                {rejectLoading ? <><RefreshCw size={16} className="mr-2 animate-spin" />Rejecting…</> : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

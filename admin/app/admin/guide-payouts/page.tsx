"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  HandCoins,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import {
  getGuidesPayoutOverviewApi,
  createAdminPayoutApi,
  getAllPayoutsAdminApi,
} from "@/lib/api/payout";

type GuideOverview = {
  guideId: string;
  guideName: string;
  guideEmail?: string;
  totalEarnings: number;
  paidOut: number;
  pendingConfirmation: number;
  pendingPayout: number;
  availableForPayout: number;
};

type PayoutRecord = {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  guideId?: unknown;
  createdBy?: { name?: string; email?: string };
};

function guideLabelFromPayout(p: PayoutRecord): string {
  const g = p.guideId as
    | { userId?: { name?: string }; name?: string }
    | string
    | undefined;
  if (g && typeof g === "object" && "userId" in g && g.userId?.name) {
    return g.userId.name;
  }
  if (g && typeof g === "object" && "name" in g && typeof g.name === "string") {
    return g.name;
  }
  return "Guide";
}

export default function GuidePayoutsPage() {
  const [guides, setGuides] = useState<GuideOverview[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [amountDraft, setAmountDraft] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<"GUIDES" | "HISTORY">("GUIDES");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const [g, p] = await Promise.all([
      getGuidesPayoutOverviewApi() as Promise<GuideOverview[]>,
      getAllPayoutsAdminApi() as Promise<PayoutRecord[]>,
    ]);
    setGuides(Array.isArray(g) ? g : []);
    setPayouts(Array.isArray(p) ? p : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load payouts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setBanner(null);
    try {
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async (guideId: string, max: number) => {
    const raw = (amountDraft[guideId] ?? "").trim();
    const amount = Number.parseFloat(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBanner({ type: "err", text: "Enter a positive amount." });
      return;
    }
    if (amount > max + 0.01) {
      setBanner({
        type: "err",
        text: `Amount cannot exceed available ₹${max.toFixed(2)}.`,
      });
      return;
    }

    setSendingId(guideId);
    setBanner(null);
    try {
      await createAdminPayoutApi(guideId, amount);
      setBanner({
        type: "ok",
        text: `Payout of ₹${amount.toLocaleString("en-IN")} recorded — awaiting guide confirmation.`,
      });
      setAmountDraft((prev) => ({ ...prev, [guideId]: "" }));
      await load();
    } catch (e) {
      setBanner({
        type: "err",
        text: e instanceof Error ? e.message : "Could not create payout",
      });
    } finally {
      setSendingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = search || statusFilter !== "ALL" || startDate || endDate;

  // Compute stats card totals
  const totalAccrued = guides.reduce((sum, g) => sum + g.totalEarnings, 0);
  const totalPaidOut = guides.reduce((sum, g) => sum + g.paidOut, 0);
  const totalPendingConfirmation = guides.reduce((sum, g) => sum + g.pendingConfirmation, 0);
  const totalAvailable = guides.reduce((sum, g) => sum + (g.availableForPayout ?? g.pendingPayout ?? 0), 0);

  // Filter lists
  const filteredGuides = guides.filter((g) => {
    const matchesSearch =
      g.guideName.toLowerCase().includes(search.toLowerCase()) ||
      (g.guideEmail && g.guideEmail.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const filteredPayouts = payouts.filter((p) => {
    const guideName = guideLabelFromPayout(p);
    const matchesSearch = guideName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(p.createdAt) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // inclusive
      matchesDate = matchesDate && new Date(p.createdAt) <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading guide payouts overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full">
          <XCircle className="h-12 w-12" />
        </div>
        <p className="text-foreground font-semibold text-lg">Failed to load payouts data</p>
        <p className="text-muted-foreground text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <HandCoins className="h-8 w-8 text-primary" />
            Guide Payouts Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage guide earnings distribution (70% share). Create payout records and monitor guide confirmation status.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start md:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>

      {banner && (
        <div
          className={`rounded-lg border p-4 text-sm font-medium transition-all ${
            banner.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/60 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accrued Share (70%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalAccrued.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground mt-1">Accrued guide earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/60 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid Out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalPaidOut.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully disbursed</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/60 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Confirmation</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalPendingConfirmation.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting guide approval</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/60 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available for Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalAvailable.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground mt-1">Disbursable balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("GUIDES")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "GUIDES"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Verified Guides ({filteredGuides.length})
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "HISTORY"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Payout History ({filteredPayouts.length})
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border/60 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={activeTab === "GUIDES" ? "Search guides by name or email..." : "Search payouts by guide name..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 h-10 border-border/60 focus-visible:ring-primary"
              />
            </div>

            {activeTab === "HISTORY" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-border/60 bg-background/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="COMPLETED">Confirmed / Completed</option>
              </select>
            )}

            {activeTab === "HISTORY" && (
              <div className="flex items-center gap-2 border border-border/60 bg-background/50 rounded-md px-3 h-10">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-foreground"
                  title="Start Date"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-foreground"
                  title="End Date"
                />
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {activeTab === "GUIDES" ? (
            filteredGuides.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium">No verified guides found</p>
                {search && <p className="text-xs text-muted-foreground mt-1">Try resetting your search filter.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground font-medium">
                      <th className="p-4 font-semibold">Guide Information</th>
                      <th className="p-4 font-semibold">Accrued Share (70%)</th>
                      <th className="p-4 font-semibold">Unconfirmed Payouts</th>
                      <th className="p-4 font-semibold">Paid Out</th>
                      <th className="p-4 font-semibold">Available for Payout</th>
                      <th className="p-4 font-semibold text-right">Send Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuides.map((g) => {
                      const max = g.availableForPayout ?? g.pendingPayout ?? 0;
                      return (
                        <tr key={g.guideId} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{g.guideName}</div>
                            {g.guideEmail && <div className="text-xs text-muted-foreground">{g.guideEmail}</div>}
                          </td>
                          <td className="p-4 font-medium text-foreground">₹{g.totalEarnings.toLocaleString("en-IN")}</td>
                          <td className="p-4 text-amber-600 dark:text-amber-400 font-medium">
                            ₹{g.pendingConfirmation.toLocaleString("en-IN")}
                          </td>
                          <td className="p-4 text-green-600 dark:text-green-400 font-medium">
                            ₹{g.paidOut.toLocaleString("en-IN")}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${max > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              ₹{max.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="Amount"
                                className="h-9 w-[120px] bg-background/50"
                                value={amountDraft[g.guideId] ?? ""}
                                onChange={(e) =>
                                  setAmountDraft((prev) => ({
                                    ...prev,
                                    [g.guideId]: e.target.value,
                                  }))
                                }
                                disabled={max <= 0 || sendingId === g.guideId}
                              />
                              <Button
                                size="sm"
                                disabled={max <= 0 || sendingId === g.guideId}
                                onClick={() => handleSend(g.guideId, max)}
                                className="h-9 px-3"
                              >
                                {sendingId === g.guideId ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                    Processing
                                  </>
                                ) : (
                                  "Disburse"
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredPayouts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <HandCoins className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium">No payouts history found</p>
                {hasActiveFilters && <p className="text-xs text-muted-foreground mt-1">Try resetting your filters.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground font-medium">
                      <th className="p-4 font-semibold">Guide Name</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Payout Status</th>
                      <th className="p-4 font-semibold">Initiated Date</th>
                      <th className="p-4 font-semibold">Confirmed Date</th>
                      <th className="p-4 font-semibold">Processed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.map((row) => (
                      <tr key={row._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{guideLabelFromPayout(row)}</td>
                        <td className="p-4 font-bold text-foreground">₹{row.amount.toLocaleString("en-IN")}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              row.status === "COMPLETED" || row.status === "APPROVED" || row.status === "CONFIRMED"
                                ? "bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-200"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
                            }`}
                          >
                            {row.status === "COMPLETED" || row.status === "APPROVED" || row.status === "CONFIRMED" ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-600" />
                            )}
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-muted-foreground">
                          {row.confirmedAt ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {new Date(row.confirmedAt).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">{row.createdBy?.name || "System"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

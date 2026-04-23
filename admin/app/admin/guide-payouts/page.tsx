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
import { Loader2, HandCoins, RefreshCw } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading guide payouts…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm space-y-2">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-primary" />
            Guide payouts
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-2xl">
            Send the guide&apos;s 70% share when you transfer funds. Amount cannot
            exceed each guide&apos;s available balance. Guides confirm receipt in
            their dashboard.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {banner && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            banner.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-900 dark:text-green-100"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {banner.text}
        </div>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Verified guides</CardTitle>
          <CardDescription>
            Per-guide wallet: accrued 70% share, already paid out, and amount
            you can send next (excludes unconfirmed payouts).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {guides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified guides.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="p-3 font-medium">Guide</th>
                    <th className="p-3 font-medium">Accrued</th>
                    <th className="p-3 font-medium">Unconfirmed</th>
                    <th className="p-3 font-medium">Paid out</th>
                    <th className="p-3 font-medium">Can send</th>
                    <th className="p-3 font-medium w-[220px]">Send payment</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.map((g) => {
                    const max = g.availableForPayout ?? g.pendingPayout ?? 0;
                    return (
                      <tr key={g.guideId} className="border-b border-border/60">
                        <td className="p-3">
                          <p className="font-medium text-foreground">
                            {g.guideName}
                          </p>
                          {g.guideEmail && (
                            <p className="text-xs text-muted-foreground">
                              {g.guideEmail}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          ₹{g.totalEarnings.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-amber-700 dark:text-amber-400">
                          ₹{g.pendingConfirmation.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-green-700 dark:text-green-400">
                          ₹{g.paidOut.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 font-semibold">
                          ₹{max.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="Amount"
                              className="h-9 max-w-[140px]"
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
                              className="shrink-0"
                              disabled={
                                max <= 0 || sendingId === g.guideId
                              }
                              onClick={() => handleSend(g.guideId, max)}
                            >
                              {sendingId === g.guideId ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  Sending…
                                </>
                              ) : (
                                "Send payment"
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
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Payout history</CardTitle>
          <CardDescription>All admin-initiated payouts and status.</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="p-3 font-medium">Guide</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Created</th>
                    <th className="p-3 font-medium">Confirmed</th>
                    <th className="p-3 font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((row) => (
                    <tr key={row._id} className="border-b border-border/60">
                      <td className="p-3">{guideLabelFromPayout(row)}</td>
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
                      <td className="p-3 text-muted-foreground text-xs">
                        {row.createdBy?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

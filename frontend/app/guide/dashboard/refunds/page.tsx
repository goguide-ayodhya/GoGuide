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
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Clock, DollarSign, Search } from "lucide-react";
import { getBookingRefundsApi, type Refund } from "@/lib/api/refunds";
import { useBooking } from "@/contexts/BookingsContext";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { bookings } = useBooking();

  // Fetch refunds on mount
  useEffect(() => {
    fetchRefunds();
  }, [bookings.length]);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRefunds = await Promise.all(
        bookings.map((booking) => getBookingRefundsApi(booking.id)),
      );
      const data = allRefunds.flat();
      setRefunds(
        Array.isArray(data)
          ? data.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
          : [],
      );
    } catch (e) {
      console.error("Failed to fetch refunds", e);
      setError(
        e instanceof Error ? e.message : "Failed to load refunds"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRefunds = refunds.filter(
    (refund) =>
      (refund.id || refund._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (refund.reason || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PROCESSED":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "REQUESTED":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PROCESSED":
        return <CheckCircle size={18} className="text-green-600" />;
      case "REQUESTED":
        return <Clock size={18} className="text-amber-600" />;
      case "FAILED":
        return <AlertCircle size={18} className="text-red-600" />;
      default:
        return <AlertCircle size={18} className="text-gray-600" />;
    }
  };

  const stats = {
    totalRequested: refunds.reduce((sum, r) => sum + r.amount, 0),
    processed: refunds
      .filter((r) => r.status === "PROCESSED")
      .reduce((sum, r) => sum + r.amount, 0),
    pending: refunds
      .filter((r) => r.status === "REQUESTED")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Refunds</h1>
        <p className="text-muted-foreground mt-2">
          View and manage refund requests for your bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Refund Requested
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ₹{stats.totalRequested.toLocaleString("en-IN")}
                </p>
              </div>
              <DollarSign size={32} className="text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Processed
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₹{stats.processed.toLocaleString("en-IN")}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-2">
                  ₹{stats.pending.toLocaleString("en-IN")}
                </p>
              </div>
              <Clock size={32} className="text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refund History</CardTitle>
              <CardDescription>
                {filteredRefunds.length} refund{filteredRefunds.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRefunds}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Failed to load refunds
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading refunds...
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No refunds found
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  placeholder="Search by refund ID or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left">
                      <th className="p-3 font-medium">Refund ID</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Reason</th>
                      <th className="p-3 font-medium">Requested</th>
                      <th className="p-3 font-medium">Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.map((refund) => (
                      <tr
                        key={refund._id}
                        className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-medium text-foreground">
                          {refund.id || refund._id}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          ₹{refund.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          <Badge className={`gap-2 ${getStatusColor(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            {refund.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate">
                          {refund.reason || "—"}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(refund.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {refund.processedAt
                            ? new Date(refund.processedAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Plus } from "lucide-react";
import {
  getDriverCollectionOverviewApi,
  recordCommissionPaymentApi,
} from "@/lib/api/finance";

type DriverCollection = {
  driverId: string;
  driverName: string;
  totalEarned: number;
  adminCommissionGenerated: number;
  adminCommissionPaid: number;
  pendingAdminCommission: number;
};

export default function DriverCollectionsPage() {
  const [drivers, setDrivers] = useState<DriverCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverCollection | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDriverCollectionOverviewApi();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = (driver: DriverCollection) => {
    setSelectedDriver(driver);
    setPaymentAmount("");
    setPaymentNote("");
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!selectedDriver || !paymentAmount) {
      setError("Please enter a payment amount");
      return;
    }

    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > selectedDriver.pendingAdminCommission) {
      setError(
        `Payment exceeds pending amount (₹${selectedDriver.pendingAdminCommission})`
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await recordCommissionPaymentApi(selectedDriver.driverId, amount, paymentNote);
      setSuccess(`Payment recorded for ${selectedDriver.driverName}`);
      setShowPaymentModal(false);
      await fetchDrivers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const filteredDrivers = drivers.filter((d) =>
    d.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPending = drivers.reduce((sum, d) => sum + d.pendingAdminCommission, 0);
  const totalGenerated = drivers.reduce((sum, d) => sum + d.adminCommissionGenerated, 0);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading driver collections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Driver Collections</h1>
        <p className="text-muted-foreground mt-2">
          Track and record commission payments from drivers.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commission Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{totalGenerated.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Already Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ₹{(totalGenerated - totalPending).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              ₹{totalPending.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
          ✓ {success}
        </div>
      )}

      {/* Search */}
      <div>
        <Input
          type="text"
          placeholder="Search drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Collections</CardTitle>
          <CardDescription>
            {filteredDrivers.length} drivers with pending collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Driver
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Total Earned
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Commission %
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Total Commission
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Paid
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Pending
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driverId} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-foreground">
                      {driver.driverName}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      ₹{driver.totalEarned.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {driver.adminCommissionGenerated > 0
                        ? Math.round(
                            (driver.adminCommissionGenerated / driver.totalEarned) * 100
                          )
                        : 0}
                      %
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">
                      ₹{driver.adminCommissionGenerated.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      ₹{driver.adminCommissionPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          driver.pendingAdminCommission > 0 ? "default" : "secondary"
                        }
                      >
                        ₹{driver.pendingAdminCommission.toLocaleString()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddPayment(driver)}
                        disabled={driver.pendingAdminCommission === 0}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Payment
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDrivers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No drivers found with pending collections.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Commission Payment</DialogTitle>
            <DialogDescription>
              {selectedDriver?.driverName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Summary */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Commission</p>
                  <p className="text-lg font-bold">
                    ₹{selectedDriver?.adminCommissionGenerated.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pending Amount</p>
                  <p className="text-lg font-bold text-orange-600">
                    ₹{selectedDriver?.pendingAdminCommission.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Payment Amount (Max: ₹{selectedDriver?.pendingAdminCommission.toLocaleString()})
              </label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                max={selectedDriver?.pendingAdminCommission}
                className="mt-2"
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Note (Optional)
              </label>
              <Input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Payment method, reference, etc."
                className="mt-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSavePayment} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

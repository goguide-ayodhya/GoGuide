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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings, Bell, Shield, AlertCircle, X } from "lucide-react";
import { getProfile } from "@/lib/api/settings";
import { getRidePricing, updateRidePricing } from "@/lib/api/settings";
import { defaultSettings } from "@/lib/mock-data";
import {
  getAdminSettingsApi,
  updateCommissionPercentApi,
} from "@/lib/api/finance";

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [profile, setProfile] = useState<{
    email?: string;
    lastLogin?: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);

    try {
      await updateRidePricing(settings.ridePricing);

      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const [currentCommission, setCurrentCommission] = useState<number>(0);
  const [editCommission, setEditCommission] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminSettingsApi();
      setCurrentCommission(data.driverCommissionPercent || 20);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditCommission(currentCommission.toString());
    setShowConfirmModal(true);
    setCountdown(10);
  };

  // Countdown timer
  useEffect(() => {
    if (!showConfirmModal) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showConfirmModal]);

  const handleSaveCommision = async () => {
    const newCommission = parseInt(editCommission);

    if (isNaN(newCommission) || newCommission < 0 || newCommission > 100) {
      setError("Commission must be between 0 and 100");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateCommissionPercentApi(newCommission);
      setCurrentCommission(newCommission);
      setShowConfirmModal(false);
      setEditCommission("");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setEditCommission("");
    setCountdown(10);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getProfile();
        if (!cancelled)
          setProfile({ email: p?.email, lastLogin: p?.lastLogin });
      } catch (e) {
        // ignore - keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getRidePricing();
        if (res.success && !cancelled) {
          setSettings((prev) => ({ ...prev, ridePricing: res.data }));
        }
      } catch (e) {
        // ignore - keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage platform settings and configurations.
        </p>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 w-full sm:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save Price"
              : "Edit Price"}{" "}
        </Button>
      </div>

      {/* Ride Pricing Settings */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">
                Ride Pricing
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure ride fares and rates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Base Fare (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-auto" className="text-xs">
                  Auto
                </Label>
                <Input
                  id="base-auto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  value={settings.ridePricing.baseFare.auto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        baseFare: {
                          ...prev.ridePricing.baseFare,
                          auto: parseInt(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-car" className="text-xs">
                  Car
                </Label>
                <Input
                  id="base-car"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  value={settings.ridePricing.baseFare.car}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        baseFare: {
                          ...prev.ridePricing.baseFare,
                          car: parseInt(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-moto" className="text-xs">
                  Moto
                </Label>
                <Input
                  id="base-moto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  value={settings.ridePricing.baseFare.moto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        baseFare: {
                          ...prev.ridePricing.baseFare,
                          moto: parseInt(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Per KM Rate (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="km-auto" className="text-xs">
                  Auto
                </Label>
                <Input
                  id="km-auto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.auto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perKmRate: {
                          ...prev.ridePricing.perKmRate,
                          auto: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km-car" className="text-xs">
                  Car
                </Label>
                <Input
                  id="km-car"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.car}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perKmRate: {
                          ...prev.ridePricing.perKmRate,
                          car: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km-moto" className="text-xs">
                  Moto
                </Label>
                <Input
                  id="km-moto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.moto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perKmRate: {
                          ...prev.ridePricing.perKmRate,
                          moto: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Per Minute Rate (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-auto" className="text-xs">
                  Auto
                </Label>
                <Input
                  id="min-auto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.auto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perMinuteRate: {
                          ...prev.ridePricing.perMinuteRate,
                          auto: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-car" className="text-xs">
                  Car
                </Label>
                <Input
                  id="min-car"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.car}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perMinuteRate: {
                          ...prev.ridePricing.perMinuteRate,
                          car: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-moto" className="text-xs">
                  Moto
                </Label>
                <Input
                  id="min-moto"
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.moto}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ridePricing: {
                        ...prev.ridePricing,
                        perMinuteRate: {
                          ...prev.ridePricing.perMinuteRate,
                          moto: parseFloat(e.target.value) || 0,
                        },
                      },
                    }))
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Setting */}
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Commission Settings Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Driver Commission Configuration
          </CardTitle>
          <CardDescription>
            Set the percentage commission the admin takes from each driver
            earning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Setting */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Current Commission Rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Admin takes this percentage from driver earnings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {currentCommission}%
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                Example Calculation
              </h4>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex justify-between">
                  <span>Driver Earns:</span>
                  <span className="font-medium">₹1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Commission ({currentCommission}%):</span>
                  <span className="font-medium">
                    ₹{Math.round((1000 * currentCommission) / 100)}
                  </span>
                </div>
                <div className="border-t border-blue-300 dark:border-blue-700 pt-2 mt-2 flex justify-between font-semibold">
                  <span>Driver Receives:</span>
                  <span>
                    ₹{Math.round(1000 - (1000 * currentCommission) / 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button onClick={handleEditClick} className="w-full" size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Edit Commission Percentage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Commission Change
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please review carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning */}
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ <strong>Warning:</strong> Changing commission affects all
                future earnings calculations. This will apply to all new driver
                earnings immediately.
              </p>
            </div>

            {/* New Commission Input */}
            <div>
              <label className="text-sm font-medium text-foreground">
                New Commission Percentage (0-100%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editCommission}
                onChange={(e) => setEditCommission(e.target.value)}
                className="mt-2"
                placeholder="Enter percentage"
              />
            </div>

            {/* Countdown Timer */}
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please wait before confirming...
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2 text-center">
                {countdown}s
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveCommision}
                disabled={countdown > 0 || saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {countdown > 0 ? `Wait (${countdown}s)` : "Confirm Change"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

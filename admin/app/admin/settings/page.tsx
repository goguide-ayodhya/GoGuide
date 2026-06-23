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
import {
  Save,
  Settings,
  AlertCircle,
  X,
  QrCode,
  Car,
  Compass,
  Percent,
  User as UserIcon,
  MapPin,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/lib/api/settings";
import { getRidePricing, updateRidePricing } from "@/lib/api/settings";
import { defaultSettings } from "@/lib/mock-data";
import {
  getAdminSettingsApi,
  updateCommissionPercentApi,
  updateGuidePricingApi,
  updateLocationsApi,
  updatePaymentQRApi,
  uploadPaymentQRApi,
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

  const [guidePricing, setGuidePricing] = useState({
    halfDay: { touristPrice: 0, guideEarning: 0, maxLocations: 6 },
    fullDay: { touristPrice: 0, guideEarning: 0, maxLocations: 8 },
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [isSavingGuide, setIsSavingGuide] = useState(false);
  const [paymentQR, setPaymentQR] = useState({
    url: "",
    isEnabled: false,
    upiId: "",
    merchantName: "",
  });
  const [isSavingQR, setIsSavingQR] = useState(false);

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
      if (data.guidePricing) {
        setGuidePricing(data.guidePricing);
      }
      if (data.locations) {
        setLocations(data.locations);
      }
      if (data.paymentQR) {
        setPaymentQR({
          url: data.paymentQR.url || "",
          isEnabled: data.paymentQR.isEnabled || false,
          upiId: data.paymentQR.upiId || "",
          merchantName: data.paymentQR.merchantName || "",
        });
      }
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

  const handleSaveGuideSettings = async () => {
    setIsSavingGuide(true);
    try {
      await updateGuidePricingApi(guidePricing);
      await updateLocationsApi(locations);
      setError(null);
      // Optional: Add a success toast here
    } catch (err: any) {
      setError(err.message || "Failed to save guide settings");
    } finally {
      setIsSavingGuide(false);
    }
  };

  const handleSaveQRSettings = async () => {
    setIsSavingQR(true);
    try {
      await updatePaymentQRApi(
        paymentQR.url,
        paymentQR.isEnabled,
        paymentQR.upiId,
        paymentQR.merchantName,
      );
      setError(null);
      window.alert("Payment QR Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save payment QR settings");
    } finally {
      setIsSavingQR(false);
    }
  };

  const handleUploadQRFile = async (file?: File) => {
    if (!file) return;
    setIsSavingQR(true);
    try {
      const res = await uploadPaymentQRApi(
        file,
        paymentQR.isEnabled,
        paymentQR.upiId,
        paymentQR.merchantName,
      );
      // response is the updated settings object
      if (res && res.paymentQR) {
        setPaymentQR({
          url: res.paymentQR.url || "",
          isEnabled: !!res.paymentQR.isEnabled,
          upiId: res.paymentQR.upiId || "",
          merchantName: res.paymentQR.merchantName || "",
        });
      }
      setError(null);
      window.alert("QR image uploaded and settings updated");
    } catch (err: any) {
      setError(err.message || "Failed to upload QR image");
    } finally {
      setIsSavingQR(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations((prev) => [...prev, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setLocations((prev) => prev.filter((l) => l !== loc));
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

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        {/* Page Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-32 bg-muted/60" />
          <Skeleton className="h-4 w-64 bg-muted/60 mt-2" />
        </div>
        {/* Tabs skeleton */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/20 border border-border/40 rounded-lg max-w-xl">
          <Skeleton className="h-9 w-28 bg-muted/60" />
          <Skeleton className="h-9 w-32 bg-muted/60" />
          <Skeleton className="h-9 w-28 bg-muted/60" />
          <Skeleton className="h-9 w-28 bg-muted/60" />
          <Skeleton className="h-9 w-28 bg-muted/60" />
        </div>
        {/* Card skeleton */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg bg-muted/60 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 bg-muted/60" />
                <Skeleton className="h-3.5 w-60 bg-muted/60" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 bg-muted/60" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 bg-muted/60" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
                <Skeleton className="h-10 bg-muted/60 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Tabs Layout */}
      <Tabs defaultValue="ride-pricing" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap h-auto gap-1 justify-start border border-border/40">
          <TabsTrigger value="ride-pricing" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Ride Pricing
          </TabsTrigger>
          <TabsTrigger value="guide-settings" className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Guide Settings
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="payment-qr" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Payment QR
          </TabsTrigger>
          <TabsTrigger value="profile-info" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile Info
          </TabsTrigger>
        </TabsList>

        {/* Ride Pricing Tab */}
        <TabsContent value="ride-pricing" className="outline-none">
          <Card className="border-border">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">
                    Ride Pricing
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configure ride fares and rates for Auto, Car, and Moto.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Base Fare */}
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
              {/* Per KM Rate */}
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
              {/* Per Minute Rate */}
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

              {/* Local Action Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-10 w-full sm:w-auto font-medium"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving
                    ? "Saving..."
                    : isEditing
                      ? "Save Ride Pricing"
                      : "Edit Ride Pricing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide Settings Tab */}
        <TabsContent value="guide-settings" className="outline-none">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-orange-500" />
                Guide Pricing Configuration
              </CardTitle>
              <CardDescription>
                Set the fixed tourist price and guide earnings for Half Day and Full Day tours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Half Day */}
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                    <h4 className="font-semibold text-foreground">Half Day Tour</h4>
                    <div>
                      <Label>Tourist Price (₹)</Label>
                      <Input
                        type="number"
                        value={guidePricing.halfDay.touristPrice}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            halfDay: {
                              ...prev.halfDay,
                              touristPrice: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Guide Earning (₹)</Label>
                      <Input
                        type="number"
                        value={guidePricing.halfDay.guideEarning}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            halfDay: {
                              ...prev.halfDay,
                              guideEarning: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Max Locations</Label>
                      <Input
                        type="number"
                        value={guidePricing.halfDay.maxLocations}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            halfDay: {
                              ...prev.halfDay,
                              maxLocations: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="pt-3 text-sm font-medium text-muted-foreground border-t border-border flex justify-between">
                      <span>Admin Commission:</span>
                      <span className="text-foreground font-semibold">
                        ₹{guidePricing.halfDay.touristPrice - guidePricing.halfDay.guideEarning}
                      </span>
                    </div>
                  </div>

                  {/* Full Day */}
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                    <h4 className="font-semibold text-foreground">Full Day Tour</h4>
                    <div>
                      <Label>Tourist Price (₹)</Label>
                      <Input
                        type="number"
                        value={guidePricing.fullDay.touristPrice}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            fullDay: {
                              ...prev.fullDay,
                              touristPrice: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Guide Earning (₹)</Label>
                      <Input
                        type="number"
                        value={guidePricing.fullDay.guideEarning}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            fullDay: {
                              ...prev.fullDay,
                              guideEarning: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Max Locations</Label>
                      <Input
                        type="number"
                        value={guidePricing.fullDay.maxLocations}
                        onChange={(e) =>
                          setGuidePricing((prev) => ({
                            ...prev,
                            fullDay: {
                              ...prev.fullDay,
                              maxLocations: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="pt-3 text-sm font-medium text-muted-foreground border-t border-border flex justify-between">
                      <span>Admin Commission:</span>
                      <span className="text-foreground font-semibold">
                        ₹{guidePricing.fullDay.touristPrice - guidePricing.fullDay.guideEarning}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locations Management */}
                <div className="pt-6 border-t border-border">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Manage Available Locations
                  </h4>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter a new location"
                      onKeyPress={(e) => e.key === "Enter" && handleAddLocation()}
                    />
                    <Button onClick={handleAddLocation}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <Badge
                        key={loc}
                        variant="secondary"
                        className="flex items-center gap-1 bg-card hover:bg-card/80 border border-border px-3 py-1"
                      >
                        {loc}
                        <X
                          className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveLocation(loc)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveGuideSettings}
                  disabled={isSavingGuide}
                  className="w-full h-11 mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingGuide ? "Saving..." : "Save Guide Pricing & Locations"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="outline-none">
          {error && (
            <div className="p-4 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-orange-500" />
                Driver Commission Configuration
              </CardTitle>
              <CardDescription>
                Set the percentage commission the admin takes from each driver earning.
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
                      <Badge variant="secondary" className="mt-2 bg-green-500/10 text-green-600 border border-green-500/20">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Example Calculation */}
                <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Calculator Simulator
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Driver Earns:</span>
                      <span className="font-medium text-foreground">₹1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Commission ({currentCommission}%):</span>
                      <span className="font-medium text-destructive">
                        -₹{Math.round((1000 * currentCommission) / 100)}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-foreground">
                      <span>Driver Receives:</span>
                      <span className="text-green-600">
                        ₹{Math.round(1000 - (1000 * currentCommission) / 100)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Button onClick={handleEditClick} className="w-full h-11" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Commission Percentage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment QR Tab */}
        <TabsContent value="payment-qr" className="outline-none">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                Payment QR Code Settings
              </CardTitle>
              <CardDescription>
                Configure the global admin payment QR code shown to guides on their dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Payment QR Code</Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide the "Show Payment QR" button on Guide dashboards.
                      </p>
                    </div>
                    <Badge
                      className={paymentQR.isEnabled ? "bg-green-600" : "bg-muted text-muted-foreground"}
                    >
                      {paymentQR.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setPaymentQR((prev) => ({ ...prev, isEnabled: true }))
                      }
                      variant={paymentQR.isEnabled ? "default" : "outline"}
                      className={`flex-1 ${paymentQR.isEnabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                      Enable
                    </Button>
                    <Button
                      onClick={() =>
                        setPaymentQR((prev) => ({ ...prev, isEnabled: false }))
                      }
                      variant={!paymentQR.isEnabled ? "default" : "outline"}
                      className={`flex-1 ${!paymentQR.isEnabled ? "bg-destructive hover:bg-destructive/90 text-white" : ""}`}
                    >
                      Disable
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-url">QR Code Image URL</Label>
                  <Input
                    id="qr-url"
                    type="text"
                    placeholder="Enter QR image URL"
                    value={paymentQR.url}
                    onChange={(e) =>
                      setPaymentQR((prev) => ({ ...prev, url: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a direct URL to the QR code image.
                  </p>

                  <div className="pt-3">
                    <Label className="text-sm">Or upload QR image</Label>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadQRFile(f);
                      }}
                      className="mt-2 h-10 pt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB. JPG/PNG/WebP supported.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input
                    id="upi-id"
                    type="text"
                    placeholder="e.g., merchant@upi"
                    value={paymentQR.upiId}
                    onChange={(e) =>
                      setPaymentQR((prev) => ({ ...prev, upiId: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant-name">Merchant Name</Label>
                  <Input
                    id="merchant-name"
                    type="text"
                    placeholder="e.g., GoGuide Travels"
                    value={paymentQR.merchantName}
                    onChange={(e) =>
                      setPaymentQR((prev) => ({
                        ...prev,
                        merchantName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Live Preview
                  </p>
                  <div className="relative border border-border bg-white rounded-lg p-2 max-w-[200px]">
                    <img
                      src={paymentQR.url}
                      alt="Payment QR Preview"
                      className="max-h-[200px] max-w-[200px] object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/200x200?text=No+QR+Image+Uploaded";
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveQRSettings}
                  disabled={isSavingQR}
                  className="w-full h-11"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingQR ? "Saving..." : "Save Payment QR Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Info Tab */}
        <TabsContent value="profile-info" className="outline-none">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-orange-500" />
                Admin Audit Information
              </CardTitle>
              <CardDescription>
                Auditing detail regarding the current logged-in administrator session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider animate-pulse">Admin Email</p>
                  <p className="text-sm font-semibold text-foreground">{profile?.email || "loading..."}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider animate-pulse">Last Login</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "loading..."}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
                <p className="text-xs font-semibold text-muted-foreground">Admin API endpoints fully operational and authenticated.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                ⚠️ <strong>Warning:</strong> Changing commission affects all future earnings calculations. This will apply to all new driver earnings immediately.
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

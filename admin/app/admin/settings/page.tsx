"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save, Settings, Bell, Shield } from "lucide-react"
import { getProfile } from "@/lib/api/settings"
import { getRidePricing, updateRidePricing } from "@/lib/api/settings"
import { defaultSettings } from "@/lib/mock-data"

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [profile, setProfile] = useState<{ email?: string; lastLogin?: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateRidePricing(settings.ridePricing)
      // You can add more settings saves here
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await getProfile()
        if (!cancelled) setProfile({ email: p?.email, lastLogin: p?.lastLogin })
      } catch (e) {
        // ignore - keep defaults
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getRidePricing()
        if (res.success && !cancelled) {
          setSettings(prev => ({ ...prev, ridePricing: res.data }))
        }
      } catch (e) {
        // ignore - keep defaults
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage platform settings and configurations.</p>
      </div>


      {/* Ride Pricing Settings */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">Ride Pricing</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure ride fares and rates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Base Fare (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-auto" className="text-xs">Auto</Label>
                <Input
                  id="base-auto"
                  type="number"
                  min="0"
                  value={settings.ridePricing.baseFare.auto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      baseFare: { ...prev.ridePricing.baseFare, auto: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-car" className="text-xs">Car</Label>
                <Input
                  id="base-car"
                  type="number"
                  min="0"
                  value={settings.ridePricing.baseFare.car}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      baseFare: { ...prev.ridePricing.baseFare, car: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-moto" className="text-xs">Moto</Label>
                <Input
                  id="base-moto"
                  type="number"
                  min="0"
                  value={settings.ridePricing.baseFare.moto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      baseFare: { ...prev.ridePricing.baseFare, moto: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Per KM Rate (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="km-auto" className="text-xs">Auto</Label>
                <Input
                  id="km-auto"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.auto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perKmRate: { ...prev.ridePricing.perKmRate, auto: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km-car" className="text-xs">Car</Label>
                <Input
                  id="km-car"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.car}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perKmRate: { ...prev.ridePricing.perKmRate, car: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km-moto" className="text-xs">Moto</Label>
                <Input
                  id="km-moto"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perKmRate.moto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perKmRate: { ...prev.ridePricing.perKmRate, moto: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Per Minute Rate (₹)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-auto" className="text-xs">Auto</Label>
                <Input
                  id="min-auto"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.auto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perMinuteRate: { ...prev.ridePricing.perMinuteRate, auto: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-car" className="text-xs">Car</Label>
                <Input
                  id="min-car"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.car}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perMinuteRate: { ...prev.ridePricing.perMinuteRate, car: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-moto" className="text-xs">Moto</Label>
                <Input
                  id="min-moto"
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.ridePricing.perMinuteRate.moto}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ridePricing: {
                      ...prev.ridePricing,
                      perMinuteRate: { ...prev.ridePricing.perMinuteRate, moto: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="h-11 w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

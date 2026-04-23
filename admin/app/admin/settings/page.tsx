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
import { defaultSettings } from "@/lib/mock-data"

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [profile, setProfile] = useState<{ email?: string; lastLogin?: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 500)
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage platform settings and configurations.</p>
      </div>

      {/* Platform Settings */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">Platform Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure platform commission and policies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="commission" className="text-xs sm:text-sm">Platform Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={settings.platformCommission}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  platformCommission: parseInt(e.target.value) || 0 
                }))}
                className="h-11"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Percentage of each booking retained by the platform
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellation" className="text-xs sm:text-sm">Cancellation Policy</Label>
              <Textarea
                id="cancellation"
                value={settings.cancellationPolicy}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  cancellationPolicy: e.target.value 
                }))}
                rows={3}
                className="text-sm"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Define the cancellation policy for bookings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10 shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">Notification Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label className="text-xs sm:text-sm font-medium">Email Notifications</Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.notificationEmail}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                notificationEmail: checked 
              }))}
            />
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label className="text-xs sm:text-sm font-medium">SMS Notifications</Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={settings.notificationSms}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                notificationSms: checked 
              }))}
            />
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border">
            <div className="space-y-0.5 min-w-0 flex-1">
              <Label className="text-xs sm:text-sm font-medium">Push Notifications</Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Receive in-app push notifications</p>
            </div>
            <Switch
              checked={settings.notificationPush}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                notificationPush: checked 
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">Security</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Account security information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-muted">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Admin Email</p>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1 truncate">{profile?.email ?? "admin@goguide.com"}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-muted">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Last Login</p>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">{profile?.lastLogin ?? "March 12, 2024 at 10:30 AM"}</p>
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

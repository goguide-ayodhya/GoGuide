"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, IndianRupee, Save } from "lucide-react"
import { mockCabs, mockCabPricing, type Cab, type CabPricing } from "@/lib/mock-data"

export default function CabsPage() {
  const [cabs] = useState<Cab[]>(mockCabs)
  const [pricing, setPricing] = useState<CabPricing>(mockCabPricing)
  const [isSaving, setIsSaving] = useState(false)

  const handlePricingChange = (field: keyof CabPricing, value: string) => {
    const numValue = parseFloat(value) || 0
    setPricing(prev => ({ ...prev, [field]: numValue }))
  }

  const savePricing = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs" variant="outline">Available</Badge>
      case 'busy':
        return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] sm:text-xs" variant="outline">Busy</Badge>
      case 'offline':
        return <Badge className="bg-muted text-muted-foreground border-border text-[10px] sm:text-xs" variant="outline">Offline</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Cab Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage cab services and pricing.</p>
      </div>

      {/* Pricing Section */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Cab Pricing</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Set the base fare and per kilometer pricing for cab services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="baseFare" className="text-xs sm:text-sm">Base Fare</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="baseFare"
                  type="number"
                  value={pricing.baseFare}
                  onChange={(e) => handlePricingChange('baseFare', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerKm" className="text-xs sm:text-sm">Price per KM</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="pricePerKm"
                  type="number"
                  value={pricing.pricePerKm}
                  onChange={(e) => handlePricingChange('pricePerKm', e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button onClick={savePricing} disabled={isSaving} className="w-full h-11">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Pricing"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cabs - Mobile Cards / Desktop Table */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">All Cabs</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{cabs.length} cabs registered</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {cabs.map((cab) => (
              <div key={cab.id} className="p-3 sm:p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Car className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{cab.driverName}</p>
                      <p className="text-xs text-muted-foreground">{cab.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(cab.status)}
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehicle:</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {cab.vehicleType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number:</span>
                    <span className="text-foreground font-medium">{cab.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{cab.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Cab ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Driver Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Vehicle Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Vehicle Number</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Phone</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {cabs.map((cab) => (
                  <tr key={cab.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">{cab.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Car className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{cab.driverName}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className="text-xs">
                        {cab.vehicleType}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{cab.vehicleNumber}</td>
                    <td className="py-3 text-sm text-muted-foreground">{cab.phone}</td>
                    <td className="py-3">{getStatusBadge(cab.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

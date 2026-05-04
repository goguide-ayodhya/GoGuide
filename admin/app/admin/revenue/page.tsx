"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Users, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getAdminPaymentsSummaryApi, getAdminMonthlyRevenueApi } from "@/lib/api/payments"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts"

const COLORS = ['var(--primary)', 'var(--chart-2)']

export default function RevenuePage() {
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    adminEarnings: 0,
    guideEarnings: 0,
    driverEarnings: 0,
    totalGst: 0,
  })
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<Array<any>>([])

  // default commission (percent) if platform setting is not available
  const PLATFORM_COMMISSION = 20

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const summaryRes = await getAdminPaymentsSummaryApi()
        const monthlyRes = await getAdminMonthlyRevenueApi()

        const total = summaryRes?.totalRevenue ?? 0
        const adminEarnings = summaryRes?.adminNetRevenue ?? 0
        const guideEarnings = summaryRes?.guidePayouts ?? 0
        const driverEarnings = summaryRes?.driverPayouts ?? 0
        const totalGst = summaryRes?.totalGst ?? 0

        setDashboardStats({ totalRevenue: total, adminEarnings, guideEarnings, driverEarnings, totalGst })

        // monthlyRes is expected to be a map { '2024-03': 85000, ... }
        const months = 6
        const now = new Date()
        const monthlyArray: Array<any> = []
        for (let i = months - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const key = d.toISOString().slice(0, 7)
          const revenue = (monthlyRes && monthlyRes[key]) || 0
          const admin = Math.round((revenue * PLATFORM_COMMISSION) / 100)
          const guide = revenue - admin
          monthlyArray.push({ month: d.toLocaleDateString("en-US", { month: "short" }), revenue, admin, guide })
        }
        setMonthlyRevenueData(monthlyArray)
      } catch (error) {
        console.error("Failed to load revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pieData = [
    { name: `Admin Net`, value: dashboardStats.adminEarnings },
    { name: `Guide Payouts`, value: dashboardStats.guideEarnings },
    { name: `Driver Payouts`, value: dashboardStats.driverEarnings },
    { name: `GST Collected`, value: dashboardStats.totalGst },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Revenue</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Platform revenue breakdown and analytics.</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {loading ? "..." : dashboardStats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10 shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-chart-1" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Admin Net Revenue</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {loading ? "..." : dashboardStats.adminEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Provider Payouts (Guide+Driver)</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {loading ? "..." : (dashboardStats.guideEarnings + dashboardStats.driverEarnings).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Stack on mobile/tablet, side by side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Distribution - Pie Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Revenue Distribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Admin vs Guide earnings split</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Breakdown - Bar Chart */}
        <Card className="border-border xl:col-span-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Monthly Revenue Breakdown</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Admin and guide earnings per month</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 1000}K`}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconSize={10}
                  />
                  <Bar dataKey="admin" name="Admin" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="guide" name="Guide" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Info */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Platform Revenue Breakdown</CardTitle>
          <CardDescription className="text-xs sm:text-sm">How revenue is distributed between platform, guides, drivers, and taxes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Admin Net</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                ₹{loading ? "..." : dashboardStats.adminEarnings.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Platform commission after deducting GST and payouts.
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-chart-2/10 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Guide Payouts</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-chart-2">
                ₹{loading ? "..." : dashboardStats.guideEarnings.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Amount paid to tour guides for their services.
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-chart-3/10 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-chart-3" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Driver Payouts</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-chart-3">
                ₹{loading ? "..." : dashboardStats.driverEarnings.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Amount paid to cab drivers for their services.
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">GST Collected</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-destructive">
                ₹{loading ? "..." : dashboardStats.totalGst.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Total GST collected on admin commissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

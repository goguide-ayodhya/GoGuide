"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Users, Building2 } from "lucide-react"
import { dashboardStats, monthlyRevenueData } from "@/lib/mock-data"
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
  const pieData = [
    { name: 'Admin (20%)', value: dashboardStats.adminEarnings },
    { name: 'Guides (80%)', value: dashboardStats.guideEarnings }
  ]

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
                  {dashboardStats.totalRevenue.toLocaleString()}
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">Admin Earnings (20%)</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {dashboardStats.adminEarnings.toLocaleString()}
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">Guide Earnings (80%)</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {dashboardStats.guideEarnings.toLocaleString()}
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
          <CardTitle className="text-sm sm:text-base">Platform Commission Structure</CardTitle>
          <CardDescription className="text-xs sm:text-sm">How revenue is distributed between platform and guides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Platform Commission</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">20%</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                The platform retains 20% of each booking as commission for providing the service.
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-chart-2/10 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Guide Earnings</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-chart-2">80%</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Guides receive 80% of the booking amount directly after the tour is completed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Users,
  UserCheck,
  IndianRupee,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { dashboardStats, weeklyBookingsData, monthlyRevenueData, mockBookings } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

const statCards = [
  {
    title: "Total Bookings",
    value: dashboardStats.totalBookings,
    icon: CalendarDays,
    trend: "+12%",
    trendUp: true,
    color: "text-chart-1"
  },
  {
    title: "Pending Bookings",
    value: dashboardStats.pendingBookings,
    icon: Clock,
    trend: "-5%",
    trendUp: false,
    color: "text-warning"
  },
  {
    title: "Completed",
    value: dashboardStats.completedBookings,
    icon: CheckCircle,
    trend: "+8%",
    trendUp: true,
    color: "text-success"
  },
  {
    title: "Total Guides",
    value: dashboardStats.totalGuides,
    icon: Users,
    trend: "+3",
    trendUp: true,
    color: "text-chart-2"
  },
  {
    title: "Active Guides",
    value: dashboardStats.activeGuides,
    icon: UserCheck,
    trend: "+2",
    trendUp: true,
    color: "text-primary"
  },
  {
    title: "Total Revenue",
    value: `₹${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`,
    icon: IndianRupee,
    trend: "+18%",
    trendUp: true,
    color: "text-chart-4"
  }
]

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning-foreground border-warning/20",
  Confirmed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "On the Way": "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Completed: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20"
}

export default function DashboardPage() {
  const recentBookings = mockBookings.slice(0, 5)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s your platform overview.</p>
      </div>

      {/* Stats Grid - Mobile: 2 cols, Tablet: 3 cols, Desktop: 6 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className={`flex items-center text-[10px] sm:text-xs font-medium ${stat.trendUp ? "text-success" : "text-destructive"}`}>
                  {stat.trendUp ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Bookings Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Weekly Bookings</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Number of bookings per day this week</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBookingsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Monthly Revenue</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Revenue breakdown by month</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="h-[200px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                    width={45}
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
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    fill="var(--primary)" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings - Mobile cards, Desktop table */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent Bookings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Cards */}
          <div className="block sm:hidden space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{booking.id}</p>
                    <p className="text-sm font-medium text-foreground">{booking.touristName}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColors[booking.status]}`}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Guide: {booking.guideName}</span>
                  <Badge variant={booking.bookingType === 'VIP' ? 'default' : 'secondary'} className="text-[10px]">
                    {booking.bookingType}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{booking.tourType}</p>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Booking ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Tourist</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Guide</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Tour</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">{booking.id}</td>
                    <td className="py-3 text-sm text-foreground">{booking.touristName}</td>
                    <td className="py-3 text-sm text-foreground">{booking.guideName}</td>
                    <td className="py-3 text-sm text-muted-foreground">{booking.tourType}</td>
                    <td className="py-3">
                      <Badge variant={booking.bookingType === 'VIP' ? 'default' : 'secondary'} className="text-xs">
                        {booking.bookingType}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className={`text-xs ${statusColors[booking.status]}`}>
                        {booking.status}
                      </Badge>
                    </td>
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

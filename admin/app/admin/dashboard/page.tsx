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
  TrendingDown,
  Star,
  MessageSquare,
  Car,
  Compass,
  Package,
  CreditCard,
  ArrowRight,
  FileText,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
import { useEffect, useState } from "react"
import { getAdminDashboard } from "@/lib/api/adminDashboard"
import { DateFilter } from "@/components/ui/date-filter"
import { BookingActions } from "@/components/admin/booking-actions"

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning-foreground border-warning/20",
  Confirmed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "On the Way": "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Completed: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20"
}

export default function DashboardPage() {
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all')

  const fetchDashboardData = async (filter: FilterPeriod = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      let dateFilter: { startDate?: string; endDate?: string } = {}

      switch (filter) {
        case 'today':
          dateFilter = {
            startDate: today.toISOString().split('T')[0],
            endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString().split('T')[0]
          }
          break
        case 'week':
          const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 - 1)
          dateFilter = {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0]
          }
          break
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          dateFilter = {
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0]
          }
          break
        default:
          dateFilter = {}
      }

      const data = await getAdminDashboard(dateFilter)
      setAdminData(data)
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleDateFilter = (filter: FilterPeriod) => {
    setActiveFilter(filter)
    fetchDashboardData(filter)
  }

  const handleBookingStatusChange = (bookingId: string, newStatus: string) => {
    // Update the booking status in the recent bookings list
    setAdminData((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        recentBookings: prev.recentBookings?.map((booking: any) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      }
    })
  }

  const weeklyBookings = adminData?.weeklyBookings || []
  const monthlyRevenue = adminData?.monthlyRevenue || []
  const recentBookings = adminData?.recentBookings || []

  const dashboardStats = {
    totalBookings: adminData?.bookings?.total || 0,
    pendingBookings: adminData?.bookings?.pending || 0,
    completedBookings: adminData?.bookings?.completed || 0,
    totalGuides: adminData?.guides || 0,
    totalDrivers: adminData?.totalDrivers || 0,
    totalRevenue: adminData?.revenue || 0,
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: dashboardStats.totalBookings,
      icon: CalendarDays,
      trendUp: true,
      color: "text-chart-1"
    },
    {
      title: "Pending Bookings",
      value: dashboardStats.pendingBookings,
      icon: Clock,
      trendUp: false,
      color: "text-warning"
    },
    {
      title: "Completed",
      value: dashboardStats.completedBookings,
      icon: CheckCircle,
      trendUp: true,
      color: "text-success"
    },
    {
      title: "Total Guides",
      value: dashboardStats.totalGuides,
      icon: Users,
      trendUp: true,
      color: "text-chart-2"
    },
    {
      title: "Total Drivers",
      value: dashboardStats.totalDrivers,
      icon: Users,
      trendUp: true,
      color: "text-primary"
    },
    {
      title: "Total Revenue",
      value: `₹${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`,
      icon: IndianRupee,
      trendUp: true,
      color: "text-chart-4"
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">GoGuide Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s your platform overview.</p>
        </div>
        <DateFilter
          activeFilter={activeFilter}
          onFilterChange={handleDateFilter}
          loading={loading}
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !adminData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 sm:p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && adminData && (
        <>
          {/* Stats Grid - Mobile: 2 cols, Tablet: 3 cols, Desktop: 6 cols */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title} className="border-border">
                <CardContent className="p-3 sm:p-4">
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
                    <BarChart data={weeklyBookings} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                    <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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

          {/* Upcoming Bookings & Recent Reviews Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Upcoming Bookings Preview Widget */}
            <Card className="border-border flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-amber-600" />
                    Upcoming Bookings
                  </CardTitle>
                  <CardDescription className="text-xs">Next scheduled trips requiring attention</CardDescription>
                </div>
                <Link href="/admin/upcoming-bookings">
                  <Button size="sm" variant="ghost" className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 gap-1 px-2">
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {adminData?.upcomingBookingsPreview?.length ? (
                  adminData.upcomingBookingsPreview.map((item: any) => (
                    <div key={item.id} className="p-3 rounded-xl border border-border bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{item.touristName}</p>
                          <Badge variant="outline" className={
                            item.type === "Cab" ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                              : item.type === "Guide" ? "bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]"
                          }>
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(item.date).toLocaleDateString()} at {item.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No upcoming bookings scheduled currently.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews Preview Widget */}
            <Card className="border-border flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Recent Reviews & Feedback
                  </CardTitle>
                  <CardDescription className="text-xs">Latest tourist ratings & comments</CardDescription>
                </div>
                <Link href="/admin/reviews">
                  <Button size="sm" variant="ghost" className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 gap-1 px-2">
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {adminData?.recentReviewsPreview?.length ? (
                  adminData.recentReviewsPreview.map((rev: any) => (
                    <div key={rev.id} className="p-3 rounded-xl border border-border bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground">{rev.userName}</p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic">&ldquo;{rev.comments}&rdquo;</p>
                      <p className="text-[10px] text-slate-400 text-right">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No recent reviews available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Sold Packages & Top Booked Guides Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top 3 Most Sold Packages */}
            <Card className="border-border flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Top Sold Packages
                  </CardTitle>
                  <CardDescription className="text-xs">Most popular packages by total sales</CardDescription>
                </div>
                <Link href="/admin/packages">
                  <Button size="sm" variant="ghost" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 gap-1 px-2">
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {adminData?.topSoldPackagesPreview?.length ? (
                  adminData.topSoldPackagesPreview.map((pkg: any) => (
                    <div key={pkg.id} className="p-3 rounded-xl border border-border bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{pkg.title}</p>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            ₹{pkg.price?.toLocaleString("en-IN")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Duration: {pkg.duration} • Category: {pkg.type}
                        </p>
                      </div>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0">
                        {pkg.salesCount} Sold
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No package sales recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top 3 Booked Guides */}
            <Card className="border-border flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Compass className="w-4 h-4 text-rose-600" />
                    Top Booked Tour Guides
                  </CardTitle>
                  <CardDescription className="text-xs">Highest rated & most requested guides</CardDescription>
                </div>
                <Link href="/admin/guide-bookings">
                  <Button size="sm" variant="ghost" className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 gap-1 px-2">
                    View All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {adminData?.topBookedGuidesPreview?.length ? (
                  adminData.topBookedGuidesPreview.map((guide: any) => (
                    <div key={guide.id} className="p-3 rounded-xl border border-border bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{guide.name}</p>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {guide.rating}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {guide.city} • {guide.experience} yrs exp
                        </p>
                      </div>
                      <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shrink-0">
                        {guide.totalBookings} Trips Completed
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    No guide booking stats available.
                  </div>
                )}
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
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{booking.id}</p>
                        <p className="text-sm font-medium text-foreground">{booking.touristName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={`text-[10px] ${statusColors[booking.status]}`}>
                          {booking.status}
                        </Badge>
                        <BookingActions
                          bookingId={booking.id}
                          status={booking.status}
                          onStatusChange={handleBookingStatusChange}
                        />
                      </div>
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
                    {recentBookings.map((booking: any) => (
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
                        <td className="py-3">
                          <BookingActions
                            bookingId={booking.id}
                            status={booking.status}
                            onStatusChange={handleBookingStatusChange}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

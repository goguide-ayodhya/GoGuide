"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, IndianRupee, CreditCard, Smartphone } from "lucide-react"
import { mockPayments, type Payment } from "@/lib/mock-data"

const statusColors: Record<string, string> = {
  Success: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning-foreground border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20"
}

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>(mockPayments)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.touristName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'Success' ? p.amount : 0), 0)
  const pendingAmount = payments.reduce((sum, p) => sum + (p.status === 'Pending' ? p.amount : 0), 0)
  const failedCount = payments.filter(p => p.status === 'Failed').length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Payment Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">View and track all payment transactions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Received</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pending Amount</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Failed Transactions</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID or tourist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments - Mobile Cards / Desktop Table */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">All Payments</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredPayments.length} transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-3 sm:p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{payment.id}</p>
                    <p className="text-sm font-medium text-foreground">{payment.touristName}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[payment.status]}`}>
                    {payment.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking:</span>
                    <span className="text-foreground font-medium">{payment.bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-foreground font-medium flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {payment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Method:</span>
                    <div className="flex items-center gap-1.5">
                      {payment.method === 'UPI' ? (
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="text-foreground">{payment.method}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-foreground">{payment.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Payment ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Booking ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Tourist</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">{payment.id}</td>
                    <td className="py-3 text-sm text-foreground">{payment.bookingId}</td>
                    <td className="py-3 text-sm text-foreground">{payment.touristName}</td>
                    <td className="py-3 text-sm font-medium text-foreground">
                      <span className="flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {payment.method === 'UPI' ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">{payment.method}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{payment.date}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={`text-xs ${statusColors[payment.status]}`}>
                        {payment.status}
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

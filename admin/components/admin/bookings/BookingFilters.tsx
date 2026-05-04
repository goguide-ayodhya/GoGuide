import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface BookingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterPayment: string;
  onPaymentChange: (value: string) => void;
  filterDate: string;
  onDateChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
}

export function BookingFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPayment,
  onPaymentChange,
  filterDate,
  onDateChange,
  filterType,
  onTypeChange,
}: BookingFiltersProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ID, name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select value={filterType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GUIDE">Guide</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
                <SelectItem value="PACKAGE">Package</SelectItem>
                <SelectItem value="TOKEN">Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="On the Way">On the Way</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Payment</label>
            <Select value={filterPayment} onValueChange={onPaymentChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Date</label>
            <Select value={filterDate} onValueChange={onDateChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
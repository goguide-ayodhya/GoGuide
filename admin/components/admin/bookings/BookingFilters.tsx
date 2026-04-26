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
}: BookingFiltersProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, tourist or guide..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Filter by status" />
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
          <div>
            <Select value={filterPayment} onValueChange={onPaymentChange}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
                <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                <SelectItem value="PARTIAL">PARTIAL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterDate} onValueChange={onDateChange}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Filter by date" />
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
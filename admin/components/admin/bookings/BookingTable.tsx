import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, CheckCircle, XCircle, IndianRupee, Calendar } from "lucide-react";

interface AdminBooking {
  id: string;
  touristName: string;
  touristEmail?: string;
  touristPhone?: string;
  guideName?: string;
  guideId?: string;
  tourType?: string;
  date?: string;
  meetingPoint?: string;
  dropoffLocation?: string;
  bookingType?: string;
  price?: number;
  finalPrice?: number;
  paidAmount?: number;
  remainingAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
  isSeenByAdmin?: boolean;
  createdAt?: string;
  startTime?: string;
  groupSize?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

interface BookingTableProps {
  bookings: AdminBooking[];
  onViewDetails: (booking: AdminBooking) => void;
  onApprove: (booking: AdminBooking) => void;
  onMarkSeen: (booking: AdminBooking) => void;
  onCancel: (booking: AdminBooking) => void;
  onComplete: (booking: AdminBooking) => void;
  onRefund: (booking: AdminBooking) => void;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-green-100 text-green-800 border-green-200",
  ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  "On the Way": "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

export function BookingTable({
  bookings,
  onViewDetails,
  onApprove,
  onMarkSeen,
  onCancel,
  onComplete,
  onRefund,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <Card className="border-border">
        <CardContent>
          <div className="py-12 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No bookings found</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">
          All Bookings
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {bookings.length} bookings found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Cards */}
        <div className="block lg:hidden space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`p-3 sm:p-4 rounded-lg border border-border bg-card ${
                !booking.isSeenByAdmin ? 'ring-2 ring-blue-500/20 bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    {booking.id}
                    {!booking.isSeenByAdmin && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-blue-500 text-white">
                        NEW
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {booking.touristName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.touristEmail}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${statusColors[booking.status ?? "Pending"]}`}
                >
                  {booking.status ?? "Pending"}
                </Badge>
              </div>

              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guide:</span>
                  <span className="text-foreground font-medium">
                    {booking.guideName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tour:</span>
                  <span className="text-foreground">
                    {booking.tourType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{booking.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-foreground font-medium flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {(booking.price ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge variant="outline" className="text-xs">
                    {booking.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge
                    variant={
                      booking.bookingType === "VIP"
                        ? "default"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {booking.bookingType}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  className="h-10 flex-1 text-xs"
                  onClick={() => onViewDetails(booking)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
                {!booking.isSeenByAdmin && (
                  <Button
                    variant="outline"
                    className="h-10 flex-1 text-xs"
                    onClick={() => onMarkSeen(booking)}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Mark Seen
                  </Button>
                )}
                {booking.status === "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 flex-1 text-xs"
                      onClick={() => onApprove(booking)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 flex-1 text-xs text-destructive hover:text-destructive"
                      onClick={() => onCancel(booking)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Cancel
                    </Button>
                  </>
                )}
                {(booking.status === "Confirmed" || booking.status === "On the Way") && (
                  <Button
                    variant="outline"
                    className="h-10 flex-1 text-xs"
                    onClick={() => onComplete(booking)}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Complete
                  </Button>
                )}
                {(booking.status === "Completed" || booking.status === "Cancelled") && booking.paymentStatus !== "REFUNDED" && (
                  <Button
                    variant="outline"
                    className="h-10 flex-1 text-xs text-orange-600 hover:text-orange-600"
                    onClick={() => onRefund(booking)}
                  >
                    Refund
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Booking ID
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Tourist
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Guide
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Tour Type
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Meeting Point
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Payment Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`border-b border-border last:border-0 ${
                    !booking.isSeenByAdmin ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="py-3 text-sm font-medium text-foreground flex items-center gap-2">
                    {booking.id}
                    {!booking.isSeenByAdmin && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-blue-500 text-white">
                        NEW
                      </Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {booking.touristName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.touristEmail}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-foreground">
                    {booking.guideName}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {booking.tourType}
                  </td>
                  <td className="py-3 text-sm text-foreground">
                    {booking.date}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {booking.meetingPoint}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        booking.bookingType === "VIP"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {booking.bookingType}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {(booking.price ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {booking.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[booking.status ?? "Pending"]}`}
                    >
                      {booking.status ?? "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(booking)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!booking.isSeenByAdmin && (
                          <DropdownMenuItem
                            onClick={() => onMarkSeen(booking)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Seen
                          </DropdownMenuItem>
                        )}
                        {booking.status === "Pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onApprove(booking)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onCancel(booking)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {(booking.status === "Confirmed" ||
                          booking.status === "On the Way") && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onComplete(booking)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onCancel(booking)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        {(booking.status === "Completed" || booking.status === "Cancelled") && booking.paymentStatus !== "REFUNDED" && (
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => onRefund(booking)}
                          >
                            Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
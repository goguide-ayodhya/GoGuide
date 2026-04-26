import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Calendar, MapPin, User } from "lucide-react";

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

interface BookingDetailsModalProps {
  booking: AdminBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function BookingDetailsModal({ booking, open, onOpenChange }: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Booking Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            Booking ID: {booking.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Tourist Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Tourist Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{booking.touristName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{booking.touristEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{booking.touristPhone || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Group Size</p>
                <p className="text-sm font-medium">{booking.groupSize} person{booking.groupSize !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Guide/Driver Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Service Provider</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{booking.bookingType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned</p>
                <p className="text-sm font-medium">{booking.guideName || "Not assigned"}</p>
              </div>
            </div>
          </div>

          {/* Tour Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Tour Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tour Type</p>
                <p className="text-sm font-medium">{booking.tourType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{booking.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Time</p>
                <p className="text-sm font-medium">{booking.startTime || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Meeting Point</p>
                <p className="text-sm font-medium">{booking.meetingPoint}</p>
              </div>
              {booking.dropoffLocation && (
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Drop-off Location</p>
                  <p className="text-sm font-medium">{booking.dropoffLocation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(booking.finalPrice ?? booking.price ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Paid Amount</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(booking.paidAmount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Remaining Amount</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(booking.remainingAmount ?? (booking.finalPrice ?? booking.price ?? 0) - (booking.paidAmount ?? 0)).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payment Status</p>
                <Badge variant="outline" className="text-xs w-fit">
                  {booking.paymentStatus}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="text-sm font-medium">{booking.paymentMethod || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Booking Status</p>
                <Badge
                  variant="outline"
                  className={`text-xs w-fit ${statusColors[booking.status ?? "Pending"]}`}
                >
                  {booking.status ?? "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Status Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Created At</span>
                <span className="text-xs font-medium">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
                </span>
              </div>
              {booking.cancelledAt && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cancelled At</span>
                  <span className="text-xs font-medium">
                    {new Date(booking.cancelledAt).toLocaleString()}
                  </span>
                </div>
              )}
              {booking.cancelledBy && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cancelled By</span>
                  <span className="text-xs font-medium capitalize">
                    {booking.cancelledBy.toLowerCase()}
                  </span>
                </div>
              )}
              {booking.cancellationReason && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cancellation Reason</p>
                  <p className="text-xs font-medium">{booking.cancellationReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Notes</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{booking.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
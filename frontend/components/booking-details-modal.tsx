"use client";

import { Booking } from "@/contexts/BookingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { BookingStatus } from "@/contexts/BookingsContext";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (onStatusChange) {
      onStatusChange(booking.id, newStatus);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30";
      case "on_the_way":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "completed":
        return "bg-purple-500/20 text-purple-700 border-purple-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle size={18} className="text-green-600" />;
    }
    return <AlertCircle size={18} className="text-amber-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
          <DialogDescription>Booking ID: {booking.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Booking Status
              </p>
              <Badge
                className={`mt-2 capitalize ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Payment Status
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getPaymentStatusIcon(booking.paymentStatus)}
                <span className="text-sm font-medium capitalize">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Tourist Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tourist Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-foreground font-semibold">
                    {booking.touristName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Group Size
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users size={18} className="text-primary" />
                    <p className="text-foreground font-semibold">
                      {booking.groupSize} people
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={16} className="text-muted-foreground" />
                    <p className="text-foreground text-sm">{booking.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-muted-foreground" />
                    <p className="text-foreground text-sm">{booking.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tour Type
                  </p>
                  <p className="text-foreground font-semibold mt-1">
                    {booking.tourType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={18} className="text-primary" />
                    <p className="text-foreground font-semibold">
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Time
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={18} className="text-primary" />
                    <p className="text-foreground font-semibold">
                      {booking.startTime}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Price
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign size={18} className="text-green-600" />
                    <p className="text-foreground font-semibold">
                      ${booking.totalPrice}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Meeting Point
                </p>
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
                  <MapPin
                    size={20}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                  <p className="text-foreground font-medium">
                    {booking.meetingPoint}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Dropoff Location
                </p>
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
                  <MapPin
                    size={20}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                  <p className="text-foreground font-medium">
                    {booking.dropoffLocation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {booking.status === "PENDING" && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("ACCEPTED")}
              >
                <CheckCircle size={18} className="mr-2" />
                Accept Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleStatusChange("CANCELLED")}
              >
                Decline Booking
              </Button>
            </div>
          )}

          {booking.status === "ACCEPTED" && (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusChange("REJECTED")}
              >
                Mark as On the Way
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusChange("COMPLETED")}
              >
                Mark as Completed
              </Button>
            </div>
          )}

          {booking.status === "PENDING" && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleStatusChange("COMPLETED")}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

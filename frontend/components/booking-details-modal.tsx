"use client";

import { useState } from "react";
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
import {
  formatPaymentAmounts,
  getPaymentStatusLabel,
} from "@/lib/payment-status";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
  /** Guide/driver: after cash is collected for COD */
  onCashCollected?: (bookingId: string) => Promise<void>;
  /** Retry payment for failed payments */
  onRetryPayment?: (bookingId: string) => Promise<void>;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  onCashCollected,
  onRetryPayment,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const [codLoading, setCodLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (onStatusChange) {
      onStatusChange(booking.id, newStatus);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "PENDING":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      case "COMPLETED":
        return "bg-purple-500/20 text-purple-700 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getPaymentStatusIcon = (label: string) => {
    if (label === "COMPLETED") {
      return <CheckCircle size={18} className="text-green-600" />;
    }
    return <AlertCircle size={18} className="text-amber-600" />;
  };

  const paymentLabel = getPaymentStatusLabel(booking);
  const amounts = formatPaymentAmounts(booking);

  const handleMarkCashCollected = async () => {
    if (!onCashCollected) return;
    setCodLoading(true);
    try {
      await onCashCollected(booking.id);
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Could not mark cash as collected",
      );
    } finally {
      setCodLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!onRetryPayment) return;
    setRetryLoading(true);
    try {
      await onRetryPayment(booking.id);
      window.alert("Payment retry initiated. Please complete the payment.");
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Could not retry payment",
      );
    } finally {
      setRetryLoading(false);
    }
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
                {getPaymentStatusIcon(paymentLabel)}
                <span className="text-sm font-medium">{paymentLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border border-border bg-muted/30 text-sm">
            <div>
              <p className="text-muted-foreground">Paid</p>
              <p className="font-semibold text-foreground">
                ₹{amounts.paid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold text-foreground">
                ₹{amounts.remaining.toFixed(2)}
              </p>
            </div>
            {amounts.discountSaved != null && (
              <div className="sm:col-span-2 text-green-600 dark:text-green-400">
                Discount saved: ₹{amounts.discountSaved.toFixed(2)}
              </div>
            )}
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
                      ₹{booking.finalPrice ?? booking.totalPrice}
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
                onClick={() => handleStatusChange("REJECTED")}
              >
                Decline Booking
              </Button>
            </div>
          )}

          {booking.status === "ACCEPTED" && (
            <div className="flex flex-col gap-3">
              {booking.paymentMethod === "COD" &&
                booking.paymentStatus !== "COMPLETED" &&
                onCashCollected && (
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={codLoading}
                    onClick={handleMarkCashCollected}
                  >
                    {codLoading ? "Updating…" : "Mark as Cash Collected"}
                  </Button>
                )}
              {booking.paymentStatus === "FAILED" &&
                booking.paymentType !== "COD" &&
                onRetryPayment && (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={retryLoading}
                    onClick={handleRetryPayment}
                  >
                    {retryLoading ? "Processing…" : "Retry Payment"}
                  </Button>
                )}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleStatusChange("COMPLETED")}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusChange("CANCELLED")}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}

          {booking.status === "COMPLETED" && (
            <div className="text-sm text-muted-foreground">
              This booking is already completed.
            </div>
          )}

          {booking.status === "REJECTED" && (
            <div className="text-sm text-muted-foreground">
              This booking request was rejected.
            </div>
          )}

          {booking.status === "CANCELLED" && (
            <div className="text-sm text-muted-foreground">
              This booking has been cancelled.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

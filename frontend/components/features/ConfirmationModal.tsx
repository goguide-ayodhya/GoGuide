"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Clock, MapPin, User, DollarSign } from "lucide-react";
import Link from "next/link";
import { Guide } from "@/contexts/GuideContext";
import type { BookingData } from "./BookingForm";

interface ConfirmationModalProps {
  isOpen: boolean;
  guide: Guide;
  bookingData: BookingData | null;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  guide,
  bookingData,
  onClose,
}: ConfirmationModalProps) {
  if (!bookingData) return null;

  const totalPrice =
    guide.price * bookingData.duration;
  const bookingId = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Booking Confirmed!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Your guide booking is ready
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary/20">
                <Check className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Booking ID */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Booking ID</p>
            <p className="text-lg font-bold text-foreground font-mono">
              {bookingId}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Save this for your records
            </p>
          </div>

          {/* Guide Info */}
          <div className="border-b border-border pb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Guide Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Guide</p>
                  <p className="font-medium text-foreground">
                    {guide.userId?.name || guide.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-medium text-foreground">
                    ₹{guide.price}/hour
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border-b border-border pb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(bookingData.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Time & Duration
                  </p>
                  <p className="font-medium text-foreground">
                    {bookingData.time} • {bookingData.duration} hour
                    {bookingData.duration !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Meeting Point</p>
                  <p className="font-medium text-foreground capitalize">
                    {bookingData.meetingPoint.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guide fee</span>
                <span className="text-foreground">
                  ₹{guide.price * bookingData.duration}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                <span className="text-foreground">Total Amount</span>
                <span className="text-primary">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
            <p className="text-sm text-foreground mb-1">
              <span className="font-semibold">Status: </span>
              <Badge className="bg-secondary text-white border-0">
                Confirmed
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The guide will contact you shortly to confirm all details.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Link href="/guides" className="flex-1">
            <Button className="w-full bg-secondary hover:bg-secondary/90">
              Browse More Guides
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

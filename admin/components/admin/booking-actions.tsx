"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { acceptBookingApi, rejectBookingApi } from "@/lib/api/bookings"
import { useToast } from "@/hooks/use-toast"

interface BookingActionsProps {
  bookingId: string
  status: string
  onStatusChange: (bookingId: string, newStatus: string) => void
}

export function BookingActions({ bookingId, status, onStatusChange }: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAccept = async () => {
    setLoading("accept")
    try {
      await acceptBookingApi(bookingId)
      onStatusChange(bookingId, "CONFIRMED")
      toast({
        title: "Booking accepted",
        description: "The booking has been confirmed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading("reject")
    try {
      await rejectBookingApi(bookingId)
      onStatusChange(bookingId, "CANCELLED")
      toast({
        title: "Booking rejected",
        description: "The booking has been cancelled.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (status !== "PENDING") {
    return null
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleAccept}
        disabled={loading !== null}
        className="gap-1"
      >
        {loading === "accept" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        Accept
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleReject}
        disabled={loading !== null}
        className="gap-1"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
        Reject
      </Button>
    </div>
  )
}
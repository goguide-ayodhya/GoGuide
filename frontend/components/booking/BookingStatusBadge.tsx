"use client";

import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/contexts/BookingsContext";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  PENDING: {
    label: "Pending",
    variant: "default",
  },
  ACCEPTED: {
    label: "Accepted",
    variant: "secondary",
  },
  REJECTED: {
    label: "Rejected",
    variant: "default",
  },
  COMPLETED: {
    label: "Completed",
    variant: "secondary",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
  },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status];

  const badgeStyles: Record<BookingStatus, string> = {
    PENDING:
      "bg-yellow-500/20 text-yellow-700 border-yellow-200 hover:bg-yellow-500/30",
    ACCEPTED:
      "bg-blue-500/20 text-blue-700 border-blue-200 hover:bg-blue-500/30",
    REJECTED:
      "bg-purple-500/20 text-purple-700 border-purple-200 hover:bg-purple-500/30",
    COMPLETED:
      "bg-green-500/20 text-green-700 border-green-200 hover:bg-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-700 border-red-200 hover:bg-red-500/30",
  };

  return (
    <Badge variant="outline" className={badgeStyles[status]}>
      {config.label}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/contexts/BookingsContext";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30",
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-purple-500/20 text-purple-700 hover:bg-purple-500/30",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-green-500/20 text-green-700 hover:bg-green-500/30",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-500/20 text-red-700 hover:bg-red-500/30",
    },
  };

  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

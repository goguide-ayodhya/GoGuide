import { Badge } from '@/components/ui/badge';

interface BookingStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'on_the_way' | 'completed' | 'cancelled';
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30',
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30',
    },
    on_the_way: {
      label: 'On the Way',
      className: 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-500/20 text-red-700 hover:bg-red-500/30',
    },
  };

  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

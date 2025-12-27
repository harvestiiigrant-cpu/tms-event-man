import { Badge } from '@/components/ui/badge';
import type { EventStatus } from '@/types/event';

interface EventStatusBadgeProps {
  status: EventStatus;
}

const statusConfig: Record<EventStatus, { label: string; labelKm: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', labelKm: 'ព្រាង', variant: 'secondary' },
  UPCOMING: { label: 'Upcoming', labelKm: 'នឹងមកដល់', variant: 'default' },
  ONGOING: { label: 'Ongoing', labelKm: 'កំពុងដំណើរការ', variant: 'default' },
  COMPLETED: { label: 'Completed', labelKm: 'បានបញ្ចប់', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', labelKm: 'បានលុបចោល', variant: 'destructive' },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.labelKm}
    </Badge>
  );
}

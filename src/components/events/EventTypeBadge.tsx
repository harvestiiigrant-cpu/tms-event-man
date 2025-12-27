import { Badge } from '@/components/ui/badge';
import type { EventType } from '@/types/event';
import { EVENT_TYPES } from '@/types/event';

interface EventTypeBadgeProps {
  type: EventType;
}

export function EventTypeBadge({ type }: EventTypeBadgeProps) {
  const typeInfo = EVENT_TYPES.find(t => t.code === type);

  return (
    <Badge variant="outline" className="font-normal">
      {typeInfo?.name_km || type}
    </Badge>
  );
}

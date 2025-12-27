import { Badge } from '@/components/ui/badge';
import type { EventFormat } from '@/types/event';
import { EVENT_FORMATS } from '@/types/event';
import { MapPin, Monitor, Globe } from 'lucide-react';

interface EventFormatBadgeProps {
  format: EventFormat;
}

const formatIcons: Record<EventFormat, any> = {
  IN_PERSON: MapPin,
  VIRTUAL: Monitor,
  HYBRID: Globe,
};

export function EventFormatBadge({ format }: EventFormatBadgeProps) {
  const formatInfo = EVENT_FORMATS.find(f => f.code === format);
  const Icon = formatIcons[format];

  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="h-3 w-3" />
      {formatInfo?.name_km || format}
    </Badge>
  );
}

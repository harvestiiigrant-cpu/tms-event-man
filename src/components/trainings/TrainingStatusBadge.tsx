import { Training } from '@/types/training';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TrainingStatus = Training['training_status'];

const statusConfig: Record<TrainingStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  },
  ONGOING: {
    label: 'Ongoing',
    className: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-accent text-accent-foreground hover:bg-accent',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  },
};

interface TrainingStatusBadgeProps {
  status: TrainingStatus;
}

export function TrainingStatusBadge({ status }: TrainingStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

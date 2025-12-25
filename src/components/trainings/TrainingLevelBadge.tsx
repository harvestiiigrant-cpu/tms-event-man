import { Badge } from '@/components/ui/badge';
import { TRAINING_LEVELS } from '@/types/training';
import type { TrainingLevel } from '@/types/training';

interface TrainingLevelBadgeProps {
  level?: TrainingLevel;
}

const levelStyles: Record<TrainingLevel, string> = {
  NATIONAL: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200',
  PROVINCIAL: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  CLUSTER: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
};

export function TrainingLevelBadge({ level }: TrainingLevelBadgeProps) {
  if (!level) return null;

  const levelInfo = TRAINING_LEVELS.find((l) => l.code === level);
  if (!levelInfo) return null;

  return (
    <Badge
      variant="outline"
      className={`${levelStyles[level]} font-medium`}
    >
      {levelInfo.name_km}
    </Badge>
  );
}

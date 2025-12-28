import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variantClasses[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
}

interface TableRowSkeletonProps {
  columns?: number;
  showCheckbox?: boolean;
  showActions?: boolean;
  className?: string;
}

export function TableRowSkeleton({
  columns = 6,
  showCheckbox = true,
  showActions = true,
  className,
}: TableRowSkeletonProps) {
  return (
    <div className={cn('flex items-center space-x-4 p-4 border-b', className)}>
      {showCheckbox && (
        <Skeleton variant="circular" width={20} height={20} />
      )}
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={16} />
        <Skeleton width="30%" height={12} />
      </div>
      {Array.from({ length: columns - 2 }).map((_, i) => (
        <Skeleton key={i} width={80} height={16} />
      ))}
      {showActions && <Skeleton variant="circular" width={32} height={32} />}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  showActions?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  showCheckbox = true,
  showActions = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-muted/30">
        {showCheckbox && <Skeleton width={40} height={16} />}
        <Skeleton width={40} height={16} className="ml-4" />
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={100} height={16} className="ml-4" />
        ))}
        {showActions && <Skeleton width={40} height={16} className="ml-auto" />}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton
          key={i}
          columns={columns}
          showCheckbox={showCheckbox}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  showImage?: boolean;
  imageHeight?: number;
  titleLines?: number;
  descriptionLines?: number;
  actionButtons?: number;
  className?: string;
}

export function CardSkeleton({
  showImage = true,
  imageHeight = 160,
  titleLines = 2,
  descriptionLines = 3,
  actionButtons = 1,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)}>
      {showImage && <Skeleton width="100%" height={imageHeight} variant="rectangular" />}
      <div className="space-y-3">
        <Skeleton width="80%" height={20} />
        {titleLines > 1 && <Skeleton width="60%" height={20} />}
        <div className="space-y-2 pt-2">
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          {descriptionLines > 2 && <Skeleton width="95%" height={14} />}
        </div>
      </div>
      {actionButtons > 0 && (
        <div className="flex gap-2 pt-2">
          {Array.from({ length: actionButtons }).map((_, i) => (
            <Skeleton key={i} width={80} height={36} />
          ))}
        </div>
      )}
    </div>
  );
}

interface StatsCardSkeletonProps {
  className?: string;
}

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton width={60} height={24} />
      </div>
      <div className="space-y-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={120} height={16} />
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function ChartSkeleton({
  height = 300,
  showLegend = true,
  className,
}: ChartSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <Skeleton width={150} height={20} />
      <Skeleton width="100%" height={height} variant="rectangular" />
      {showLegend && (
        <div className="flex gap-4 justify-center pt-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={14} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={14} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={14} />
          </div>
        </div>
      )}
    </div>
  );
}

interface ListItemSkeletonProps {
  avatar?: boolean;
  titleLines?: number;
  subtitleLines?: number;
  action?: boolean;
  className?: string;
}

export function ListItemSkeleton({
  avatar = true,
  titleLines = 2,
  subtitleLines = 1,
  action = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4 border-b', className)}>
      {avatar && <Skeleton variant="circular" width={48} height={48} />}
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={16} />
        {titleLines > 1 && <Skeleton width="30%" height={16} />}
        <div className="space-y-1 pt-1">
          <Skeleton width="60%" height={12} />
          {subtitleLines > 1 && <Skeleton width="45%" height={12} />}
        </div>
      </div>
      {action && <Skeleton variant="circular" width={32} height={32} />}
    </div>
  );
}

interface EventCardSkeletonProps {
  className?: string;
}

export function EventCardSkeleton({ className }: EventCardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <Skeleton width="100%" height={180} variant="rectangular" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton width="70%" height={20} />
          <Skeleton width={60} height={24} variant="circular" />
        </div>
        <div className="space-y-2">
          <Skeleton width="90%" height={14} />
          <Skeleton width="60%" height={14} />
        </div>
        <div className="flex gap-4 pt-2">
          <Skeleton width={100} height={14} />
          <Skeleton width={100} height={14} />
        </div>
        <Skeleton width={120} height={36} className="mt-4" />
      </div>
    </div>
  );
}

interface ProfileCardSkeletonProps {
  className?: string;
}

export function ProfileCardSkeleton({ className }: ProfileCardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex flex-col items-center space-y-4">
        <Skeleton variant="circular" width={100} height={100} />
        <div className="text-center space-y-2">
          <Skeleton width={150} height={24} />
          <Skeleton width={100} height={16} />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton width={100} height={14} />
            <Skeleton width={150} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

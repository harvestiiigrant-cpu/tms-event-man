import { cn } from '@/lib/utils';

interface BrandHeaderProps {
  variant?: 'full' | 'compact';
  centered?: boolean;
  className?: string;
}

export function BrandHeader({ variant = 'full', centered = true, className }: BrandHeaderProps) {
  return (
    <div className={cn('space-y-4', centered && 'text-center', className)}>
      {/* Dual Logo Display */}
      <div className={cn(
        'flex gap-6',
        centered ? 'items-center justify-center' : 'items-center'
      )}>
        {/* MoEYS Official Logo */}
        <div className="flex-shrink-0">
          <img
            src="/assets/logos/moeys-logo.png"
            alt="Ministry of Education, Youth and Sport"
            className={cn(
              variant === 'full' ? 'h-20 w-20' : 'h-12 w-12'
            )}
          />
        </div>

        {/* Divider */}
        {variant === 'full' && (
          <div className="h-20 w-px bg-border" />
        )}

        {/* ITD Logo */}
        <div className="flex-shrink-0">
          <img
            src="/assets/logos/itd-logo.png"
            alt="ITD"
            className={cn(
              variant === 'full' ? 'h-20 w-auto' : 'h-12 w-auto'
            )}
          />
        </div>
      </div>

    </div>
  );
}

// Compact version for headers
export function CompactBrandHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/assets/logos/moeys-logo.png"
        alt="MoEYS"
        className="h-10 w-10"
      />
      <div className="h-8 w-px bg-border" />
      <img
        src="/assets/logos/itd-logo.png"
        alt="ITD"
        className="h-10 w-auto"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">Training Management System</p>
        <p className="text-xs text-muted-foreground truncate">Ministry of Education, Youth and Sport</p>
      </div>
    </div>
  );
}

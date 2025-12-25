import * as React from 'react';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete?: () => void;
  isDeleting?: boolean;
  deleteLabel?: string;
  deleteDescription?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  isDeleting = false,
  deleteLabel = 'លុប',
  deleteDescription = 'តើអ្នកប្រាកដថាចង់លុបធាតុទាំងនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។',
  className,
  children,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 mb-4',
        className
      )}
    >
      <span className="text-sm font-medium">
        បានជ្រើសរើស {selectedCount} ធាតុ
      </span>

      <div className="flex-1" />

      {children}

      {onBulkDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLabel}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>បញ្ជាក់ការលុប</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>បោះបង់</AlertDialogCancel>
              <AlertDialogAction
                onClick={onBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'កំពុងលុប...' : 'លុប'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
      >
        <X className="mr-2 h-4 w-4" />
        សម្អាត
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

interface DeleteConfirmDialogProps {
  itemType: 'category' | 'type';
  itemName: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({ itemType, itemName, onConfirm, trigger }: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const getItemTypeLabel = () => {
    return itemType === 'category' ? 'ប្រភេទមុខវិជ្ជា' : 'ប្រភេទបណ្តុះបណ្តាល';
  };

  const handleConfirm = () => {
    onConfirm();
    toast({
      title: `បានលុប${getItemTypeLabel()}`,
      description: `${itemName} ត្រូវបានលុបចេញពីប្រព័ន្ធ។`,
      variant: 'destructive',
    });
    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
      <Trash2 className="h-3 w-3" />
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>តើអ្នកប្រាកដទេ?</AlertDialogTitle>
          <AlertDialogDescription>
            សកម្មភាពនេះនឹងលុប{getItemTypeLabel()} <strong>{itemName}</strong> ជាអចិន្ត្រៃយ៍។
            សកម្មភាពនេះមិនអាចត្រលប់វិញបានទេ ហើយអាចប៉ះពាល់ដល់ការបណ្តុះបណ្តាលដែលកំពុងប្រើប្រាស់{getItemTypeLabel()}នេះ។
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>បោះបង់</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            លុប
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Training } from '@/types/training';
import { XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CancelTrainingDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

export function CancelTrainingDialog({ training, trigger }: CancelTrainingDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCancelTraining = () => {
    // Here you would call the API to cancel the training
    console.log('Canceling training:', training.id);

    toast({
      title: 'Training Cancelled',
      description: `"${training.training_name}" has been cancelled successfully.`,
      variant: 'destructive',
    });

    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
      <XCircle className="mr-2 h-4 w-4" />
      Cancel Training
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Cancel Training</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to cancel{' '}
              <span className="font-semibold text-foreground">"{training.training_name}"</span>?
            </p>
            <p>This action will:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Mark the training as CANCELLED</li>
              <li>Notify all {training.current_participants} enrolled participants</li>
              <li>Remove the training from active listings</li>
              <li>Preserve attendance records for reporting</li>
            </ul>
            <p className="font-semibold text-destructive">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Training</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelTraining}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Cancel Training
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Training } from '@/types/training';
import { Copy, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface CloneTrainingDialogProps {
  training: Training;
  trigger?: React.ReactNode;
  onCloneSuccess?: (clonedTraining: Training) => void;
}

export function CloneTrainingDialog({
  training,
  trigger,
  onCloneSuccess,
}: CloneTrainingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeEnrollments, setIncludeEnrollments] = useState(false);
  const queryClient = useQueryClient();

  const handleCloneTraining = async () => {
    setLoading(true);

    try {
      const result = await api.trainings.clone(training.id, includeEnrollments);

      toast({
        title: 'Training Cloned Successfully',
        description: `"${training.training_name}" has been cloned. The new training is in DRAFT status.`,
      });

      // Invalidate trainings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['trainings'] });

      setOpen(false);
      onCloneSuccess?.(result.training);
    } catch (error) {
      toast({
        title: 'Failed to Clone Training',
        description: error instanceof Error ? error.message : 'An error occurred while cloning the training',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Copy className="mr-2 h-4 w-4" />
      Clone Training
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Training</DialogTitle>
          <DialogDescription>
            Create a duplicate of this training with the same settings and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Training Info */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium text-foreground">{training.training_name}</p>
            <p className="text-xs text-muted-foreground">Code: {training.training_code}</p>
          </div>

          {/* Clone Options */}
          <div className="space-y-3 border-t border-b py-4">
            <p className="text-sm font-medium">What should be cloned?</p>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox id="include-enrollments" checked={includeEnrollments} onCheckedChange={(checked) => setIncludeEnrollments(!!checked)} />
                <div className="flex-1">
                  <Label htmlFor="include-enrollments" className="text-sm font-medium cursor-pointer">
                    Include enrolled participants
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Copy all {training.current_participants} enrolled beneficiaries to the new training
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 ml-6">
              <p>✓ Training details (name, dates, location, settings)</p>
              <p>✓ Agenda items, materials, and surveys</p>
              <p>✓ GPS and geofence settings</p>
              <p>✓ New training created in DRAFT status</p>
              <p>✓ New unique training code generated</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium">New training will be created as DRAFT</p>
              <p>You can edit dates and other details before publishing.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCloneTraining} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Cloning...' : 'Clone Training'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

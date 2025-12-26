import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Beneficiary, Training } from '@/types/training';
import { Calendar, MapPin, Users, Loader2, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EnrollInTrainingDialogProps {
  beneficiary: Beneficiary;
  trigger: React.ReactNode;
}

export function EnrollInTrainingDialog({ beneficiary, trigger }: EnrollInTrainingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available trainings
  const { data: availableTrainings = [], isLoading } = useQuery({
    queryKey: ['available-trainings', beneficiary.teacher_id],
    queryFn: () => api.trainings.getAvailable(beneficiary.teacher_id),
    enabled: open,
  });

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: (trainingId: string) =>
      api.enrollments.create({
        training_id: trainingId,
        beneficiary_id: beneficiary.teacher_id,
        registration_method: 'MANUAL',
        training_role: 'PARTICIPANT',
        enrollment_type: 'ADMIN',
      }),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានចុះឈ្មោះដោយជោគជ័យ' });
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const handleToggleTraining = (trainingId: string) => {
    setSelectedTrainings((current) =>
      current.includes(trainingId)
        ? current.filter((id) => id !== trainingId)
        : [...current, trainingId]
    );
  };

  const handleEnroll = async () => {
    for (const trainingId of selectedTrainings) {
      await enrollMutation.mutateAsync(trainingId);
    }
    setSelectedTrainings([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ចុះឈ្មោះក្នុងការបណ្តុះបណ្តាល - {beneficiary.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : availableTrainings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-3" />
            <p>គ្មានការបណ្តុះបណ្តាលដែលអាចចុះឈ្មោះបានទេ</p>
            <p className="text-sm">អ្នកទទួលផលនេះបានចុះឈ្មោះរួចហើយក្នុងការបណ្តុះបណ្តាលដែលមាន</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {availableTrainings.map((training: Training) => {
                  const isSelected = selectedTrainings.includes(training.id);
                  const isFull = training.current_participants >= training.max_participants;

                  return (
                    <div
                      key={training.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      } ${isFull ? 'opacity-50' : ''}`}
                      onClick={() => !isFull && handleToggleTraining(training.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          disabled={isFull}
                          className="mt-1"
                          onCheckedChange={() => handleToggleTraining(training.id)}
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-medium">{training.training_name}</h4>
                            <p className="text-sm text-muted-foreground">{training.training_code}</p>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {training.training_location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {training.current_participants}/{training.max_participants}
                            </span>
                          </div>

                          {isFull && (
                            <Badge variant="destructive" className="text-xs">
                              ពេញហើយ
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                បោះបង់
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={selectedTrainings.length === 0 || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                ចុះឈ្មោះ ({selectedTrainings.length})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

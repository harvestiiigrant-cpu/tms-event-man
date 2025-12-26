import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Beneficiary } from '@/types/training';
import { Calendar, MapPin, Clock, Award, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BeneficiaryTrainingHistoryDialogProps {
  beneficiary: Beneficiary;
  trigger: React.ReactNode;
}

export function BeneficiaryTrainingHistoryDialog({ beneficiary, trigger }: BeneficiaryTrainingHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['enrolled-trainings', beneficiary.teacher_id],
    queryFn: () => api.trainings.getEnrolled(beneficiary.teacher_id),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>ប្រវត្តិការបណ្តុះបណ្តាល - {beneficiary.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trainings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mb-3" />
            <p>មិនទាន់បានចុះឈ្មោះក្នុងការបណ្តុះបណ្តាលណាមួយទេ</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {trainings.map((training: any) => (
                <div key={training.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{training.training_name}</h4>
                      <p className="text-sm text-muted-foreground">{training.training_code}</p>
                    </div>
                    {training.enrollment_status && (
                      <Badge variant={training.enrollment_status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {training.enrollment_status}
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {training.training_location}
                    </div>
                    {training.attendance_percentage !== null && training.attendance_percentage !== undefined && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>វត្តមាន: {Math.round(training.attendance_percentage)}%</span>
                      </div>
                    )}
                    {training.certificate_issued && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Award className="h-3 w-3" />
                        <span>វិញ្ញាបនប័ត្រ: {training.certificate_number || 'បានចេញ'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowRight,
  ArrowRightLeft,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Training, TransferPreview, AvailableTraining, Beneficiary } from '@/types/training';

interface TransferParticipantDialogProps {
  sourceTraining: Training;
  participant: {
    beneficiary_id: string;
    name: string;
    name_english?: string;
    teacher_id: string;
  };
  trigger: React.ReactNode;
  onTransferComplete?: () => void;
}

type Step = 'select' | 'preview' | 'confirm';

export function TransferParticipantDialog({
  sourceTraining,
  participant,
  trigger,
  onTransferComplete,
}: TransferParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available trainings
  const { data: availableTrainings = [], isLoading: loadingTrainings } = useQuery<AvailableTraining[]>({
    queryKey: ['available-trainings', sourceTraining.id],
    queryFn: () => api.transfers.getAvailableTrainings(sourceTraining.id),
    enabled: open,
  });

  // Fetch transfer preview
  const { data: preview, isLoading: loadingPreview, refetch: refetchPreview } = useQuery<TransferPreview>({
    queryKey: ['transfer-preview', participant.beneficiary_id, sourceTraining.id, selectedTrainingId],
    queryFn: () =>
      api.transfers.preview({
        beneficiary_id: participant.beneficiary_id,
        source_training_id: sourceTraining.id,
        target_training_id: selectedTrainingId,
      }),
    enabled: open && step === 'preview' && !!selectedTrainingId,
  });

  // Execute transfer mutation
  const transferMutation = useMutation({
    mutationFn: () =>
      api.transfers.execute({
        beneficiary_id: participant.beneficiary_id,
        source_training_id: sourceTraining.id,
        target_training_id: selectedTrainingId,
      }),
    onSuccess: (result) => {
      toast({
        title: 'ផ្ទេរបានជោគជ័យ',
        description: `បានផ្ទេរអ្នកចូលរួមរួមជាមួយ ${result.transferred_attendance_records} កំណត់ត្រាវត្តមាន`,
      });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-grid'] });
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      setOpen(false);
      onTransferComplete?.();
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('select');
      setSelectedTrainingId('');
    }
  }, [open]);

  // Handle next step
  const handleNext = () => {
    if (step === 'select' && selectedTrainingId) {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('confirm');
    }
  };

  // Handle back
  const handleBack = () => {
    if (step === 'preview') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('preview');
    }
  };

  // Handle confirm transfer
  const handleConfirm = () => {
    transferMutation.mutate();
  };

  const selectedTraining = availableTrainings.find((t) => t.id === selectedTrainingId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            ផ្ទេរអ្នកចូលរួម
          </DialogTitle>
          <DialogDescription>
            ផ្ទេរ {participant.name} ទៅការបណ្តុះបណ្តាលផ្សេង រួមជាមួយកំណត់ត្រាវត្តមានរបស់គាត់
          </DialogDescription>
        </DialogHeader>

        {/* Participant Info Card */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{participant.name}</div>
              <div className="text-sm text-muted-foreground">
                {participant.teacher_id} • {sourceTraining.training_name}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Target Training */}
        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                ជ្រើសរើសការបណ្តុះបណ្តាលគោលដៅ
              </label>
              {loadingTrainings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableTrainings.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>គ្មានការបណ្តុះបណ្តាល</AlertTitle>
                  <AlertDescription>
                    មិនមានការបណ្តុះបណ្តាលដែលអាចផ្ទេរទៅបានទេ
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសការបណ្តុះបណ្តាល..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrainings.map((training) => (
                      <SelectItem key={training.id} value={training.id}>
                        <div className="flex flex-col">
                          <span>{training.training_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {training.training_code} • {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedTraining && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="text-sm font-medium mb-2">ការបណ្តុះបណ្តាលគោលដៅ:</div>
                <div className="font-medium">{selectedTraining.training_name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {format(parseISO(selectedTraining.training_start_date), 'MMM d')} - {format(parseISO(selectedTraining.training_end_date), 'MMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  អ្នកចូលរួម: {selectedTraining.current_participants}/{selectedTraining.max_participants}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview Transfer */}
        {step === 'preview' && (
          <div className="space-y-4">
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : preview ? (
              <>
                {/* Transfer Summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-muted-foreground mb-1">ពី</div>
                    <div className="font-medium text-sm">{preview.source_training.training_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preview.source_training.start_date} - {preview.source_training.end_date}
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="text-xs text-muted-foreground mb-1">ទៅ</div>
                    <div className="font-medium text-sm">{preview.target_training.training_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preview.target_training.start_date} - {preview.target_training.end_date}
                    </div>
                  </div>
                </div>

                {/* Attendance Records Info */}
                <Alert className={preview.records_that_will_transfer < preview.attendance_records_count ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>កំណត់ត្រាវត្តមាន</AlertTitle>
                  <AlertDescription>
                    {preview.attendance_records_count > 0 ? (
                      <>
                        <strong>{preview.records_that_will_transfer}</strong> ក្នុងចំណោម <strong>{preview.attendance_records_count}</strong> កំណត់ត្រាវត្តមាននឹងត្រូវបានផ្ទេរ
                        {preview.records_that_will_transfer < preview.attendance_records_count && (
                          <div className="mt-1 text-yellow-700">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {preview.attendance_records_count - preview.records_that_will_transfer} កំណត់ត្រានឹងមិនត្រូវបានផ្ទេរ ដោយសារការបណ្តុះបណ្តាលគោលដៅខ្លីជាង
                          </div>
                        )}
                      </>
                    ) : (
                      'មិនមានកំណត់ត្រាវត្តមានដើម្បីផ្ទេរ'
                    )}
                  </AlertDescription>
                </Alert>

                {/* Day Mapping Table */}
                {preview.day_mapping.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">ការផ្គូផ្គងថ្ងៃ:</div>
                    <ScrollArea className="h-[200px] border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted">
                          <tr>
                            <th className="text-left p-2">ថ្ងៃទី</th>
                            <th className="text-left p-2">កាលបរិច្ឆេទប្រភព</th>
                            <th className="text-center p-2"></th>
                            <th className="text-left p-2">កាលបរិច្ឆេទគោលដៅ</th>
                            <th className="text-center p-2">ស្ថានភាព</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.day_mapping.map((mapping) => (
                            <tr key={mapping.day_number} className="border-b">
                              <td className="p-2 font-medium">{mapping.day_number}</td>
                              <td className="p-2">{format(parseISO(mapping.source_date), 'MMM d, yyyy')}</td>
                              <td className="p-2 text-center">
                                <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                              </td>
                              <td className="p-2">{format(parseISO(mapping.target_date), 'MMM d, yyyy')}</td>
                              <td className="p-2 text-center">
                                {mapping.will_transfer ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-600 mx-auto" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>
                )}
              </>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>កំហុស</AlertTitle>
                <AlertDescription>មិនអាចបង្កើតការមើលជាមុនបានទេ</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && preview && (
          <div className="space-y-4">
            <Alert className="border-primary bg-primary/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>បញ្ជាក់ការផ្ទេរ</AlertTitle>
              <AlertDescription>
                សូមបញ្ជាក់ថាអ្នកចង់ផ្ទេរ <strong>{participant.name}</strong> ពី <strong>{preview.source_training.training_name}</strong> ទៅ <strong>{preview.target_training.training_name}</strong>។
                <br /><br />
                <strong>{preview.records_that_will_transfer}</strong> កំណត់ត្រាវត្តមាននឹងត្រូវបានផ្ទេរ។
                <br /><br />
                <span className="text-destructive">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។</span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step !== 'select' && (
            <Button variant="outline" onClick={handleBack} disabled={transferMutation.isPending}>
              ថយក្រោយ
            </Button>
          )}

          <Button variant="outline" onClick={() => setOpen(false)} disabled={transferMutation.isPending}>
            បោះបង់
          </Button>

          {step === 'select' && (
            <Button onClick={handleNext} disabled={!selectedTrainingId}>
              បន្ទាប់
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 'preview' && (
            <Button onClick={handleNext} disabled={!preview}>
              បន្ទាប់
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 'confirm' && (
            <Button
              onClick={handleConfirm}
              disabled={transferMutation.isPending}
              className="bg-primary"
            >
              {transferMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              បញ្ជាក់ការផ្ទេរ
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

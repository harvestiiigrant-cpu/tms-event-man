import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import type { Training, TrainingAgenda } from '@/types/training';
import { Plus, Trash2, Clock, User, Loader2, GripVertical, Copy } from 'lucide-react';
import { differenceInDays, addDays, format } from 'date-fns';

interface ManageAgendaDialogProps {
  training: Training;
  trigger: React.ReactNode;
}

interface AgendaItem extends Partial<TrainingAgenda> {
  tempId?: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

export function ManageAgendaDialog({ training, trigger }: ManageAgendaDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  // Calculate training days
  const startDate = new Date(training.training_start_date);
  const endDate = new Date(training.training_end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  // Fetch existing agendas
  const { data: existingAgendas = [], isLoading } = useQuery({
    queryKey: ['agendas', training.id],
    queryFn: () => api.agendas.getByTraining(training.id),
    enabled: open,
  });

  // Fetch all trainings for copy feature
  const { data: allTrainings = [] } = useQuery({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
    enabled: open,
  });

  // Initialize agendas when data is loaded
  useEffect(() => {
    if (existingAgendas.length > 0) {
      setAgendas(existingAgendas.map((a: TrainingAgenda) => ({ ...a })));
    } else {
      setAgendas([]);
    }
  }, [existingAgendas]);

  // Expand first day by default
  useEffect(() => {
    if (open && totalDays > 0) {
      setExpandedDays(['day-1']);
    }
  }, [open, totalDays]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Filter out deleted items and prepare data
      const toSave = agendas
        .filter((a) => !a.isDeleted)
        .map((a) => ({
          id: a.isNew ? undefined : a.id,
          day_number: a.day_number,
          start_time: a.start_time,
          end_time: a.end_time,
          topic_en: a.topic_en,
          topic_km: a.topic_km,
          description_en: a.description_en,
          description_km: a.description_km,
          instructor_name: a.instructor_name,
          instructor_name_km: a.instructor_name_km,
          sort_order: a.sort_order,
        }));

      return api.agendas.bulkUpdate(training.id, toSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas', training.id] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានរក្សាទុកកម្មវិធីដោយជោគជ័យ',
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការរក្សាទុក',
        variant: 'destructive',
      });
    },
  });

  // Copy from another training
  const copyMutation = useMutation({
    mutationFn: (sourceTrainingId: string) =>
      api.agendas.copyFrom(training.id, sourceTrainingId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agendas', training.id] });
      toast({
        title: 'ជោគជ័យ',
        description: `បានចម្លង ${data.count} កម្មវិធី`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការចម្លង',
        variant: 'destructive',
      });
    },
  });

  const addAgendaItem = (dayNumber: number) => {
    const dayAgendas = agendas.filter(
      (a) => a.day_number === dayNumber && !a.isDeleted
    );
    const maxSort = Math.max(0, ...dayAgendas.map((a) => a.sort_order || 0));

    setAgendas([
      ...agendas,
      {
        tempId: `new-${Date.now()}`,
        isNew: true,
        day_number: dayNumber,
        start_time: '08:00',
        end_time: '10:00',
        topic_en: '',
        topic_km: '',
        sort_order: maxSort + 1,
      },
    ]);
  };

  const updateAgendaItem = (
    index: number,
    field: keyof AgendaItem,
    value: string | number
  ) => {
    const updated = [...agendas];
    updated[index] = { ...updated[index], [field]: value };
    setAgendas(updated);
  };

  const deleteAgendaItem = (index: number) => {
    const updated = [...agendas];
    if (updated[index].isNew) {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], isDeleted: true };
    }
    setAgendas(updated);
  };

  const getAgendasForDay = (dayNumber: number) => {
    return agendas
      .map((a, index) => ({ ...a, originalIndex: index }))
      .filter((a) => a.day_number === dayNumber && !a.isDeleted)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  };

  const handleCopyFrom = (sourceTrainingId: string) => {
    if (sourceTrainingId) {
      copyMutation.mutate(sourceTrainingId);
    }
  };

  // Other trainings that can be copied from
  const otherTrainings = allTrainings.filter(
    (t: Training) => t.id !== training.id
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>គ្រប់គ្រងកម្មវិធី</DialogTitle>
          <DialogDescription>
            បន្ថែម កែសម្រួល ឬលុបកម្មវិធីសម្រាប់ការបណ្តុះបណ្តាល "{training.training_name}"
          </DialogDescription>
        </DialogHeader>

        {/* Copy from another training */}
        {otherTrainings.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">ចម្លងពី:</span>
            <Select onValueChange={handleCopyFrom}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="ជ្រើសរើសការបណ្តុះបណ្តាល" />
              </SelectTrigger>
              <SelectContent>
                {otherTrainings.map((t: Training) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.training_name} ({t.training_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <ScrollArea className="h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedDays}
              onValueChange={setExpandedDays}
              className="space-y-2"
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
                const dayDate = addDays(startDate, dayNum - 1);
                const dayAgendas = getAgendasForDay(dayNum);

                return (
                  <AccordionItem
                    key={dayNum}
                    value={`day-${dayNum}`}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">ថ្ងៃទី {dayNum}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(dayDate, 'EEEE, MMM d, yyyy')}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {dayAgendas.length} កម្មវិធី
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {dayAgendas.map((agenda) => (
                          <Card key={agenda.id || agenda.tempId}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0 cursor-move" />
                                <div className="flex-1 space-y-3">
                                  {/* Time */}
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="time"
                                      value={agenda.start_time || '08:00'}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'start_time',
                                          e.target.value
                                        )
                                      }
                                      className="w-28"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                      type="time"
                                      value={agenda.end_time || '10:00'}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'end_time',
                                          e.target.value
                                        )
                                      }
                                      className="w-28"
                                    />
                                  </div>

                                  {/* Topic */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Topic (English)</Label>
                                      <Input
                                        placeholder="Topic title"
                                        value={agenda.topic_en || ''}
                                        onChange={(e) =>
                                          updateAgendaItem(
                                            agenda.originalIndex,
                                            'topic_en',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">ប្រធានបទ (ខ្មែរ)</Label>
                                      <Input
                                        placeholder="ប្រធានបទ"
                                        value={agenda.topic_km || ''}
                                        onChange={(e) =>
                                          updateAgendaItem(
                                            agenda.originalIndex,
                                            'topic_km',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Instructor */}
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <Input
                                      placeholder="Instructor name"
                                      value={agenda.instructor_name || ''}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'instructor_name',
                                          e.target.value
                                        )
                                      }
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="ឈ្មោះអ្នកបង្រៀន"
                                      value={agenda.instructor_name_km || ''}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'instructor_name_km',
                                          e.target.value
                                        )
                                      }
                                      className="flex-1"
                                    />
                                  </div>

                                  {/* Description */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <Textarea
                                      placeholder="Description..."
                                      value={agenda.description_en || ''}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'description_en',
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                    />
                                    <Textarea
                                      placeholder="ការពិពណ៌នា..."
                                      value={agenda.description_km || ''}
                                      onChange={(e) =>
                                        updateAgendaItem(
                                          agenda.originalIndex,
                                          'description_km',
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                  onClick={() => deleteAgendaItem(agenda.originalIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => addAgendaItem(dayNum)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          បន្ថែមកម្មវិធី
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            បោះបង់
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            រក្សាទុក
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

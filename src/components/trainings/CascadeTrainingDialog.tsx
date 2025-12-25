import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, TrendingDown } from 'lucide-react';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Training, TrainingLevel } from '@/types/training';
import { TRAINING_LEVELS } from '@/types/training';
import { Badge } from '@/components/ui/badge';

const cascadeFormSchema = z.object({
  training_start_date: z.date({ required_error: 'Start date is required' }),
  training_end_date: z.date({ required_error: 'End date is required' }),
}).refine((data) => data.training_end_date >= data.training_start_date, {
  message: 'End date must be after start date',
  path: ['training_end_date'],
});

type CascadeFormValues = z.infer<typeof cascadeFormSchema>;

interface CascadeTrainingDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

const getLevelHierarchy = (level: TrainingLevel): { current: number; next: TrainingLevel | null } => {
  const hierarchy = { NATIONAL: 1, PROVINCIAL: 2, CLUSTER: 3 } as const;
  const nextLevel = { NATIONAL: 'PROVINCIAL', PROVINCIAL: 'CLUSTER', CLUSTER: null } as const;

  return {
    current: hierarchy[level],
    next: nextLevel[level] as TrainingLevel | null,
  };
};

export function CascadeTrainingDialog({ training, trigger }: CascadeTrainingDialogProps) {
  const [open, setOpen] = useState(false);

  const levelInfo = getLevelHierarchy(training.training_level || 'NATIONAL');
  const nextLevel = levelInfo.next;

  // If already at the lowest level (CLUSTER), can't cascade further
  if (!nextLevel) {
    return null;
  }

  const currentLevelName = TRAINING_LEVELS.find(l => l.code === training.training_level)?.name_km || '';
  const nextLevelName = TRAINING_LEVELS.find(l => l.code === nextLevel)?.name_km || '';

  const form = useForm<CascadeFormValues>({
    resolver: zodResolver(cascadeFormSchema),
    defaultValues: {
      training_start_date: undefined,
      training_end_date: undefined,
    },
  });

  const onSubmit = (data: CascadeFormValues) => {
    // Create new training with cascaded data
    const cascadedTraining = {
      ...training,
      id: `TR-${Date.now()}`, // Generate new ID (replace with actual ID generation)
      training_code: `TR-${Date.now()}`, // Generate new code
      training_level: nextLevel,
      training_start_date: format(data.training_start_date, 'yyyy-MM-dd'),
      training_end_date: format(data.training_end_date, 'yyyy-MM-dd'),
      current_participants: 0, // Reset participants
      training_created_at: new Date().toISOString(),
      training_updated_at: new Date().toISOString(),
    };

    console.log('Cascaded training:', cascadedTraining);

    toast({
      title: 'Training Cascaded Successfully',
      description: `Created ${nextLevelName} training from ${currentLevelName} training.`,
    });

    setOpen(false);
    form.reset();
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <TrendingDown className="mr-2 h-4 w-4" />
      Cascade to {nextLevelName}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Cascade Training to Next Level
          </DialogTitle>
          <DialogDescription>
            Create a new {nextLevelName} training based on this {currentLevelName} training. All fields will be copied except dates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Source Training Info */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Source Training</p>
              <Badge variant="outline">{currentLevelName}</Badge>
            </div>
            <p className="text-sm text-foreground font-medium">{training.training_name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {training.training_code}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(training.training_start_date), 'PPP')} - {format(new Date(training.training_end_date), 'PPP')}
            </p>
          </div>

          {/* New Level Info */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Will be created as:</span>
            <Badge>{nextLevelName}</Badge>
          </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Set New Training Dates</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="training_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="training_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormDescription>
                  All other fields (category, type, location, GPS settings, etc.) will be copied from the source training.
                </FormDescription>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create {nextLevelName} Training
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

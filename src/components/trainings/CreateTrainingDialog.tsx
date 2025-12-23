import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TRAINING_CATEGORIES } from '@/types/training';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const trainingFormSchema = z.object({
  training_name: z.string().min(3, 'Training name must be at least 3 characters'),
  training_name_english: z.string().min(3, 'English name must be at least 3 characters'),
  training_description: z.string().optional(),
  training_category: z.string().min(1, 'Please select a category'),
  training_type: z.enum(['WORKSHOP', 'COURSE', 'SEMINAR']),
  training_start_date: z.date({ required_error: 'Start date is required' }),
  training_end_date: z.date({ required_error: 'End date is required' }),
  training_location: z.string().min(2, 'Location is required'),
  training_venue: z.string().optional(),
  max_participants: z.coerce.number().min(1, 'Must have at least 1 participant').max(500, 'Maximum 500 participants'),
  gps_validation_required: z.boolean().default(false),
  geofence_validation_required: z.boolean().default(false),
  venue_latitude: z.coerce.number().optional(),
  venue_longitude: z.coerce.number().optional(),
  geofence_radius: z.coerce.number().min(10).max(1000).default(100),
}).refine((data) => data.training_end_date >= data.training_start_date, {
  message: 'End date must be after start date',
  path: ['training_end_date'],
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

interface CreateTrainingDialogProps {
  children: React.ReactNode;
}

export function CreateTrainingDialog({ children }: CreateTrainingDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      training_name: '',
      training_name_english: '',
      training_description: '',
      training_category: '',
      training_type: 'WORKSHOP',
      training_location: '',
      training_venue: '',
      max_participants: 30,
      gps_validation_required: false,
      geofence_validation_required: false,
      geofence_radius: 100,
    },
  });

  const watchGpsRequired = form.watch('gps_validation_required');
  const watchGeofenceRequired = form.watch('geofence_validation_required');

  function onSubmit(data: TrainingFormValues) {
    console.log('Training data:', data);
    toast({
      title: 'Training Created',
      description: `"${data.training_name_english}" has been created successfully.`,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Training</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new training program.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="training_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Name (Khmer)</FormLabel>
                    <FormControl>
                      <Input placeholder="វគ្គបណ្តុះបណ្តាល..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="training_name_english"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Training program name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="training_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the training..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="training_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRAINING_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.code} value={cat.code}>
                              {cat.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="training_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WORKSHOP">Workshop</SelectItem>
                          <SelectItem value="COURSE">Course</SelectItem>
                          <SelectItem value="SEMINAR">Seminar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Schedule</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="training_start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                            className={cn('p-3 pointer-events-auto')}
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
                      <FormLabel>End Date</FormLabel>
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
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Location</h3>
              
              <FormField
                control={form.control}
                name="training_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Province</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Phnom Penh, Siem Reap..." className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="training_venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input placeholder="School name or venue..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Participants</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={500} {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of participants allowed (1-500)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GPS Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">GPS & Attendance Settings</h3>
              
              <FormField
                control={form.control}
                name="gps_validation_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">GPS Validation</FormLabel>
                      <FormDescription>
                        Require GPS location when marking attendance
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="geofence_validation_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Geofence Validation</FormLabel>
                      <FormDescription>
                        Only allow check-in within venue radius
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {(watchGpsRequired || watchGeofenceRequired) && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    GPS coordinates for venue location
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="venue_latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="11.5564" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="venue_longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" placeholder="104.9282" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchGeofenceRequired && (
                    <FormField
                      control={form.control}
                      name="geofence_radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geofence Radius (meters)</FormLabel>
                          <FormControl>
                            <Input type="number" min={10} max={1000} {...field} />
                          </FormControl>
                          <FormDescription>
                            Allowed check-in radius from venue (10-1000m)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Training</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

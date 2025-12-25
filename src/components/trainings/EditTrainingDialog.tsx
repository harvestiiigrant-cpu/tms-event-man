import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Pencil } from 'lucide-react';
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
import { TRAINING_CATEGORIES, TRAINING_TYPES, TRAINING_LEVELS, TRAINING_STATUSES } from '@/types/training';
import type { Training, TrainingStatus } from '@/types/training';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const trainingFormSchema = z.object({
  training_name: z.string().min(3, 'ឈ្មោះវគ្គបណ្តុះបណ្តាលត្រូវមានយ៉ាងតិច ៣ តួអក្សរ'),
  training_description: z.string().optional(),
  training_category: z.string().min(1, 'សូមជ្រើសរើសប្រភេទ'),
  training_type: z.enum(['WORKSHOP', 'COURSE', 'SEMINAR']),
  training_level: z.enum(['NATIONAL', 'PROVINCIAL', 'CLUSTER'], { required_error: 'សូមជ្រើសរើសកម្រិត' }),
  training_status: z.enum(['DRAFT', 'ONGOING', 'COMPLETED', 'CANCELLED'], { required_error: 'សូមជ្រើសរើសស្ថានភាព' }),
  training_start_date: z.date({ required_error: 'ត្រូវការកាលបរិច្ឆេទចាប់ផ្តើម' }),
  training_end_date: z.date({ required_error: 'ត្រូវការកាលបរិច្ឆេទបញ្ចប់' }),
  training_location: z.string().min(2, 'ទីតាំងត្រូវបានទាមទារ'),
  training_venue: z.string().optional(),
  cluster_schools: z.string().optional(),
  max_participants: z.coerce.number().min(1, 'ត្រូវមានយ៉ាងហោចណាស់ ១ នាក់').max(500, 'អតិបរមា ៥០០ នាក់'),
  gps_validation_required: z.boolean().default(false),
  geofence_validation_required: z.boolean().default(false),
  venue_latitude: z.coerce.number().optional(),
  venue_longitude: z.coerce.number().optional(),
  geofence_radius: z.coerce.number().min(10).max(1000).default(100),
}).refine((data) => data.training_end_date >= data.training_start_date, {
  message: 'កាលបរិច្ឆេទបញ្ចប់ត្រូវតែក្រោយកាលបរិច្ឆេទចាប់ផ្តើម',
  path: ['training_end_date'],
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

interface EditTrainingDialogProps {
  training: Training;
  trigger?: React.ReactNode;
  onUpdate?: (updatedTraining: Training) => void;
}

export function EditTrainingDialog({ training, trigger, onUpdate }: EditTrainingDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      training_name: training.training_name,
      training_description: training.training_description || '',
      training_category: training.training_category || '',
      training_type: training.training_type || 'WORKSHOP',
      training_level: training.training_level || 'NATIONAL',
      training_status: training.training_status || 'DRAFT',
      training_start_date: new Date(training.training_start_date),
      training_end_date: new Date(training.training_end_date),
      training_location: training.training_location,
      training_venue: training.training_venue || '',
      cluster_schools: training.cluster_schools?.join(', ') || '',
      max_participants: training.max_participants,
      gps_validation_required: training.gps_validation_required,
      geofence_validation_required: training.geofence_validation_required,
      venue_latitude: training.venue_latitude,
      venue_longitude: training.venue_longitude,
      geofence_radius: training.geofence_radius,
    },
  });

  const watchGpsRequired = form.watch('gps_validation_required');
  const watchGeofenceRequired = form.watch('geofence_validation_required');
  const watchTrainingLevel = form.watch('training_level');

  useEffect(() => {
    if (open) {
      form.reset({
        training_name: training.training_name,
        training_description: training.training_description || '',
        training_category: training.training_category || '',
        training_type: training.training_type || 'WORKSHOP',
        training_level: training.training_level || 'NATIONAL',
        training_status: training.training_status || 'DRAFT',
        training_start_date: new Date(training.training_start_date),
        training_end_date: new Date(training.training_end_date),
        training_location: training.training_location,
        training_venue: training.training_venue || '',
        cluster_schools: training.cluster_schools?.join(', ') || '',
        max_participants: training.max_participants,
        gps_validation_required: training.gps_validation_required,
        geofence_validation_required: training.geofence_validation_required,
        venue_latitude: training.venue_latitude,
        venue_longitude: training.venue_longitude,
        geofence_radius: training.geofence_radius,
      });
    }
  }, [open, training, form]);

  function onSubmit(data: TrainingFormValues) {
    const updatedTraining: Training = {
      ...training,
      training_name: data.training_name,
      training_description: data.training_description,
      training_category: data.training_category,
      training_type: data.training_type,
      training_level: data.training_level,
      training_status: data.training_status,
      training_start_date: data.training_start_date.toISOString(),
      training_end_date: data.training_end_date.toISOString(),
      training_location: data.training_location,
      training_venue: data.training_venue,
      cluster_schools: data.cluster_schools ? data.cluster_schools.split(',').map(s => s.trim()) : undefined,
      max_participants: data.max_participants,
      gps_validation_required: data.gps_validation_required,
      geofence_validation_required: data.geofence_validation_required,
      venue_latitude: data.venue_latitude,
      venue_longitude: data.venue_longitude,
      geofence_radius: data.geofence_radius,
      training_updated_at: new Date().toISOString(),
    };

    if (onUpdate) {
      onUpdate(updatedTraining);
    }

    console.log('Updated training data:', updatedTraining);
    toast({
      title: 'បានធ្វើបច្ចុប្បន្នភាពវគ្គបណ្តុះបណ្តាល',
      description: `"${data.training_name}" ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ។`,
    });
    setOpen(false);
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Pencil className="mr-2 h-4 w-4" />
      កែសម្រួល
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>កែសម្រួលវគ្គបណ្តុះបណ្តាល</DialogTitle>
          <DialogDescription>
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានវគ្គបណ្តុះបណ្តាល។
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Same form fields as CreateTrainingDialog but pre-filled */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">ព័ត៌មានមូលដ្ឋាន</h3>

                <FormField
                  control={form.control}
                  name="training_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ឈ្មោះវគ្គបណ្តុះបណ្តាល</FormLabel>
                      <FormControl>
                        <Input placeholder="វគ្គបណ្តុះបណ្តាល..." {...field} />
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
                      <FormLabel>ការពិពណ៌នា</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ការពិពណ៌នាសង្ខេបអំពីវគ្គបណ្តុះបណ្តាល..."
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
                        <FormLabel>ប្រភេទមុខវិជ្ជា</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINING_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>
                                {cat.name_km}
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
                        <FormLabel>ប្រភេទបណ្តុះបណ្តាល</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINING_TYPES.map((type) => (
                              <SelectItem key={type.code} value={type.code}>
                                {type.name_km}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="training_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>កម្រិតបណ្តុះបណ្តាល *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ជ្រើសរើសកម្រិត" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINING_LEVELS.map((level) => (
                              <SelectItem key={level.code} value={level.code}>
                                {level.name_km}
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
                    name="training_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ស្ថានភាព *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINING_STATUSES.map((status) => (
                              <SelectItem key={status.code} value={status.code}>
                                {status.name_km}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchTrainingLevel === 'CLUSTER' && (
                  <FormField
                    control={form.control}
                    name="cluster_schools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>សាលារៀនក្នុងកម្រង</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="បញ្ចូលឈ្មោះសាលារៀនដោយបំបែកដោយសញ្ញាក្បៀស"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">កាលវិភាគ</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="training_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>កាលបរិច្ឆេទចាប់ផ្តើម</FormLabel>
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
                                  <span>ជ្រើសរើសកាលបរិច្ឆេទ</span>
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
                        <FormLabel>កាលបរិច្ឆេទបញ្ចប់</FormLabel>
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
                                  <span>ជ្រើសរើសកាលបរិច្ឆេទ</span>
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
                <h3 className="text-sm font-medium text-foreground">ទីតាំង</h3>

                <FormField
                  control={form.control}
                  name="training_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ទីតាំង / ខេត្ត</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="ភ្នំពេញ, សៀមរាប..." className="pl-9" {...field} />
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
                      <FormLabel>ឈ្មោះទីកន្លែង</FormLabel>
                      <FormControl>
                        <Input placeholder="ឈ្មោះសាលារៀន ឬទីកន្លែង..." {...field} />
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
                      <FormLabel>ចំនួនអ្នកចូលរួមអតិបរមា</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={500} {...field} />
                      </FormControl>
                      <FormDescription>
                        ចំនួនអ្នកចូលរួមអតិបរមាដែលអនុញ្ញាត (១-៥០០)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* GPS Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">ការកំណត់ GPS និងវត្តមាន</h3>

                <FormField
                  control={form.control}
                  name="gps_validation_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">ការផ្ទៀងផ្ទាត់ GPS</FormLabel>
                        <FormDescription>
                          ទាមទារទីតាំង GPS នៅពេលកត់វត្តមាន
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
                        <FormLabel className="text-base">ការផ្ទៀងផ្ទាត់ Geofence</FormLabel>
                        <FormDescription>
                          អនុញ្ញាតឱ្យចូលក្នុងរង្វង់ទីកន្លែងតែប៉ុណ្ណោះ
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
                      កូអរដោនេ GPS សម្រាប់ទីតាំងទីកន្លែង
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="venue_latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>រយៈទទឹង (Latitude)</FormLabel>
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
                            <FormLabel>រយៈបណ្តោយ (Longitude)</FormLabel>
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
                            <FormLabel>រង្វង់ Geofence (ម៉ែត្រ)</FormLabel>
                            <FormControl>
                              <Input type="number" min={10} max={1000} {...field} />
                            </FormControl>
                            <FormDescription>
                              រង្វង់ដែលអនុញ្ញាតឱ្យចូលពីទីកន្លែង (១០-១០០០ម)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                បោះបង់
              </Button>
              <Button type="submit">ធ្វើបច្ចុប្បន្នភាព</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

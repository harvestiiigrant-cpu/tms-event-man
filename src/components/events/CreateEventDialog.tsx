import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { EVENT_TYPES, EVENT_FORMATS } from '@/types/event';
import type { Event, EventType, EventFormat, EventStatus } from '@/types/event';

interface CreateEventDialogProps {
  children?: React.ReactNode;
}

interface EventFormData {
  event_code: string;
  event_name: string;
  event_name_english: string;
  event_description: string;
  event_type: EventType;
  event_format: EventFormat;
  event_status: EventStatus;
  event_start_date: string;
  event_end_date: string;
  registration_deadline?: string;
  event_location?: string;
  event_venue?: string;
  province_name?: string;
  district_name?: string;
  virtual_platform?: string;
  virtual_meeting_url?: string;
  max_attendees: number;
  allow_public_registration: boolean;
  requires_approval: boolean;
  is_multi_track: boolean;
  gps_validation_required: boolean;
  geofence_validation_required: boolean;
  is_published: boolean;
}

export function CreateEventDialog({ children }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      event_status: 'DRAFT',
      event_format: 'IN_PERSON',
      max_attendees: 100,
      allow_public_registration: true,
      requires_approval: false,
      is_multi_track: false,
      gps_validation_required: false,
      geofence_validation_required: false,
      is_published: false,
    },
  });

  const eventFormat = watch('event_format');

  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => api.events.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានបង្កើតព្រឹត្តិការណ៍ដោយជោគជ័យ',
      });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការបង្កើតព្រឹត្តិការណ៍',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>បង្កើតព្រឹត្តិការណ៍ថ្មី</DialogTitle>
          <DialogDescription>
            បំពេញព័ត៌មានសម្រាប់បង្កើតព្រឹត្តិការណ៍ថ្មី
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">ព័ត៌មានមូលដ្ឋាន</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_code">លេខកូដ *</Label>
                <Input
                  id="event_code"
                  {...register('event_code', { required: 'លេខកូដត្រូវតែបំពេញ' })}
                  placeholder="EVT-2025-001"
                />
                {errors.event_code && (
                  <p className="text-sm text-destructive">{errors.event_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">ប្រភេទព្រឹត្តិការណ៍ *</Label>
                <Select onValueChange={(value) => setValue('event_type', value as EventType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name_km}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_name">ឈ្មោះ (ខ្មែរ) *</Label>
              <Input
                id="event_name"
                {...register('event_name', { required: 'ឈ្មោះត្រូវតែបំពេញ' })}
                placeholder="សន្និសីទបណ្តុះបណ្តាលគ្រូបង្រៀន"
              />
              {errors.event_name && (
                <p className="text-sm text-destructive">{errors.event_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_name_english">ឈ្មោះ (English)</Label>
              <Input
                id="event_name_english"
                {...register('event_name_english')}
                placeholder="Teacher Training Conference"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_description">ការពណ៌នា</Label>
              <Textarea
                id="event_description"
                {...register('event_description')}
                placeholder="ពណ៌នាអំពីព្រឹត្តិការណ៍..."
                rows={3}
              />
            </div>
          </div>

          {/* Date & Format */}
          <div className="space-y-4">
            <h3 className="font-semibold">កាលបរិច្ឆេទ និង ទម្រង់</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_format">ទម្រង់ព្រឹត្តិការណ៍ *</Label>
                <Select
                  defaultValue="IN_PERSON"
                  onValueChange={(value) => setValue('event_format', value as EventFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_FORMATS.map((format) => (
                      <SelectItem key={format.code} value={format.code}>
                        {format.name_km}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_status">ស្ថានភាព *</Label>
                <Select
                  defaultValue="DRAFT"
                  onValueChange={(value) => setValue('event_status', value as EventStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">ព្រាង</SelectItem>
                    <SelectItem value="UPCOMING">នឹងមកដល់</SelectItem>
                    <SelectItem value="ONGOING">កំពុងដំណើរការ</SelectItem>
                    <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_start_date">ថ្ងៃចាប់ផ្តើម *</Label>
                <Input
                  id="event_start_date"
                  type="date"
                  {...register('event_start_date', { required: 'ថ្ងៃចាប់ផ្តើមត្រូវតែបំពេញ' })}
                />
                {errors.event_start_date && (
                  <p className="text-sm text-destructive">{errors.event_start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_end_date">ថ្ងៃបញ្ចប់ *</Label>
                <Input
                  id="event_end_date"
                  type="date"
                  {...register('event_end_date', { required: 'ថ្ងៃបញ្ចប់ត្រូវតែបំពេញ' })}
                />
                {errors.event_end_date && (
                  <p className="text-sm text-destructive">{errors.event_end_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_deadline">ថ្ងៃផុតកំណត់ចុះឈ្មោះ</Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  {...register('registration_deadline')}
                />
              </div>
            </div>
          </div>

          {/* Location (for IN_PERSON and HYBRID) */}
          {(eventFormat === 'IN_PERSON' || eventFormat === 'HYBRID') && (
            <div className="space-y-4">
              <h3 className="font-semibold">ទីតាំង</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_location">ទីតាំង</Label>
                  <Input
                    id="event_location"
                    {...register('event_location')}
                    placeholder="រាជធានីភ្នំពេញ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_venue">កន្លែង</Label>
                  <Input
                    id="event_venue"
                    {...register('event_venue')}
                    placeholder="សណ្ឋាគារ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province_name">ខេត្ត/ក្រុង</Label>
                  <Input
                    id="province_name"
                    {...register('province_name')}
                    placeholder="រាជធានីភ្នំពេញ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district_name">ស្រុក/ខណ្ឌ</Label>
                  <Input
                    id="district_name"
                    {...register('district_name')}
                    placeholder="ខណ្ឌដូនពេញ"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Virtual (for VIRTUAL and HYBRID) */}
          {(eventFormat === 'VIRTUAL' || eventFormat === 'HYBRID') && (
            <div className="space-y-4">
              <h3 className="font-semibold">ព័ត៌មានអនឡាញ</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="virtual_platform">វេទិកា</Label>
                  <Select onValueChange={(value) => setValue('virtual_platform', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសវេទិកា" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Other">ផ្សេងៗ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="virtual_meeting_url">តំណភ្ជាប់ការប្រជុំ</Label>
                  <Input
                    id="virtual_meeting_url"
                    {...register('virtual_meeting_url')}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Capacity & Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">ចំណុះ និង ការកំណត់</h3>

            <div className="space-y-2">
              <Label htmlFor="max_attendees">ចំនួនអ្នកចូលរួមអតិបរមា *</Label>
              <Input
                id="max_attendees"
                type="number"
                {...register('max_attendees', {
                  required: 'ចំនួនអ្នកចូលរួមត្រូវតែបំពេញ',
                  min: { value: 1, message: 'ត្រូវតែមានយ៉ាងតិច 1' }
                })}
                placeholder="100"
              />
              {errors.max_attendees && (
                <p className="text-sm text-destructive">{errors.max_attendees.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>អនុញ្ញាតឱ្យចុះឈ្មោះជាសាធារណៈ</Label>
                  <p className="text-sm text-muted-foreground">អ្នកណាក៏អាចចុះឈ្មោះបាន</p>
                </div>
                <Switch
                  defaultChecked
                  onCheckedChange={(checked) => setValue('allow_public_registration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ទាមទារការអនុម័ត</Label>
                  <p className="text-sm text-muted-foreground">ត្រូវការអនុម័តមុននឹងចូលរួម</p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue('requires_approval', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ព្រឹត្តិការណ៍ពហុផ្លូវ</Label>
                  <p className="text-sm text-muted-foreground">មានវគ្គផ្សេងៗក្នុងពេលដំណាលគ្នា</p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue('is_multi_track', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>បោះពុម្ពផ្សាយ</Label>
                  <p className="text-sm text-muted-foreground">អាចមើលឃើញជាសាធារណៈ</p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue('is_published', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              បោះបង់
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'កំពុងបង្កើត...' : 'បង្កើតព្រឹត្តិការណ៍'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { SESSION_TYPES } from '@/types/event';
import type { Event, EventSession, SessionType } from '@/types/event';
import { Plus, Trash2, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ManageSessionsDialogProps {
  event: Event;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

interface SessionFormData {
  session_code: string;
  session_name: string;
  session_name_english: string;
  session_description: string;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
  session_location?: string;
  session_room?: string;
  track_name?: string;
  track_color?: string;
  max_attendees: number;
  session_type: SessionType;
}

export function ManageSessionsDialog({ event, children, trigger }: ManageSessionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SessionFormData>({
    defaultValues: {
      session_type: 'PRESENTATION',
      max_attendees: 50,
    },
  });

  // Fetch sessions for this event
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['event-sessions', event.id],
    queryFn: () => api.eventSessions.getByEvent(event.id),
    enabled: open,
  });

  // Create session mutation
  const createMutation = useMutation({
    mutationFn: (data: SessionFormData) => api.eventSessions.create({
      ...data,
      event_id: event.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-sessions', event.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានបង្កើតវគ្គសិក្សាដោយជោគជ័យ',
      });
      setShowAddForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការបង្កើតវគ្គសិក្សា',
        variant: 'destructive',
      });
    },
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => api.eventSessions.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-sessions', event.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានលុបវគ្គសិក្សាដោយជោគជ័យ',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការលុប',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SessionFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបវគ្គសិក្សានេះទេ?')) {
      deleteMutation.mutate(sessionId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>គ្រប់គ្រងវគ្គសិក្សា</DialogTitle>
          <DialogDescription>
            គ្រប់គ្រងវគ្គសិក្សាសម្រាប់ {event.event_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Sessions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">វគ្គសិក្សាទាំងអស់ ({sessions.length})</h3>
              <Button
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                variant={showAddForm ? 'outline' : 'default'}
              >
                {showAddForm ? 'បិទ' : <><Plus className="mr-1 h-4 w-4" />បន្ថែមវគ្គសិក្សា</>}
              </Button>
            </div>

            {/* Add Session Form */}
            {showAddForm && (
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_code">លេខកូដវគ្គសិក្សា *</Label>
                        <Input
                          id="session_code"
                          {...register('session_code', { required: 'លេខកូដត្រូវតែបំពេញ' })}
                          placeholder="SES-001"
                        />
                        {errors.session_code && (
                          <p className="text-sm text-destructive">{errors.session_code.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session_type">ប្រភេទវគ្គសិក្សា *</Label>
                        <Select
                          onValueChange={(value) => setValue('session_type', value as SessionType)}
                          defaultValue="PRESENTATION"
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SESSION_TYPES.map((type) => (
                              <SelectItem key={type.code} value={type.code}>
                                {type.name_km}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session_name">ចំណងជើង (ខ្មែរ) *</Label>
                      <Input
                        id="session_name"
                        {...register('session_name', { required: 'ចំណងជើងត្រូវតែបំពេញ' })}
                        placeholder="វគ្គសិក្សាអំពី..."
                      />
                      {errors.session_name && (
                        <p className="text-sm text-destructive">{errors.session_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session_name_english">ចំណងជើង (English)</Label>
                      <Input
                        id="session_name_english"
                        {...register('session_name_english')}
                        placeholder="Session about..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session_description">ការពណ៌នា</Label>
                      <Textarea
                        id="session_description"
                        {...register('session_description')}
                        placeholder="ពណ៌នាអំពីវគ្គសិក្សា..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_date">កាលបរិច្ឆេទ *</Label>
                        <Input
                          id="session_date"
                          type="date"
                          {...register('session_date', { required: 'កាលបរិច្ឆេទត្រូវតែបំពេញ' })}
                        />
                        {errors.session_date && (
                          <p className="text-sm text-destructive">{errors.session_date.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session_start_time">ពេលចាប់ផ្តើម *</Label>
                        <Input
                          id="session_start_time"
                          type="time"
                          {...register('session_start_time', { required: 'ពេលចាប់ផ្តើមត្រូវតែបំពេញ' })}
                        />
                        {errors.session_start_time && (
                          <p className="text-sm text-destructive">{errors.session_start_time.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session_end_time">ពេលបញ្ចប់ *</Label>
                        <Input
                          id="session_end_time"
                          type="time"
                          {...register('session_end_time', { required: 'ពេលបញ្ចប់ត្រូវតែបំពេញ' })}
                        />
                        {errors.session_end_time && (
                          <p className="text-sm text-destructive">{errors.session_end_time.message}</p>
                        )}
                      </div>
                    </div>

                    {event.is_multi_track && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="track_name">ឈ្មោះផ្លូវ (Track)</Label>
                          <Input
                            id="track_name"
                            {...register('track_name')}
                            placeholder="Technical Track"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="track_color">ពណ៌ផ្លូវ</Label>
                          <Input
                            id="track_color"
                            type="color"
                            {...register('track_color')}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_location">ទីតាំង</Label>
                        <Input
                          id="session_location"
                          {...register('session_location')}
                          placeholder="សាលប្រជុំ A"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session_room">បន្ទប់</Label>
                        <Input
                          id="session_room"
                          {...register('session_room')}
                          placeholder="Room 101"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_attendees">ចំនួនអ្នកចូលរួមអតិបរមា *</Label>
                        <Input
                          id="max_attendees"
                          type="number"
                          {...register('max_attendees', {
                            required: 'ចំនួនអ្នកចូលរួមត្រូវតែបំពេញ',
                            min: { value: 1, message: 'ត្រូវតែមានយ៉ាងតិច 1' }
                          })}
                        />
                        {errors.max_attendees && (
                          <p className="text-sm text-destructive">{errors.max_attendees.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        disabled={createMutation.isPending}
                      >
                        បោះបង់
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'កំពុងបន្ថែម...' : 'បន្ថែមវគ្គសិក្សា'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Sessions List */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">កំពុងផ្ទុក...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                មិនទាន់មានវគ្គសិក្សា។ សូមបន្ថែមវគ្គសិក្សាថ្មី។
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: EventSession) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{session.session_name}</h4>
                            {session.session_name_english && (
                              <span className="text-sm text-muted-foreground">
                                ({session.session_name_english})
                              </span>
                            )}
                            <Badge variant="outline">{session.session_code}</Badge>
                            {session.track_name && (
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: session.track_color || undefined }}
                              >
                                {session.track_name}
                              </Badge>
                            )}
                          </div>

                          {session.session_description && (
                            <p className="text-sm text-muted-foreground">
                              {session.session_description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(session.session_date), 'dd MMM yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {format(new Date(session.session_start_time), 'HH:mm')} -{' '}
                              {format(new Date(session.session_end_time), 'HH:mm')}
                            </div>
                            {session.session_location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {session.session_location}
                                {session.session_room && ` - ${session.session_room}`}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {session.current_attendees}/{session.max_attendees}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(session.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            បិទ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

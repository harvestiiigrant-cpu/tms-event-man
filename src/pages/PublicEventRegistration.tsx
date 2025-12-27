import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { EventTypeBadge } from '@/components/events/EventTypeBadge';
import { EventFormatBadge } from '@/components/events/EventFormatBadge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

interface RegistrationFormData {
  attendee_name: string;
  attendee_name_english: string;
  attendee_email: string;
  attendee_phone: string;
  attendee_organization?: string;
  attendee_position?: string;
  attendee_province?: string;
  attendee_district?: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  special_requests?: string;
  selected_sessions?: string[];
}

export default function PublicEventRegistration() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event-public', eventId],
    queryFn: () => api.events.getByIdPublic(eventId!),
    enabled: !!eventId,
  });

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['event-sessions-public', eventId],
    queryFn: () => api.eventSessions.getByEvent(eventId!),
    enabled: !!eventId && event?.is_multi_track,
  });

  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegistrationFormData) =>
      api.eventRegistrations.registerPublic({
        event_id: eventId,
        ...data,
        selected_sessions: selectedSessions,
      }),
    onSuccess: (data) => {
      setRegistrationCode(data.registration_code);
      setRegistrationSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      alert(error.message || 'មានបញ្ហាក្នុងការចុះឈ្មោះ។ សូមព្យាយាមម្តងទៀត។');
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">កំពុងផ្ទុក...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">រកមិនឃើញព្រឹត្តិការណ៍</p>
          <Button onClick={() => navigate('/events/browse')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ក្រោយ
          </Button>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">ចុះឈ្មោះជោគជ័យ!</h2>
            <p className="text-muted-foreground">
              អរគុណសម្រាប់ការចុះឈ្មោះរបស់អ្នក។ យើងបានទទួលព័ត៌មានរបស់អ្នកហើយ។
            </p>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">លេខកូដចុះឈ្មោះរបស់អ្នក:</p>
              <p className="text-xl font-mono font-bold text-primary">{registrationCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                សូមរក្សាលេខកូដនេះសម្រាប់ការយោងនាពេលអនាគត
              </p>
            </div>

            {event.requires_approval && (
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-sm">
                <p className="text-orange-800 dark:text-orange-200">
                  ការចុះឈ្មោះរបស់អ្នកកំពុងរង់ចាំការអនុម័ត។ យើងនឹងជូនដំណឹងដល់អ្នកនៅពេលត្រូវបានអនុម័ត។
                </p>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                onClick={() => navigate('/events/browse')}
              >
                មើលព្រឹត្តិការណ៍ផ្សេងទៀត
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/events/${event.id}/details`)}
              >
                ត្រឡប់ទៅព្រឹត្តិការណ៍
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFullyBooked = event.current_attendees >= event.max_attendees;

  if (isFullyBooked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold mb-2">ព្រឹត្តិការណ៍ពេញហើយ</p>
            <p className="text-muted-foreground mb-4">
              សូមអភ័យទោស ព្រឹត្តិការណ៍នេះបានពេញហើយ។
            </p>
            <Button onClick={() => navigate('/events/browse')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              មើលព្រឹត្តិការណ៍ផ្សេងទៀត
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(`/events/${event.id}/details`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ក្រោយ
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Event Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              <EventStatusBadge status={event.event_status} />
              <EventTypeBadge type={event.event_type} />
              <EventFormatBadge format={event.event_format} />
            </div>
            <CardTitle className="text-2xl">{event.event_name}</CardTitle>
            {event.event_name_english && (
              <CardDescription>{event.event_name_english}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.event_start_date), 'dd MMM')} -{' '}
              {format(new Date(event.event_end_date), 'dd MMM yyyy')}
            </div>
            {event.event_location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.event_location}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              {event.current_attendees}/{event.max_attendees} នាក់បានចុះឈ្មោះ
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>ទម្រង់ចុះឈ្មោះ</CardTitle>
            <CardDescription>
              សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចុះឈ្មោះ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">ព័ត៌មានផ្ទាល់ខ្លួន</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_name">ឈ្មោះពេញ (ខ្មែរ) *</Label>
                    <Input
                      id="attendee_name"
                      {...register('attendee_name', { required: 'ឈ្មោះត្រូវតែបំពេញ' })}
                      placeholder="ឈ្មោះរបស់អ្នក"
                    />
                    {errors.attendee_name && (
                      <p className="text-sm text-destructive">{errors.attendee_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendee_name_english">ឈ្មោះពេញ (English)</Label>
                    <Input
                      id="attendee_name_english"
                      {...register('attendee_name_english')}
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_email">អ៊ីម៉ែល *</Label>
                    <Input
                      id="attendee_email"
                      type="email"
                      {...register('attendee_email', {
                        required: 'អ៊ីម៉ែលត្រូវតែបំពេញ',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'អ៊ីម៉ែលមិនត្រឹមត្រូវ'
                        }
                      })}
                      placeholder="your.email@example.com"
                    />
                    {errors.attendee_email && (
                      <p className="text-sm text-destructive">{errors.attendee_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendee_phone">លេខទូរស័ព្ទ *</Label>
                    <Input
                      id="attendee_phone"
                      {...register('attendee_phone', { required: 'លេខទូរស័ព្ទត្រូវតែបំពេញ' })}
                      placeholder="012 345 678"
                    />
                    {errors.attendee_phone && (
                      <p className="text-sm text-destructive">{errors.attendee_phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_organization">អង្គភាព/ស្ថាប័ន</Label>
                    <Input
                      id="attendee_organization"
                      {...register('attendee_organization')}
                      placeholder="ស្ថាប័នរបស់អ្នក"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendee_position">មុខតំណែង</Label>
                    <Input
                      id="attendee_position"
                      {...register('attendee_position')}
                      placeholder="មុខតំណែងរបស់អ្នក"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_province">ខេត្ត/ក្រុង</Label>
                    <Input
                      id="attendee_province"
                      {...register('attendee_province')}
                      placeholder="ខេត្តរបស់អ្នក"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendee_district">ស្រុក/ខណ្ឌ</Label>
                    <Input
                      id="attendee_district"
                      {...register('attendee_district')}
                      placeholder="ស្រុករបស់អ្នក"
                    />
                  </div>
                </div>
              </div>

              {/* Session Selection (if multi-track) */}
              {event.is_multi_track && sessions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">ជ្រើសរើសវគ្គសិក្សា</h3>
                  <p className="text-sm text-muted-foreground">
                    សូមជ្រើសរើសវគ្គសិក្សាដែលអ្នកចង់ចូលរួម (អាចជ្រើសរើសច្រើន)
                  </p>
                  <div className="space-y-2">
                    {sessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={session.id}
                          checked={selectedSessions.includes(session.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSessions([...selectedSessions, session.id]);
                            } else {
                              setSelectedSessions(selectedSessions.filter(id => id !== session.id));
                            }
                          }}
                        />
                        <label htmlFor={session.id} className="flex-1 cursor-pointer">
                          <p className="font-medium">{session.session_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.session_date), 'dd MMM yyyy')} •{' '}
                            {format(new Date(session.session_start_time), 'HH:mm')} -{' '}
                            {format(new Date(session.session_end_time), 'HH:mm')}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              <div className="space-y-4">
                <h3 className="font-semibold">តម្រូវការពិសេស (ស្រេចចិត្ត)</h3>

                <div className="space-y-2">
                  <Label htmlFor="dietary_requirements">តម្រូវការអាហារពិសេស</Label>
                  <Input
                    id="dietary_requirements"
                    {...register('dietary_requirements')}
                    placeholder="ឧ. អាហារបន្លែ, មិនមានជាតិស្ករ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibility_needs">តម្រូវការភាពងាយស្រួល</Label>
                  <Input
                    id="accessibility_needs"
                    {...register('accessibility_needs')}
                    placeholder="ឧ. រទេះរុញ, ការបកប្រែ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special_requests">សំណើពិសេសផ្សេងទៀត</Label>
                  <Textarea
                    id="special_requests"
                    {...register('special_requests')}
                    placeholder="សំណើផ្សេងទៀត..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${event.id}/details`)}
                  disabled={registerMutation.isPending}
                  className="flex-1"
                >
                  បោះបង់
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex-1"
                >
                  {registerMutation.isPending ? 'កំពុងដំណើរការ...' : 'បញ្ជូនការចុះឈ្មោះ'}
                </Button>
              </div>

              {event.requires_approval && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  ការចុះឈ្មោះរបស់អ្នកនឹងត្រូវត្រួតពិនិត្យមុននឹងត្រូវបានអនុម័ត
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

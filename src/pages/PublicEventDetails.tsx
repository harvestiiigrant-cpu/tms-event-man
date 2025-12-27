import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { EventTypeBadge } from '@/components/events/EventTypeBadge';
import { EventFormatBadge } from '@/components/events/EventFormatBadge';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  ArrowLeft,
  ArrowRight,
  User,
  MessageSquare,
  Link2,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PublicEventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event-public', eventId],
    queryFn: () => api.events.getByIdPublic(eventId!),
    enabled: !!eventId,
  });

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

  const isFullyBooked = event.current_attendees >= event.max_attendees;
  const canRegister = event.allow_public_registration && !isFullyBooked;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/events/browse')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              ត្រឡប់ក្រោយ
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              <GraduationCap className="mr-2 h-4 w-4" />
              ចូលប្រព័ន្ធ
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Event Header */}
        <div className="mb-8">
          {event.banner_image_url && (
            <div className="h-64 md:h-96 rounded-xl overflow-hidden mb-6 shadow-lg">
              <img
                src={event.banner_image_url}
                alt={event.event_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <EventStatusBadge status={event.event_status} />
            <EventTypeBadge type={event.event_type} />
            <EventFormatBadge format={event.event_format} />
            {isFullyBooked && (
              <Badge variant="destructive">ពេញហើយ</Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.event_name}</h1>
          {event.event_name_english && (
            <p className="text-xl text-muted-foreground mb-4">{event.event_name_english}</p>
          )}

          {canRegister && (
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate(`/events/${event.id}/register`)}
            >
              ចុះឈ្មោះឥឡូវនេះ
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.event_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    អំពីព្រឹត្តិការណ៍
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.event_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sessions */}
            {event.sessions && event.sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    កម្មវិធី
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.sessions.map((session: any) => (
                    <div key={session.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{session.session_name}</h4>
                          {session.track_name && (
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: session.track_color || undefined }}
                            >
                              {session.track_name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(session.session_date), 'dd MMM yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(session.session_start_time), 'HH:mm')} -{' '}
                            {format(new Date(session.session_end_time), 'HH:mm')}
                          </span>
                          {session.session_room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {session.session_room}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    វាគ្មិន
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.speakers.map((speaker: any) => (
                    <div key={speaker.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                      {speaker.speaker_photo_url && (
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0">
                          <img
                            src={speaker.speaker_photo_url}
                            alt={speaker.speaker_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {speaker.speaker_title && `${speaker.speaker_title} `}
                          {speaker.speaker_name}
                        </p>
                        {speaker.speaker_position && (
                          <p className="text-sm text-muted-foreground truncate">
                            {speaker.speaker_position}
                          </p>
                        )}
                        {speaker.speaker_organization && (
                          <p className="text-xs text-muted-foreground truncate">
                            {speaker.speaker_organization}
                          </p>
                        )}
                        {speaker.is_keynote_speaker && (
                          <Badge variant="default" className="mt-1">Keynote</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ព័ត៌មានរហ័ស</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">កាលបរិច្ឆេទ</p>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(event.event_start_date), 'dd MMMM yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ដល់ {format(new Date(event.event_end_date), 'dd MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                {(event.event_format === 'IN_PERSON' || event.event_format === 'HYBRID') && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ទីតាំង</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{event.event_location}</p>
                          {event.event_venue && (
                            <p className="text-sm text-muted-foreground">{event.event_venue}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Virtual */}
                {(event.event_format === 'VIRTUAL' || event.event_format === 'HYBRID') && event.virtual_meeting_url && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ចូលរួមអនឡាញ</p>
                      <div className="flex items-start gap-2">
                        <Video className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{event.virtual_platform}</p>
                          <a
                            href={event.virtual_meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Link2 className="h-3 w-3" />
                            តំណភ្ជាប់ការប្រជុំ
                          </a>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Capacity */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">អ្នកចូលរួម</p>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {event.current_attendees} / {event.max_attendees} នាក់
                      </p>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{
                            width: `${Math.min((event.current_attendees / event.max_attendees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {event.registration_deadline && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ថ្ងៃផុតកំណត់ចុះឈ្មោះ</p>
                      <p className="font-medium text-orange-600">
                        {format(new Date(event.registration_deadline), 'dd MMMM yyyy')}
                      </p>
                    </div>
                  </>
                )}

                {event.requires_approval && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5" />
                      <p className="text-muted-foreground">
                        ការចុះឈ្មោះត្រូវការអនុម័តពីអ្នករៀបចំ
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Registration CTA */}
            {canRegister && (
              <Card className="border-primary shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <h3 className="font-semibold text-lg">ចង់ចូលរួមទេ?</h3>
                  <p className="text-sm text-muted-foreground">
                    ចុះឈ្មោះឥឡូវនេះដើម្បីធានាកន្លែងរបស់អ្នក
                  </p>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/events/${event.id}/register`)}
                  >
                    ចុះឈ្មោះឥឡូវនេះ
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {isFullyBooked && (
              <Card className="border-destructive">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold text-destructive mb-2">ព្រឹត្តិការណ៍ពេញហើយ</p>
                  <p className="text-sm text-muted-foreground">
                    សូមអភ័យទោស ព្រឹត្តិការណ៍នេះបានពេញហើយ
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

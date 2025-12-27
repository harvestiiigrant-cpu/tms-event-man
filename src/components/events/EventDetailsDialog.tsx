import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EventStatusBadge } from './EventStatusBadge';
import { EventTypeBadge } from './EventTypeBadge';
import { EventFormatBadge } from './EventFormatBadge';
import type { Event } from '@/types/event';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Video,
  CheckCircle2,
  XCircle,
  User,
  MessageSquare,
  Link2,
} from 'lucide-react';
import { format } from 'date-fns';

interface EventDetailsDialogProps {
  event: Event;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export function EventDetailsDialog({ event, children, trigger }: EventDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  // Fetch full event details with relations when dialog opens
  const { data: eventDetails } = useQuery({
    queryKey: ['event', event.id],
    queryFn: () => api.events.getById(event.id),
    enabled: open,
  });

  const displayEvent = eventDetails || event;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{displayEvent.event_name}</DialogTitle>
              {displayEvent.event_name_english && (
                <DialogDescription className="text-base">
                  {displayEvent.event_name_english}
                </DialogDescription>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <EventStatusBadge status={displayEvent.event_status} />
              <EventTypeBadge type={displayEvent.event_type} />
              <EventFormatBadge format={displayEvent.event_format} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Code and Basic Info */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {displayEvent.event_code}
            </Badge>
            {displayEvent.is_published && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                បានបោះពុម្ពផ្សាយ
              </Badge>
            )}
            {displayEvent.is_multi_track && (
              <Badge variant="secondary">ព្រឹត្តិការណ៍ពហុផ្លូវ</Badge>
            )}
          </div>

          {/* Description */}
          {displayEvent.event_description && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                ការពណ៌នា
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayEvent.event_description}
              </p>
            </div>
          )}

          <Separator />

          {/* Date & Time Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              កាលបរិច្ឆេទ និង ពេលវេលា
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ថ្ងៃចាប់ផ្តើម</p>
                <p className="font-medium">
                  {format(new Date(displayEvent.event_start_date), 'dd MMM yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ថ្ងៃបញ្ចប់</p>
                <p className="font-medium">
                  {format(new Date(displayEvent.event_end_date), 'dd MMM yyyy')}
                </p>
              </div>
              {displayEvent.registration_deadline && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ថ្ងៃផុតកំណត់ចុះឈ្មោះ</p>
                  <p className="font-medium">
                    {format(new Date(displayEvent.registration_deadline), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          {(displayEvent.event_format === 'IN_PERSON' || displayEvent.event_format === 'HYBRID') && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  ទីតាំង
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayEvent.event_location && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ទីតាំង</p>
                      <p className="font-medium">{displayEvent.event_location}</p>
                    </div>
                  )}
                  {displayEvent.event_venue && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">កន្លែង</p>
                      <p className="font-medium">{displayEvent.event_venue}</p>
                    </div>
                  )}
                  {displayEvent.province_name && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ខេត្ត/ក្រុង</p>
                      <p className="font-medium">{displayEvent.province_name}</p>
                    </div>
                  )}
                  {displayEvent.district_name && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ស្រុក/ខណ្ឌ</p>
                      <p className="font-medium">{displayEvent.district_name}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Virtual Information */}
          {(displayEvent.event_format === 'VIRTUAL' || displayEvent.event_format === 'HYBRID') && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  ព័ត៌មានអនឡាញ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayEvent.virtual_platform && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">វេទិកា</p>
                      <p className="font-medium">{displayEvent.virtual_platform}</p>
                    </div>
                  )}
                  {displayEvent.virtual_meeting_url && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">តំណភ្ជាប់ការប្រជុំ</p>
                      <a
                        href={displayEvent.virtual_meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Link2 className="h-3 w-3" />
                        ចុចទីនេះដើម្បីចូលរួម
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Capacity & Registration */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              ចំណុះ និង ការចុះឈ្មោះ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">អ្នកចូលរួម</p>
                <p className="font-medium text-lg">
                  {displayEvent.current_attendees} / {displayEvent.max_attendees} នាក់
                </p>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${Math.min((displayEvent.current_attendees / displayEvent.max_attendees) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {displayEvent.allow_public_registration ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">អនុញ្ញាតឱ្យចុះឈ្មោះជាសាធារណៈ</span>
                </div>
                <div className="flex items-center gap-2">
                  {displayEvent.requires_approval ? (
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">ទាមទារការអនុម័ត</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Count (if multi-track) */}
          {eventDetails && eventDetails.sessions && eventDetails.sessions.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  វគ្គសិក្សា
                </h3>
                <p className="text-sm text-muted-foreground">
                  ព្រឹត្តិការណ៍នេះមាន {eventDetails.sessions.length} វគ្គសិក្សា
                </p>
              </div>
            </>
          )}

          {/* Speakers Count */}
          {eventDetails && eventDetails.speakers && eventDetails.speakers.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  វាគ្មិន
                </h3>
                <p className="text-sm text-muted-foreground">
                  មានវាគ្មិន {eventDetails.speakers.length} នាក់
                </p>
              </div>
            </>
          )}

          {/* Tags */}
          {displayEvent.tags && displayEvent.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">ស្លាក</h3>
                <div className="flex flex-wrap gap-2">
                  {displayEvent.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>បានបង្កើតនៅ: {format(new Date(displayEvent.created_at), 'dd MMM yyyy, HH:mm')}</p>
            <p>ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {format(new Date(displayEvent.updated_at), 'dd MMM yyyy, HH:mm')}</p>
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

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { EventTypeBadge } from '@/components/events/EventTypeBadge';
import { EventFormatBadge } from '@/components/events/EventFormatBadge';
import { EVENT_TYPES } from '@/types/event';
import type { Event } from '@/types/event';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';
import { format } from 'date-fns';

export default function EventsBrowser() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // Fetch public events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-public'],
    queryFn: api.events.getPublic,
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesSearch =
        event.event_name_english
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        event.event_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all' || event.event_type === typeFilter;

      const matchesFormat =
        formatFilter === 'all' || event.event_format === formatFilter;

      return matchesSearch && matchesType && matchesFormat;
    });
  }, [events, searchQuery, typeFilter, formatFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                <CalendarDays className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ព្រឹត្តិការណ៍</h1>
                <p className="text-sm text-muted-foreground">Events & Conferences</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')}>
              <GraduationCap className="mr-2 h-4 w-4" />
              ចូលប្រព័ន្ធ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            រកឃើញព្រឹត្តិការណ៍ និង សន្និសីទ
          </h2>
          <p className="text-lg text-muted-foreground">
            ចុះឈ្មោះចូលរួមព្រឹត្តិការណ៍ជាមួយពួកយើង
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ស្វែងរកព្រឹត្តិការណ៍..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="ប្រភេទ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name_km}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="ទម្រង់" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទម្រង់ទាំងអស់</SelectItem>
                  <SelectItem value="IN_PERSON">ចូលរួមផ្ទាល់</SelectItem>
                  <SelectItem value="VIRTUAL">តាមអនឡាញ</SelectItem>
                  <SelectItem value="HYBRID">ចូលរួមផ្សំ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">កំពុងផ្ទុក...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground">រកមិនឃើញព្រឹត្តិការណ៍</p>
              <p className="text-sm text-muted-foreground text-center">
                សាកល្បងកែសម្រួលការស្វែងរក ឬលក្ខខណ្ឌត្រង
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/events/${event.id}/details`)}
              >
                {event.banner_image_url && (
                  <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden">
                    <img
                      src={event.banner_image_url}
                      alt={event.event_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <EventStatusBadge status={event.event_status} />
                    <EventTypeBadge type={event.event_type} />
                    <EventFormatBadge format={event.event_format} />
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {event.event_name}
                  </CardTitle>
                  {event.event_name_english && (
                    <CardDescription className="line-clamp-1">
                      {event.event_name_english}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {event.event_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.event_description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(event.event_start_date), 'dd MMM')} -{' '}
                        {format(new Date(event.event_end_date), 'dd MMM yyyy')}
                      </span>
                    </div>

                    {event.event_location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.event_location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {event.current_attendees}/{event.max_attendees} នាក់
                      </span>
                      {event.current_attendees >= event.max_attendees && (
                        <span className="text-xs text-destructive font-medium">ពេញហើយ</span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 group-hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.id}/register`);
                    }}
                    disabled={event.current_attendees >= event.max_attendees}
                  >
                    {event.current_attendees >= event.max_attendees ? 'ពេញហើយ' : 'ចុះឈ្មោះឥឡូវនេះ'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>មានសំណួរ? ទាក់ទងមកយើងខ្ញុំ ឬ <Button variant="link" className="h-auto p-0" onClick={() => navigate('/login')}>ចូលប្រព័ន្ធ</Button></p>
        </div>
      </main>
    </div>
  );
}

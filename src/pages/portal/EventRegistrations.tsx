import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { EventTypeBadge } from '@/components/events/EventTypeBadge';
import { EventFormatBadge } from '@/components/events/EventFormatBadge';

export default function EventRegistrations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'history'>('events');

  // Fetch user's event registrations by their email
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['event-registrations', user?.email],
    queryFn: () => api.eventRegistrations.getByEmail(user?.email!),
    enabled: !!user?.email,
  });

  // Filter registrations based on active tab
  const currentRegistrations = registrations.filter(reg => {
    const eventDate = new Date(reg.event.event_start_date);
    const now = new Date();
    return eventDate >= now && reg.registration_status !== 'CANCELLED';
  });

  const pastRegistrations = registrations.filter(reg => {
    const eventDate = new Date(reg.event.event_start_date);
    const now = new Date();
    return eventDate < now || reg.registration_status === 'CANCELLED';
  });

  if (isLoading) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  return (
    <BeneficiaryPortalLayout title="ការចុះឈ្មោះព្រឹត្តិការណ៍" subtitle="ការចុះឈ្មោះរបស់អ្នកសម្រាប់ព្រឹត្តិការណ៍">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('events')}
          >
            ព្រឹត្តិការណ៍បច្ចុប្បន្ន
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('history')}
          >
            ប្រវត្តិ
          </button>
        </div>

        {/* Current Events */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {currentRegistrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">គ្មានព្រឹត្តិការណ៍បច្ចុប្បន្ន</h3>
                  <p className="text-muted-foreground">
                    អ្នកមិនមានការចុះឈ្មោះសម្រាប់ព្រឹត្តិការណ៍បច្ចុប្បន្នទេ
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <EventStatusBadge status={registration.event.event_status} />
                      <EventTypeBadge type={registration.event.event_type} />
                      <EventFormatBadge format={registration.event.event_format} />
                      {registration.approval_status === 'PENDING' && (
                        <Badge variant="secondary">កំពុងរង់ចាំការអនុម័ត</Badge>
                      )}
                      {registration.approval_status === 'APPROVED' && (
                        <Badge variant="default">បានអនុម័ត</Badge>
                      )}
                      {registration.approval_status === 'REJECTED' && (
                        <Badge variant="destructive">បានច្រានចោល</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{registration.event.event_name}</CardTitle>
                    {registration.event.event_name_english && (
                      <p className="text-muted-foreground">{registration.event.event_name_english}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(registration.event.event_start_date), 'dd MMM yyyy')} -{' '}
                          {format(new Date(registration.event.event_end_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      
                      {registration.event.event_location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{registration.event.event_location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(registration.event.event_start_date), 'HH:mm')} -{' '}
                          {format(new Date(registration.event.event_end_date), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {registration.event.current_attendees}/{registration.event.max_attendees} នាក់បានចុះឈ្មោះ
                        </span>
                      </div>
                      
                      <div className="pt-3">
                        <h4 className="font-medium mb-2">ព័ត៌មានការចុះឈ្មោះរបស់អ្នក:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">ឈ្មោះ:</span> {registration.attendee_name}</div>
                          <div><span className="text-muted-foreground">អ៊ីម៉ែល:</span> {registration.attendee_email}</div>
                          <div><span className="text-muted-foreground">លេខទូរ:</span> {registration.attendee_phone}</div>
                          <div><span className="text-muted-foreground">លេខកូដចុះឈ្មោះ:</span> {registration.registration_code}</div>
                          {registration.attendee_organization && (
                            <div><span className="text-muted-foreground">អង្គភាព:</span> {registration.attendee_organization}</div>
                          )}
                          {registration.attendee_position && (
                            <div><span className="text-muted-foreground">មុខតំណែង:</span> {registration.attendee_position}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-3">
                        <h4 className="font-medium mb-2">សម្គាល់:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          {registration.dietary_requirements && (
                            <div><span className="text-muted-foreground">តម្រូវការអាហារ:</span> {registration.dietary_requirements}</div>
                          )}
                          {registration.accessibility_needs && (
                            <div><span className="text-muted-foreground">ភាពងាយស្រួល:</span> {registration.accessibility_needs}</div>
                          )}
                          {registration.special_requests && (
                            <div><span className="text-muted-foreground">សំណើពិសេស:</span> {registration.special_requests}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {pastRegistrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">គ្មានប្រវត្តិ</h3>
                  <p className="text-muted-foreground">
                    អ្នកមិនមានប្រវត្តិការចុះឈ្មោះព្រឹត្តិការណ៍ទេ
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <EventStatusBadge status={registration.event.event_status} />
                      <EventTypeBadge type={registration.event.event_type} />
                      <EventFormatBadge format={registration.event.event_format} />
                      {registration.registration_status === 'CANCELLED' ? (
                        <Badge variant="destructive">បានលុបចោល</Badge>
                      ) : (
                        <Badge variant="secondary">បានបញ្ចប់</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{registration.event.event_name}</CardTitle>
                    {registration.event.event_name_english && (
                      <p className="text-muted-foreground">{registration.event.event_name_english}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(registration.event.event_start_date), 'dd MMM yyyy')} -{' '}
                          {format(new Date(registration.event.event_end_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      
                      {registration.event.event_location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{registration.event.event_location}</span>
                        </div>
                      )}
                      
                      <div className="pt-3">
                        <h4 className="font-medium mb-2">ព័ត៌មានការចុះឈ្មោះរបស់អ្នក:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">ឈ្មោះ:</span> {registration.attendee_name}</div>
                          <div><span className="text-muted-foreground">អ៊ីម៉ែល:</span> {registration.attendee_email}</div>
                          <div><span className="text-muted-foreground">លេខទូរ:</span> {registration.attendee_phone}</div>
                          <div><span className="text-muted-foreground">លេខកូដចុះឈ្មោះ:</span> {registration.registration_code}</div>
                          {registration.attendee_organization && (
                            <div><span className="text-muted-foreground">អង្គភាព:</span> {registration.attendee_organization}</div>
                          )}
                          {registration.attendee_position && (
                            <div><span className="text-muted-foreground">មុខតំណែង:</span> {registration.attendee_position}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </BeneficiaryPortalLayout>
  );
}
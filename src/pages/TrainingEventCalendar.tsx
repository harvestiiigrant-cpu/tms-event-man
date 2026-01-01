import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { khmerLocale } from '@/lib/date-locale';
import type { Training } from '@/types/training';
import type { Event } from '@/types/event';

const WEEKDAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];

export default function TrainingEventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch trainings and events
  const { data: trainings = [], isLoading: trainingLoading } = useQuery<Training[]>({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
  });

  const { data: events = [], isLoading: eventLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: api.events.getAll,
  });

  const isLoading = trainingLoading || eventLoading;

  // Filter combined items
  const filteredItems = useMemo(() => {
    const combinedItems = [
      ...trainings.map(training => ({
        id: training.id,
        title: training.training_name,
        title_en: training.training_name_english,
        type: 'training',
        status: training.training_status,
        start_date: training.training_start_date,
        end_date: training.training_end_date,
        location: training.training_location,
        participants: `${training.current_participants}/${training.max_participants}`,
      })),
      ...events.map(event => ({
        id: event.id,
        title: event.event_name,
        title_en: event.event_name_english,
        type: 'event',
        status: event.event_status,
        start_date: event.event_start_date,
        end_date: event.event_end_date,
        location: event.event_location,
        participants: `${event.current_attendees}/${event.max_attendees}`,
      })),
    ];

    return combinedItems.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesType;
    });
  }, [trainings, events, typeFilter]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get items for a specific day
  const getItemsForDay = (day: Date) => {
    return filteredItems.filter((item) => {
      const startDate = new Date(item.start_date);
      const endDate = new Date(item.end_date);
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  // Navigate months
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
      case 'ACTIVE':
        return 'bg-green-500';
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'PENDING':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get item type icon
  const getItemIcon = (type: string) => {
    if (type === 'training') {
      return <GraduationCap className="h-3 w-3 mr-1" />;
    }
    return <CalendarDays className="h-3 w-3 mr-1" />;
  };

  // Get Khmer month name
  const getKhmerMonth = (date: Date) => {
    const khmerMonths = [
      'មករា', 'កុលាបាភ្ជាប់', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វត្តមាន', 'ធ្នូ'
    ];
    return khmerMonths[date.getMonth()];
  };

  return (
    <DashboardLayout
      title="ប្រតិទិនរួម"
      subtitle="ការបណ្តុះបណ្តាល និងព្រឹត្តិការណ៍"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[140px]">
              <h2 className="text-lg font-semibold">
                {getKhmerMonth(currentDate)} {currentDate.getFullYear()}
              </h2>
              <p className="text-xs text-muted-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Button variant="outline" onClick={goToToday}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              ថ្ងៃនេះ
            </Button>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ប្រភេទ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                <SelectItem value="training">ការបណ្តុះបណ្តាល</SelectItem>
                <SelectItem value="event">ព្រឹត្តិការណ៍</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayItems = getItemsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 rounded-lg border transition-colors
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                      ${isToday ? 'border-primary border-2' : 'border-border'}
                      ${isWeekend ? 'hover:bg-muted/50' : 'hover:bg-accent'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-primary text-primary-foreground' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayItems.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayItems.length}
                        </Badge>
                      )}
                    </div>

                    {/* Items for this day */}
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${getStatusColor(item.status)}
                            text-white flex items-center
                          `}
                          title={`${item.title} (${item.location})`}
                        >
                          {getItemIcon(item.type)}
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{dayItems.length - 3} ទៀត
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm">ព្រាង</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm">កំពុងដំណើរ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm">បានបញ្ចប់</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm">បានលុប</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm">រង់ចាំ</span>
          </div>
        </div>

        {/* Upcoming Items List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ការបណ្តុះបណ្តាល និងព្រឹត្តិការណ៍កំពុងដំណើរ និងខាងមុខ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredItems
                .filter(item => 
                  item.status === 'ONGOING' || 
                  item.status === 'DRAFT' ||
                  item.status === 'UPCOMING'
                )
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}
                      />
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          {item.type === 'training' ? (
                            <GraduationCap className="h-3 w-3" />
                          ) : (
                            <CalendarDays className="h-3 w-3" />
                          )}
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(item.start_date), 'MMM d')} -{' '}
                        {format(new Date(item.end_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Users className="h-3 w-3" />
                        {item.participants}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
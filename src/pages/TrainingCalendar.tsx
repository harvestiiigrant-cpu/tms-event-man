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
  parseISO,
} from 'date-fns';
import { khmrLocale } from '@/lib/date-locale';
import type { Training } from '@/types/training';

const WEEKDAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];

export default function TrainingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch trainings
  const { data: trainings = [], isLoading } = useQuery<Training[]>({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
  });

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const matchesStatus = statusFilter === 'all' || training.training_status === statusFilter;
      return matchesStatus;
    });
  }, [trainings, statusFilter]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get trainings for a specific day
  const getTrainingsForDay = (day: Date) => {
    return filteredTrainings.filter((training) => {
      const startDate = new Date(training.training_start_date);
      const endDate = new Date(training.training_end_date);
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
        return 'bg-green-500';
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
      title="ប្រតិទិនការបណ្តុះ"
      subtitle="កាលបរិច្ឆេទការបណ្តុះបណ្តាល"
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                <SelectItem value="DRAFT">ព្រាង</SelectItem>
                <SelectItem value="ONGOING">កំពុងដំណើរ</SelectItem>
                <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                <SelectItem value="CANCELLED">បានលុប</SelectItem>
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
                const dayTrainings = getTrainingsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 rounded-lg border transition-colors
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
                      {dayTrainings.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayTrainings.length}
                        </Badge>
                      )}
                    </div>

                    {/* Trainings for this day */}
                    <div className="space-y-1">
                      {dayTrainings.slice(0, 3).map((training) => (
                        <div
                          key={training.id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${getStatusColor(training.training_status)}
                            text-white
                          `}
                          title={`${training.training_name} (${training.training_location})`}
                        >
                          {training.training_name}
                        </div>
                      ))}
                      {dayTrainings.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{dayTrainings.length - 3} ទៀត
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
        </div>

        {/* Upcoming Trainings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ការបណ្តុះបណ្តាលកំពុងដំណើរ និងខាងមុខ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTrainings
                .filter((t) => t.training_status === 'ONGOING' || t.training_status === 'DRAFT')
                .slice(0, 5)
                .map((training) => (
                  <div
                    key={training.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(training.training_status)}`}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{training.training_name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {training.training_location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(training.training_start_date), 'MMM d')} -{' '}
                        {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Users className="h-3 w-3" />
                        {training.current_participants}/{training.max_participants}
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

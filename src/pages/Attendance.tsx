import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

const statusConfig: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  PRESENT: {
    label: 'មានវត្តមាន',
    icon: CheckCircle2,
    className: 'bg-primary/10 text-primary',
  },
  ABSENT: {
    label: 'អវត្តមាន',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
  LATE: {
    label: 'មកយឺត',
    icon: Clock,
    className: 'bg-accent text-accent-foreground',
  },
  EXCUSED: {
    label: 'មានច្បាប់',
    icon: AlertCircle,
    className: 'bg-muted text-muted-foreground',
  },
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch all trainings
  const { data: allTrainings = [] } = useQuery({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
  });

  const ongoingTrainings = allTrainings.filter(
    (t: any) => t.training_status === 'ONGOING' || t.training_status === 'COMPLETED'
  );

  const [selectedTraining, setSelectedTraining] = useState<string>('');

  // Fetch attendance records for selected training
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', selectedTraining],
    queryFn: () => api.attendance.getByTraining(selectedTraining),
    enabled: !!selectedTraining,
  });

  // Fetch enrollments for selected training
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', selectedTraining],
    queryFn: () => api.enrollments.getByTraining(selectedTraining),
    enabled: !!selectedTraining,
  });

  // Extract beneficiaries from enrollments
  const enrolledBeneficiaries = enrollments.map((enrollment: any) => enrollment.beneficiary);
  const filteredRecords = attendanceRecords;

  // Calculate session statistics
  const totalEnrolled = enrolledBeneficiaries.length;
  const morningInCount = attendanceRecords.filter((r: any) => r.morning_in).length;
  const morningOutCount = attendanceRecords.filter((r: any) => r.morning_out).length;
  const afternoonInCount = attendanceRecords.filter((r: any) => r.afternoon_in).length;
  const afternoonOutCount = attendanceRecords.filter((r: any) => r.afternoon_out).length;

  return (
    <DashboardLayout title="ការចូលរួម" subtitle="តាមដានកំណត់ត្រាវត្តមានប្រចាំថ្ងៃ">
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                ជ្រើសរើសការបណ្តុះបណ្តាល
              </label>
              <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                <SelectTrigger>
                  <SelectValue placeholder="ជ្រើសរើសការបណ្តុះបណ្តាល..." />
                </SelectTrigger>
                <SelectContent>
                  {ongoingTrainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.training_name} ({training.training_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                កាលបរិច្ឆេទ
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left sm:w-[200px]">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="sm:self-end">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                នាំចេញ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ព្រឹក-ចូល</p>
                <p className="text-xs text-muted-foreground">7:00 - 8:30 AM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{morningInCount}</p>
                <p className="text-xs text-muted-foreground">/ {totalEnrolled} បានចូល</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ព្រឹក-ចេញ</p>
                <p className="text-xs text-muted-foreground">11:30 AM - 12:30 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{morningOutCount}</p>
                <p className="text-xs text-muted-foreground">/ {totalEnrolled} បានចេញ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">រសៀល-ចូល</p>
                <p className="text-xs text-muted-foreground">1:00 - 2:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{afternoonInCount}</p>
                <p className="text-xs text-muted-foreground">/ {totalEnrolled} បានចូល</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">រសៀល-ចេញ</p>
                <p className="text-xs text-muted-foreground">5:00 - 6:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{afternoonOutCount}</p>
                <p className="text-xs text-muted-foreground">/ {totalEnrolled} បានចេញ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>កំណត់ត្រាវត្តមាន</CardTitle>
          <CardDescription>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>អ្នកចូលរួម</TableHead>
                  <TableHead className="text-center">ព្រឹក-ចូល</TableHead>
                  <TableHead className="text-center">ព្រឹក-ចេញ</TableHead>
                  <TableHead className="text-center">រសៀល-ចូល</TableHead>
                  <TableHead className="text-center">រសៀល-ចេញ</TableHead>
                  <TableHead className="text-center">ស្ថានភាព</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledBeneficiaries.map((beneficiary) => {
                  const record = filteredRecords.find(
                    (r) => r.beneficiary_id === beneficiary.teacher_id
                  );
                  const status = record?.session_attendance_status || 'ABSENT';
                  const StatusIcon = statusConfig[status]?.icon || XCircle;

                  return (
                    <TableRow key={beneficiary.teacher_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={beneficiary.profile_image_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {beneficiary.name_english
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2) || 'NA'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {beneficiary.name_english}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {beneficiary.teacher_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.morning_in ? (
                          <span className="text-sm text-primary">
                            {format(new Date(record.morning_in), 'HH:mm')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.morning_out ? (
                          <span className="text-sm text-primary">
                            {format(new Date(record.morning_out), 'HH:mm')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.afternoon_in ? (
                          <span className="text-sm text-primary">
                            {format(new Date(record.afternoon_in), 'HH:mm')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.afternoon_out ? (
                          <span className="text-sm text-primary">
                            {format(new Date(record.afternoon_out), 'HH:mm')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'font-medium gap-1',
                            statusConfig[status]?.className
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[status]?.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useState } from 'react';
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
import { mockTrainings, mockBeneficiaries, mockAttendanceRecords } from '@/data/mockData';
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
    label: 'Present',
    icon: CheckCircle2,
    className: 'bg-primary/10 text-primary',
  },
  ABSENT: {
    label: 'Absent',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
  LATE: {
    label: 'Late',
    icon: Clock,
    className: 'bg-accent text-accent-foreground',
  },
  EXCUSED: {
    label: 'Excused',
    icon: AlertCircle,
    className: 'bg-muted text-muted-foreground',
  },
};

export default function Attendance() {
  const [selectedTraining, setSelectedTraining] = useState<string>(mockTrainings[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const ongoingTrainings = mockTrainings.filter(
    (t) => t.training_status === 'ONGOING' || t.training_status === 'COMPLETED'
  );

  const filteredRecords = mockAttendanceRecords.filter(
    (r) => r.training_id === selectedTraining
  );

  // Get beneficiaries enrolled in the selected training
  const enrolledBeneficiaries = mockBeneficiaries.slice(0, 4);

  return (
    <DashboardLayout title="Attendance" subtitle="Track daily attendance records">
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Select Training
              </label>
              <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a training" />
                </SelectTrigger>
                <SelectContent>
                  {ongoingTrainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.training_name_english} ({training.training_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Date
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
                Export
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
                <p className="text-sm text-muted-foreground">Morning In</p>
                <p className="text-xs text-muted-foreground">7:00 - 8:30 AM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">38</p>
                <p className="text-xs text-muted-foreground">/ 42 checked in</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Morning Out</p>
                <p className="text-xs text-muted-foreground">11:30 AM - 12:30 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">36</p>
                <p className="text-xs text-muted-foreground">/ 42 checked out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Afternoon In</p>
                <p className="text-xs text-muted-foreground">1:00 - 2:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">35</p>
                <p className="text-xs text-muted-foreground">/ 42 checked in</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Afternoon Out</p>
                <p className="text-xs text-muted-foreground">5:00 - 6:00 PM</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">34</p>
                <p className="text-xs text-muted-foreground">/ 42 checked out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Morning In</TableHead>
                  <TableHead className="text-center">Morning Out</TableHead>
                  <TableHead className="text-center">Afternoon In</TableHead>
                  <TableHead className="text-center">Afternoon Out</TableHead>
                  <TableHead className="text-center">Status</TableHead>
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

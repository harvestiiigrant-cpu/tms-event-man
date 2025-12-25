import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Training } from '@/types/training';
import { ClipboardList, Search, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ViewAttendanceDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

// Mock attendance record
interface AttendanceRecord {
  id: string;
  date: string;
  teacher_id: string;
  teacher_name: string;
  morning_in?: string;
  morning_out?: string;
  afternoon_in?: string;
  afternoon_out?: string;
  session_attendance_status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  manual_entry: boolean;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

// Mock data - replace with actual data fetching
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
    teacher_id: 'T001',
    teacher_name: 'សុខ សុវណ្ណា',
    morning_in: '08:00',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'PRESENT',
    manual_entry: false,
    location: {
      lat: 11.5564,
      lng: 104.9282,
      accuracy: 10,
    },
  },
  {
    id: '2',
    date: '2024-01-15',
    teacher_id: 'T002',
    teacher_name: 'ចន្ទ្រា ពេជ្រ',
    morning_in: '08:15',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'LATE',
    manual_entry: false,
  },
  {
    id: '3',
    date: '2024-01-15',
    teacher_id: 'T003',
    teacher_name: 'វិចិត្រា ធារា',
    session_attendance_status: 'ABSENT',
    manual_entry: false,
  },
  {
    id: '4',
    date: '2024-01-16',
    teacher_id: 'T001',
    teacher_name: 'សុខ សុវណ្ណា',
    morning_in: '08:00',
    morning_out: '12:00',
    session_attendance_status: 'PRESENT',
    manual_entry: true,
    location: {
      lat: 11.5564,
      lng: 104.9282,
      accuracy: 15,
    },
  },
  {
    id: '5',
    date: '2024-01-16',
    teacher_id: 'T002',
    teacher_name: 'ចន្ទ្រា ពេជ្រ',
    session_attendance_status: 'EXCUSED',
    manual_entry: true,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'LATE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'ABSENT':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'EXCUSED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export function ViewAttendanceDialog({ training, trigger }: ViewAttendanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique dates from attendance records
  const uniqueDates = Array.from(new Set(mockAttendanceRecords.map((r) => r.date))).sort();

  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matchesSearch =
      record.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.teacher_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter === 'all' || record.date === dateFilter;

    const matchesStatus =
      statusFilter === 'all' || record.session_attendance_status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter((r) => r.session_attendance_status === 'PRESENT').length,
    late: mockAttendanceRecords.filter((r) => r.session_attendance_status === 'LATE').length,
    absent: mockAttendanceRecords.filter((r) => r.session_attendance_status === 'ABSENT').length,
    excused: mockAttendanceRecords.filter((r) => r.session_attendance_status === 'EXCUSED').length,
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <ClipboardList className="mr-2 h-4 w-4" />
      View Attendance
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Attendance Records - {training.training_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(training.training_start_date), 'PPP')} -{' '}
            {format(new Date(training.training_end_date), 'PPP')}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or teacher ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(new Date(date), 'MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="EXCUSED">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
              <p className="text-xs text-green-700 dark:text-green-300">Present</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Late</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-xs text-red-700 dark:text-red-300">Absent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-xs text-blue-700 dark:text-blue-300">Excused</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.excused}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Morning In</TableHead>
                  <TableHead>Morning Out</TableHead>
                  <TableHead>Afternoon In</TableHead>
                  <TableHead>Afternoon Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(record.date), 'MMM d')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.teacher_name}</p>
                        <p className="text-xs text-muted-foreground">{record.teacher_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.morning_in ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.morning_in}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.morning_out ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.morning_out}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.afternoon_in ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.afternoon_in}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.afternoon_out ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.afternoon_out}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(record.session_attendance_status)}>
                        {record.session_attendance_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {record.manual_entry ? 'Manual' : 'Auto'}
                        </Badge>
                        {record.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            GPS
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-lg font-medium text-foreground">No attendance records found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

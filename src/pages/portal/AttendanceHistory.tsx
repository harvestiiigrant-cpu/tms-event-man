import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Clock, MapPin, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// Mock training data
const mockTraining = {
  id: '1',
  training_code: 'TR-2024-001',
  training_name: 'វគ្គបណ្តុះបណ្តាលគណិតវិទ្យា',
  training_start_date: '2024-01-15',
  training_end_date: '2024-01-20',
  training_location: 'Phnom Penh',
  total_sessions: 10,
  attended_sessions: 10,
  attendance_percentage: 95,
};

// Mock attendance records
const mockAttendanceRecords = [
  {
    id: '1',
    date: '2024-01-15',
    morning_in: '08:00',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'PRESENT',
    manual_entry: false,
    gps_verified: true,
  },
  {
    id: '2',
    date: '2024-01-16',
    morning_in: '08:15',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'LATE',
    manual_entry: false,
    gps_verified: true,
  },
  {
    id: '3',
    date: '2024-01-17',
    morning_in: '08:00',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'PRESENT',
    manual_entry: false,
    gps_verified: true,
  },
  {
    id: '4',
    date: '2024-01-18',
    morning_in: null,
    morning_out: null,
    afternoon_in: null,
    afternoon_out: null,
    session_attendance_status: 'ABSENT',
    manual_entry: false,
    gps_verified: false,
  },
  {
    id: '5',
    date: '2024-01-19',
    morning_in: '08:00',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'PRESENT',
    manual_entry: true,
    gps_verified: false,
  },
  {
    id: '6',
    date: '2024-01-20',
    morning_in: '08:00',
    morning_out: '12:00',
    afternoon_in: '14:00',
    afternoon_out: '17:00',
    session_attendance_status: 'PRESENT',
    manual_entry: false,
    gps_verified: true,
  },
];

export default function AttendanceHistory() {
  const { trainingId } = useParams();
  const [training] = useState(mockTraining);
  const [records] = useState(mockAttendanceRecords);

  const presentCount = records.filter((r) => r.session_attendance_status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.session_attendance_status === 'LATE').length;
  const absentCount = records.filter((r) => r.session_attendance_status === 'ABSENT').length;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'LATE':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <BeneficiaryPortalLayout
      title="ប្រវត្តិការចូលរួម"
      subtitle={`កំណត់ត្រាការចូលរួមលម្អិតសម្រាប់ ${training.training_name}`}
    >
      <div className="max-w-6xl space-y-6">
        {/* Back Button */}
        <Button asChild variant="ghost">
          <Link to="/portal/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ទៅប្រវត្តិ
          </Link>
        </Button>

        {/* Training Info */}
        <Card>
          <CardHeader>
            <CardTitle>{training.training_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{training.training_code}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(training.training_start_date), 'MMM d')} -{' '}
                  {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{training.training_location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {training.attended_sessions} / {training.total_sessions} sessions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ការចូលរួមសរុប</p>
                <p className="text-3xl font-bold">{training.attendance_percentage}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-green-700 dark:text-green-300">វត្តមាន</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">ចូលយឺត</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{lateCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-red-700 dark:text-red-300">អវត្តមាន</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>កំណត់ត្រាការចូលរួមប្រចាំថ្ងៃ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>កាលបរិច្ឆេទ</TableHead>
                    <TableHead>ចូលព្រឹក</TableHead>
                    <TableHead>ចេញព្រឹក</TableHead>
                    <TableHead>ចូលរសៀល</TableHead>
                    <TableHead>ចេញរសៀល</TableHead>
                    <TableHead>ស្ថានភាព</TableHead>
                    <TableHead>ការផ្ទៀងផ្ទាត់</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(record.date), 'MMM d, yyyy')}
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
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.session_attendance_status)}
                          <Badge variant="outline" className={getStatusColor(record.session_attendance_status)}>
                            {record.session_attendance_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-xs">
                            {record.manual_entry ? 'ដោយដៃ' : 'ស្វ័យប្រវត្តិ'}
                          </Badge>
                          {record.gps_verified && (
                            <Badge variant="outline" className="w-fit text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                              GPS ✓
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </BeneficiaryPortalLayout>
  );
}

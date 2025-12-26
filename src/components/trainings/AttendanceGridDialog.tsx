import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Training, AttendanceGridData, SessionAttendanceStatus, BulkAttendanceRecord } from '@/types/training';

interface AttendanceGridDialogProps {
  training: Training;
  trigger: React.ReactNode;
}

const STATUS_OPTIONS: { value: SessionAttendanceStatus; label: string; labelKm: string; icon: React.ReactNode; color: string }[] = [
  { value: 'PRESENT', label: 'Present', labelKm: 'មានវត្តមាន', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' },
  { value: 'ABSENT', label: 'Absent', labelKm: 'អវត្តមាន', icon: <XCircle className="h-3 w-3" />, color: 'text-red-600' },
  { value: 'LATE', label: 'Late', labelKm: 'មកយឺត', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600' },
  { value: 'EXCUSED', label: 'Excused', labelKm: 'មានច្បាប់', icon: <AlertCircle className="h-3 w-3" />, color: 'text-blue-600' },
];

const SESSION_LABELS = [
  { key: 'morning_in', label: 'M-In', labelKm: 'ព្រឹក-ចូល', time: '08:00' },
  { key: 'morning_out', label: 'M-Out', labelKm: 'ព្រឹក-ចេញ', time: '11:30' },
  { key: 'afternoon_in', label: 'A-In', labelKm: 'រសៀល-ចូល', time: '13:30' },
  { key: 'afternoon_out', label: 'A-Out', labelKm: 'រសៀល-ចេញ', time: '17:00' },
];

export function AttendanceGridDialog({ training, trigger }: AttendanceGridDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [localChanges, setLocalChanges] = useState<Record<string, Record<string, BulkAttendanceRecord>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance grid data
  const { data: gridData, isLoading } = useQuery<AttendanceGridData>({
    queryKey: ['attendance-grid', training.id],
    queryFn: () => api.attendance.getGrid(training.id),
    enabled: open,
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (records: BulkAttendanceRecord[]) =>
      api.attendance.bulkUpdate({
        training_id: training.id,
        records,
        manual_entry_reason: 'Updated via attendance grid',
      }),
    onSuccess: () => {
      toast({ title: 'រក្សាទុកបានជោគជ័យ', description: 'បានកត់ត្រាវត្តមានទាំងអស់' });
      queryClient.invalidateQueries({ queryKey: ['attendance-grid', training.id] });
      setLocalChanges({});
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Reset local changes when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setLocalChanges({});
      setHasChanges(false);
      setCurrentDayIndex(0);
    }
  }, [open]);

  // Get current day data
  const currentDay = gridData?.days[currentDayIndex];

  // Get attendance value (local changes take precedence)
  const getAttendanceValue = (beneficiaryId: string, date: string, field: string) => {
    const localRecord = localChanges[beneficiaryId]?.[date];
    if (localRecord) {
      return localRecord[field as keyof BulkAttendanceRecord];
    }
    const participant = gridData?.participants.find((p) => p.beneficiary_id === beneficiaryId);
    const attendance = participant?.attendance[date];
    if (field === 'session_attendance_status') {
      return attendance?.status || 'PRESENT';
    }
    return attendance?.[field as keyof typeof attendance] || null;
  };

  // Update local change
  const updateLocalChange = (beneficiaryId: string, date: string, field: string, value: any) => {
    setLocalChanges((prev) => {
      const participantChanges = prev[beneficiaryId] || {};
      const dateChanges = participantChanges[date] || {
        beneficiary_id: beneficiaryId,
        date,
        morning_in: getAttendanceValue(beneficiaryId, date, 'morning_in') as string | null,
        morning_out: getAttendanceValue(beneficiaryId, date, 'morning_out') as string | null,
        afternoon_in: getAttendanceValue(beneficiaryId, date, 'afternoon_in') as string | null,
        afternoon_out: getAttendanceValue(beneficiaryId, date, 'afternoon_out') as string | null,
        session_attendance_status: getAttendanceValue(beneficiaryId, date, 'session_attendance_status') as SessionAttendanceStatus,
      };

      return {
        ...prev,
        [beneficiaryId]: {
          ...participantChanges,
          [date]: {
            ...dateChanges,
            [field]: value,
          },
        },
      };
    });
    setHasChanges(true);
  };

  // Toggle session check
  const toggleSession = (beneficiaryId: string, date: string, sessionKey: string, sessionTime: string) => {
    const currentValue = getAttendanceValue(beneficiaryId, date, sessionKey);
    const newValue = currentValue ? null : sessionTime;
    updateLocalChange(beneficiaryId, date, sessionKey, newValue);
  };

  // Mark all present for a day
  const markAllPresent = () => {
    if (!currentDay || !gridData) return;

    gridData.participants.forEach((participant) => {
      SESSION_LABELS.forEach((session) => {
        updateLocalChange(participant.beneficiary_id, currentDay.date, session.key, session.time);
      });
      updateLocalChange(participant.beneficiary_id, currentDay.date, 'session_attendance_status', 'PRESENT');
    });
  };

  // Mark all absent for a day
  const markAllAbsent = () => {
    if (!currentDay || !gridData) return;

    gridData.participants.forEach((participant) => {
      SESSION_LABELS.forEach((session) => {
        updateLocalChange(participant.beneficiary_id, currentDay.date, session.key, null);
      });
      updateLocalChange(participant.beneficiary_id, currentDay.date, 'session_attendance_status', 'ABSENT');
    });
  };

  // Save changes
  const handleSave = () => {
    const allRecords: BulkAttendanceRecord[] = [];

    Object.values(localChanges).forEach((dates) => {
      Object.values(dates).forEach((record) => {
        allRecords.push(record);
      });
    });

    if (allRecords.length > 0) {
      bulkUpdateMutation.mutate(allRecords);
    }
  };

  // Stats for current day
  const dayStats = useMemo(() => {
    if (!currentDay || !gridData) return { present: 0, absent: 0, late: 0, excused: 0 };

    const stats = { present: 0, absent: 0, late: 0, excused: 0 };

    gridData.participants.forEach((participant) => {
      const status = getAttendanceValue(participant.beneficiary_id, currentDay.date, 'session_attendance_status') as SessionAttendanceStatus;
      if (status === 'PRESENT') stats.present++;
      else if (status === 'ABSENT') stats.absent++;
      else if (status === 'LATE') stats.late++;
      else if (status === 'EXCUSED') stats.excused++;
    });

    return stats;
  }, [currentDay, gridData, localChanges]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            គ្រប់គ្រងវត្តមាន - {training.training_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {training.training_code} • {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d, yyyy')}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !gridData || gridData.participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p>មិនមានអ្នកចូលរួមបានចុះឈ្មោះ</p>
          </div>
        ) : (
          <>
            {/* Day Navigation */}
            <div className="flex items-center justify-between border-b pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDayIndex((i) => Math.max(0, i - 1))}
                disabled={currentDayIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                ថ្ងៃមុន
              </Button>

              <div className="text-center">
                <div className="text-lg font-semibold">
                  ថ្ងៃទី {currentDay?.day_number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentDay && format(parseISO(currentDay.date), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDayIndex((i) => Math.min(gridData.days.length - 1, i + 1))}
                disabled={currentDayIndex === gridData.days.length - 1}
              >
                ថ្ងៃបន្ទាប់
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Quick Actions & Stats */}
            <div className="flex items-center justify-between py-2">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={markAllPresent}>
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  កំណត់ទាំងអស់ មានវត្តមាន
                </Button>
                <Button size="sm" variant="outline" onClick={markAllAbsent}>
                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                  កំណត់ទាំងអស់ អវត្តមាន
                </Button>
              </div>

              <div className="flex gap-3 text-sm">
                <span className="text-green-600">មានវត្តមាន: {dayStats.present}</span>
                <span className="text-red-600">អវត្តមាន: {dayStats.absent}</span>
                <span className="text-yellow-600">មកយឺត: {dayStats.late}</span>
                <span className="text-blue-600">មានច្បាប់: {dayStats.excused}</span>
              </div>
            </div>

            {/* Attendance Grid */}
            <ScrollArea className="flex-1 border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr>
                    <th className="text-left p-3 font-medium w-[200px] sticky left-0 bg-muted">
                      អ្នកចូលរួម
                    </th>
                    {SESSION_LABELS.map((session) => (
                      <th key={session.key} className="text-center p-2 font-medium w-[80px]">
                        <div>{session.labelKm}</div>
                        <div className="text-xs text-muted-foreground font-normal">{session.time}</div>
                      </th>
                    ))}
                    <th className="text-center p-2 font-medium w-[120px]">
                      ស្ថានភាព
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gridData.participants.map((participant, idx) => (
                    <tr
                      key={participant.beneficiary_id}
                      className={cn(
                        'border-b hover:bg-muted/50',
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      )}
                    >
                      <td className="p-3 sticky left-0 bg-inherit">
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">{participant.teacher_id}</div>
                      </td>

                      {SESSION_LABELS.map((session) => {
                        const checked = !!getAttendanceValue(participant.beneficiary_id, currentDay!.date, session.key);
                        return (
                          <td key={session.key} className="text-center p-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                toggleSession(participant.beneficiary_id, currentDay!.date, session.key, session.time)
                              }
                              className="mx-auto"
                            />
                          </td>
                        );
                      })}

                      <td className="text-center p-2">
                        <Select
                          value={getAttendanceValue(participant.beneficiary_id, currentDay!.date, 'session_attendance_status') as string}
                          onValueChange={(value) =>
                            updateLocalChange(participant.beneficiary_id, currentDay!.date, 'session_attendance_status', value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[100px] mx-auto text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <span className={cn('flex items-center gap-1', status.color)}>
                                  {status.icon}
                                  {status.labelKm}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="mt-4">
          <div className="flex items-center gap-2 mr-auto">
            {hasChanges && (
              <Badge variant="secondary" className="text-yellow-600">
                មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            បោះបង់
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || bulkUpdateMutation.isPending}>
            {bulkUpdateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            រក្សាទុក
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

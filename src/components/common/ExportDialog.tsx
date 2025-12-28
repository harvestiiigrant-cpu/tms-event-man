import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  GraduationCap,
  ClipboardCheck,
  Loader2,
} from 'lucide-react';
import {
  exportToCSV,
  formatBeneficiariesForExport,
  formatTrainingsForExport,
  formatAttendanceForExport,
  formatEnrollmentsForExport,
} from '@/utils/export';
import type { Training } from '@/types/training';

interface ExportDialogProps {
  entityType: 'beneficiaries' | 'trainings' | 'attendance' | 'enrollments';
  trainingId?: string;
  trainingName?: string;
  children?: React.ReactNode;
}

export function ExportDialog({ entityType, trainingId, trainingName, children }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState(`export_${entityType}_${new Date().toISOString().split('T')[0]}`);
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');

  // Fetch data based on entity type
  const { data: beneficiaries, isLoading: loadingBeneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: api.beneficiaries.getAll,
    enabled: open && entityType === 'beneficiaries',
  });

  const { data: trainings, isLoading: loadingTrainings } = useQuery({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
    enabled: open && entityType === 'trainings',
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', trainingId],
    queryFn: () => api.attendance.getAll({ trainingId }),
    enabled: open && entityType === 'attendance' && !!trainingId,
  });

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments', trainingId],
    queryFn: () => api.enrollments.getByTraining(trainingId!),
    enabled: open && entityType === 'enrollments' && !!trainingId,
  });

  const isLoading = loadingBeneficiaries || loadingTrainings || loadingAttendance || loadingEnrollments;

  const handleExport = async () => {
    let data: any[] = [];
    let finalFilename = filename;

    switch (entityType) {
      case 'beneficiaries':
        data = formatBeneficiariesForExport(beneficiaries || []);
        finalFilename = filename || 'beneficiaries';
        break;
      case 'trainings':
        data = formatTrainingsForExport(trainings || []);
        finalFilename = filename || 'trainings';
        break;
      case 'attendance':
        data = formatAttendanceForExport(attendance || [], trainingName || 'Training');
        finalFilename = filename || `attendance_${trainingName || 'training'}`;
        break;
      case 'enrollments':
        data = formatEnrollmentsForExport(enrollments || [], trainingName || 'Training');
        finalFilename = filename || `enrollments_${trainingName || 'training'}`;
        break;
    }

    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    if (format === 'csv') {
      exportToCSV(data, finalFilename);
    } else {
      exportToExcel(data, finalFilename);
    }

    setOpen(false);
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'beneficiaries':
        return 'អ្នកទទួលផល';
      case 'trainings':
        return 'ការបណ្តុះបណ្តាល';
      case 'attendance':
        return 'វត្តមាន';
      case 'enrollments':
        return 'ការចុះឈ្មោះ';
    }
  };

  const getIcon = () => {
    switch (entityType) {
      case 'beneficiaries':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'trainings':
        return <GraduationCap className="h-8 w-8 text-green-500" />;
      case 'attendance':
        return <ClipboardCheck className="h-8 w-8 text-orange-500" />;
      case 'enrollments':
        return <FileText className="h-8 w-8 text-purple-500" />;
    }
  };

  const getCount = () => {
    switch (entityType) {
      case 'beneficiaries':
        return beneficiaries?.length || 0;
      case 'trainings':
        return trainings?.length || 0;
      case 'attendance':
        return attendance?.length || 0;
      case 'enrollments':
        return enrollments?.length || 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            ទាញយក
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <div>
              <DialogTitle>ទាញយក {getEntityLabel()}</DialogTitle>
              <DialogDescription>
                ទាញយកទិន្នន័យជា CSV ឬ Excel
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Data Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ចំនួនទិន្នន័យ</span>
                  <span className="font-semibold">{getCount()} ទិន្នន័យ</span>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label>ទម្រង់ឯកសារ</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      format === 'csv'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('excel')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      format === 'excel'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="font-medium">Excel</span>
                  </button>
                </div>
              </div>

              {/* Filename */}
              <div className="space-y-2">
                <Label htmlFor="filename">ឈ្មោះឯកសារ</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="export_data"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            បោះបង់
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || getCount() === 0}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            ទាញយក
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

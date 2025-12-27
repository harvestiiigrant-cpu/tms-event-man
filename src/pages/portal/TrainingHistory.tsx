import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Clock, CheckCircle2, Award, Search, FileText, BookOpen, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export default function TrainingHistory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Fetch enrolled trainings for this beneficiary
  const { data: enrolledTrainings = [], isLoading } = useQuery({
    queryKey: ['enrolled-trainings', user?.teacher_id],
    queryFn: () => api.trainings.getEnrolled(user?.teacher_id!),
    enabled: !!user?.teacher_id,
  });

  const years = Array.from(
    new Set(enrolledTrainings.map((t: any) => new Date(t.training_start_date).getFullYear()))
  ).sort((a, b) => b - a);

  const filteredTrainings = useMemo(() => enrolledTrainings.filter((training: any) => {
    const matchesSearch =
      training.training_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.training_name_english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.training_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || training.enrollment_status === statusFilter;

    const matchesYear =
      yearFilter === 'all' ||
      new Date(training.training_start_date).getFullYear().toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  }), [enrolledTrainings, searchQuery, statusFilter, yearFilter]);

  const completedCount = enrolledTrainings.filter((t: any) => t.enrollment_status === 'COMPLETED').length;
  const certificatesCount = enrolledTrainings.filter((t: any) => t.certificate_issued).length;
  const totalHours = enrolledTrainings.reduce((sum: number, t: any) => {
    const days = Math.ceil(
      (new Date(t.training_end_date).getTime() - new Date(t.training_start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return sum + days * 6;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DROPPED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <BeneficiaryPortalLayout>
      <div className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{enrolledTrainings.length}</p>
              <p className="text-xs text-muted-foreground">សរុប</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
              <p className="text-xs text-muted-foreground">បានបញ្ចប់</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{certificatesCount}</p>
              <p className="text-xs text-muted-foreground">វិញ្ញាបនប័ត្រ</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalHours}</p>
              <p className="text-xs text-muted-foreground">ម៉ោង</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ស្វែងរកការបណ្តុះបណ្តាល..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="ស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                <SelectItem value="DROPPED">បានបោះបង់</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="ឆ្នាំ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ឆ្នាំទាំងអស់</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Training List */}
        <div className="space-y-3">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1">{training.training_name}</h3>
                      <p className="text-xs text-muted-foreground">{training.training_code}</p>
                    </div>
                    <Badge className={getStatusColor(training.attendance_status)}>
                      {training.attendance_status}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {format(new Date(training.training_start_date), 'MMM d')} - {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{training.training_location}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">ការចូលរួម</p>
                      <p className={`text-xl font-bold ${getAttendanceColor(training.attendance_percentage)}`}>
                        {training.attendance_percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {training.attended_sessions}/{training.total_sessions} វគ្គ
                      </p>
                    </div>

                    {training.certificate_issued && (
                      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-800 p-3">
                        <p className="text-xs text-green-700 dark:text-green-300 mb-1">វិញ្ញាបនប័ត្រ</p>
                        <Award className="h-8 w-8 text-green-600 dark:text-green-400 mt-1" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="h-10">
                      <Link to={`/portal/history/${training.id}/attendance`}>
                        <FileText className="mr-1.5 h-4 w-4" />
                        ការចូលរួម
                      </Link>
                    </Button>
                    {training.certificate_issued && (
                      <Button asChild variant="outline" size="sm" className="h-10">
                        <a href="#" download>
                          <Award className="mr-1.5 h-4 w-4" />
                          វិញ្ញាបនប័ត្រ
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrainings.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">គ្មានប្រវត្តិការបណ្តុះបណ្តាល</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                គ្មានការបណ្តុះបណ្តាលត្រូវនឹងលក្ខខណ្ឌស្វែងរករបស់អ្នកទេ
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </BeneficiaryPortalLayout>
  );
}

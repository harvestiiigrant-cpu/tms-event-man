import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  MapPinned,
  Search,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MyTrainings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('my-trainings');

  // Fetch enrolled trainings
  const { data: enrolledTrainings = [], isLoading: isLoadingEnrolled } = useQuery({
    queryKey: ['enrolled-trainings', user?.teacher_id],
    queryFn: () => api.trainings.getEnrolled(user?.teacher_id || ''),
    enabled: !!user?.teacher_id,
  });

  // Fetch available trainings
  const { data: availableTrainings = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['available-trainings', user?.teacher_id],
    queryFn: () => api.trainings.getAvailable(user?.teacher_id || ''),
    enabled: !!user?.teacher_id,
  });

  // Process enrolled trainings
  const currentTraining = enrolledTrainings.find(
    (t: any) => t.training_status === 'ONGOING' && t.enrollment_status === 'ATTENDED'
  );
  const upcomingTrainings = enrolledTrainings.filter(
    (t: any) => t.enrollment_status === 'REGISTERED'
  );
  const completedTrainings = enrolledTrainings.filter(
    (t: any) => t.training_status === 'COMPLETED'
  );

  // Filter available trainings by search
  const filteredAvailableTrainings = availableTrainings.filter((t: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.training_name?.toLowerCase().includes(query) ||
      t.training_name_english?.toLowerCase().includes(query) ||
      t.training_code.toLowerCase().includes(query) ||
      t.training_location?.toLowerCase().includes(query)
    );
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return {
          color: 'bg-blue-500 text-white',
          dot: 'bg-blue-500',
          label: 'កំពុងដំណើរការ'
        };
      case 'REGISTERED':
        return {
          color: 'bg-amber-500 text-white',
          dot: 'bg-amber-500',
          label: 'នឹងមកដល់'
        };
      case 'COMPLETED':
        return {
          color: 'bg-green-500 text-white',
          dot: 'bg-green-500',
          label: 'បានបញ្ចប់'
        };
      default:
        return {
          color: 'bg-gray-500 text-white',
          dot: 'bg-gray-500',
          label: status
        };
    }
  };

  // Loading state
  if (isLoadingEnrolled || isLoadingAvailable) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">កំពុងផ្ទុក...</p>
          </div>
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  const getCategoryIcon = (category: string) => {
    // Add category-specific colors
    const colors: Record<string, string> = {
      MATH: 'from-purple-500 to-purple-600',
      KHMER: 'from-blue-500 to-blue-600',
      IT: 'from-cyan-500 to-cyan-600',
      PEDAGOGY: 'from-green-500 to-green-600',
      LEADERSHIP: 'from-orange-500 to-orange-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getTrainingStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return { label: 'កំពុងដំណើរការ', color: 'bg-green-500/90' };
      case 'DRAFT':
        return { label: 'ចុះឈ្មោះបើក', color: 'bg-blue-500/90' };
      default:
        return { label: status, color: 'bg-gray-500/90' };
    }
  };

  return (
    <BeneficiaryPortalLayout>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        {/* Tabs Navigation */}
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="my-trainings" className="text-sm">
            <BookOpen className="h-4 w-4 mr-2" />
            ការបណ្តុះបណ្តាលរបស់ខ្ញុំ
          </TabsTrigger>
          <TabsTrigger value="available" className="text-sm">
            <Search className="h-4 w-4 mr-2" />
            ស្វែងរក ({availableTrainings.length})
          </TabsTrigger>
        </TabsList>

        {/* My Trainings Tab */}
        <TabsContent value="my-trainings" className="space-y-6 mt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{enrolledTrainings.length}</p>
              <p className="text-xs text-muted-foreground">បានចុះឈ្មោះ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTrainings.length}</p>
              <p className="text-xs text-muted-foreground">បានបញ្ចប់</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{upcomingTrainings.length}</p>
              <p className="text-xs text-muted-foreground">នឹងមកដល់</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Training - Hero Card */}
        {currentTraining && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ការបណ្តុះបណ្តាលសកម្ម</h2>
              <Badge variant="secondary" className="gap-1">
                <div className={cn("h-2 w-2 rounded-full animate-pulse", getStatusConfig(currentTraining.training_status).dot)} />
                {getStatusConfig(currentTraining.training_status).label}
              </Badge>
            </div>

            <Card className={cn(
              "overflow-hidden border-2 shadow-lg",
              "bg-gradient-to-br",
              getCategoryIcon(currentTraining.training_category)
            )}>
              <CardHeader className="pb-3">
                <div className="space-y-3 text-white">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                      {currentTraining.training_category}
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                      {currentTraining.training_level}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <CardTitle className="text-xl text-white mb-1">
                      {currentTraining.training_name}
                    </CardTitle>
                    <p className="text-sm text-white/90">{currentTraining.training_name_english}</p>
                    <p className="text-xs text-white/70 mt-1">{currentTraining.training_code}</p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">
                        {format(new Date(currentTraining.training_start_date), 'MMM d')} - {format(new Date(currentTraining.training_end_date), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">{currentTraining.training_location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="bg-card space-y-4">
                {/* Attendance Progress */}
                {currentTraining.attendance_percentage !== null && currentTraining.attendance_percentage !== undefined && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ការវឌ្ឍនភាពរបស់អ្នក</span>
                      <span className="text-2xl font-bold text-primary">{Math.round(currentTraining.attendance_percentage)}%</span>
                    </div>
                    <Progress value={currentTraining.attendance_percentage} className="h-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>ភាគរយចូលរួម: {Math.round(currentTraining.attendance_percentage)}%</span>
                    </div>
                  </div>
                )}

                {/* GPS Requirements */}
                {(currentTraining.gps_validation_required || currentTraining.geofence_validation_required) && (
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                    <div className="flex items-start gap-2">
                      <MapPinned className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">តម្រូវការទីតាំង</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {currentTraining.geofence_validation_required
                            ? `ចុះឈ្មោះក្នុងរយៈ ${currentTraining.geofence_radius}ម ពីទីកន្លែង`
                            : 'ទីតាំង GPS ត្រូវការសម្រាប់ការចូលរួម'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button asChild size="lg" className="h-12">
                    <Link to={`/portal/attendance/${currentTraining.id}`}>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      ចុះឈ្មោះ
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12">
                    <Link to={`/portal/trainings/${currentTraining.id}`}>
                      មើលពត៌មានលម្អិត
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Trainings */}
        {upcomingTrainings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">នឹងមកដល់</h2>
              <Badge variant="secondary">{upcomingTrainings.length}</Badge>
            </div>

            <div className="space-y-3">
              {upcomingTrainings.map((training: any) => {
                const statusConfig = getStatusConfig(training.training_status);
                return (
                  <Link
                    key={training.id}
                    to={`/portal/trainings/${training.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                            getCategoryIcon(training.training_category)
                          )}>
                            <Award className="h-6 w-6 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm line-clamp-1">
                                {training.training_name}
                              </h3>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                              {training.training_name_english}
                            </p>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(training.training_start_date), 'PPP')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{training.training_location} • {training.training_venue}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* No trainings state */}
        {enrolledTrainings.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">មិនទាន់មានការបណ្តុះបណ្តាល</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                អ្នកមិនទាន់បានចុះឈ្មោះក្នុងការបណ្តុះបណ្តាលណាមួយទេ។ ពិនិត្យមើលការបណ្តុះបណ្តាលដែលអាចចុះឈ្មោះបានក្នុងផ្ទាំង "ស្វែងរក"។
              </p>
            </CardContent>
          </Card>
        )}
        </TabsContent>

        {/* Available Trainings Tab */}
        <TabsContent value="available" className="space-y-6 mt-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ ឬទីកន្លែង..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Available Trainings Count */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ការបណ្តុះបណ្តាលដែលអាចចុះឈ្មោះបាន</h2>
            <Badge variant="secondary">{filteredAvailableTrainings.length}</Badge>
          </div>

          {/* Available Trainings List */}
          <div className="space-y-3">
            {filteredAvailableTrainings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'រកមិនឃើញ' : 'គ្មានការបណ្តុះបណ្តាល'}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery
                      ? 'សូមព្យាយាមស្វែងរកដោយប្រើពាក្យគន្លឹះផ្សេង'
                      : 'មិនមានការបណ្តុះបណ្តាលដែលកំពុងដំណើរការនៅពេលនេះទេ។'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                      លុបការស្វែងរក
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredAvailableTrainings.map((training) => {
                const categoryConfig = getCategoryIcon(training.training_category);
                const statusBadge = getTrainingStatusBadge(training.training_status);
                return (
                  <Card
                    key={training.id}
                    className="overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <CardContent className="p-0">
                      {/* Gradient Header */}
                      <div className={cn(
                        'p-4 pb-3 bg-gradient-to-br',
                        categoryConfig
                      )}>
                        <div className="space-y-3 text-white">
                          {/* Category Badge */}
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                              {training.training_category}
                            </Badge>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                              {training.training_level}
                            </Badge>
                            <Badge className={cn(statusBadge.color, "text-white border-white/20 ml-auto")}>
                              {statusBadge.label}
                            </Badge>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {training.training_name}
                            </h3>
                            <p className="text-sm text-white/90 line-clamp-1">
                              {training.training_name_english}
                            </p>
                            <p className="text-xs text-white/70 mt-1">{training.training_code}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {format(new Date(training.training_start_date), 'MMM d')} - {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground line-clamp-1">
                              {training.training_location} • {training.training_venue}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {training.current_participants || 0} / {training.max_participants} បានចុះឈ្មោះ
                            </span>
                          </div>
                        </div>

                        {/* GPS Requirements */}
                        {(training.gps_validation_required || training.geofence_validation_required) && (
                          <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                            <div className="flex items-start gap-2">
                              <MapPinned className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1 flex-1">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">តម្រូវការទីតាំង</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  {training.geofence_validation_required
                                    ? `ចុះឈ្មោះក្នុងរយៈ ${training.geofence_radius}ម ពីទីកន្លែង`
                                    : 'ទីតាំង GPS ត្រូវការសម្រាប់ការចូលរួម'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="lg"
                            className="h-12"
                            onClick={() => navigate(`/portal/trainings/${training.id}`)}
                          >
                            មើលពត៌មាន
                          </Button>
                          <Button
                            size="lg"
                            className="h-12"
                            onClick={() => navigate(`/enroll?training=${training.id}`)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            ចុះឈ្មោះ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </BeneficiaryPortalLayout>
  );
}

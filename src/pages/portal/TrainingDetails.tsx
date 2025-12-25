import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  MapPinned,
  Award,
  BookOpen,
  ChevronLeft,
  FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock training data - would come from API
const mockTraining = {
  id: '1',
  training_code: 'TR-2024-001',
  training_name: 'វគ្គបណ្តុះបណ្តាលគណិតវិទ្យា',
  training_name_english: 'Mathematics Training Workshop',
  training_category: 'MATH',
  training_type: 'WORKSHOP',
  training_level: 'PROVINCIAL',
  training_start_date: '2024-01-15',
  training_end_date: '2024-01-20',
  training_location: 'Phnom Penh',
  training_venue: 'Ministry of Education',
  training_description: 'This comprehensive mathematics training workshop is designed to enhance teaching methodologies and introduce modern pedagogical approaches for mathematics education at the secondary level.',
  max_participants: 50,
  current_participants: 35,
  gps_validation_required: true,
  geofence_validation_required: true,
  geofence_radius: 100,
  venue_latitude: 11.5564,
  venue_longitude: 104.9282,
  status: 'ONGOING',
  my_attendance_status: 'ATTENDED',
  my_training_role: 'PARTICIPANT',
  attendance_percentage: 75,
  total_sessions: 10,
  attended_sessions: 8,
  is_enrolled: true,
};

const getCategoryIcon = (category: string) => {
  const colors: Record<string, string> = {
    MATH: 'from-purple-500 to-purple-600',
    KHMER: 'from-blue-500 to-blue-600',
    IT: 'from-cyan-500 to-cyan-600',
    PEDAGOGY: 'from-green-500 to-green-600',
    LEADERSHIP: 'from-orange-500 to-orange-600',
  };
  return colors[category] || 'from-gray-500 to-gray-600';
};

export default function TrainingDetails() {
  const { id } = useParams();
  const [training] = useState(mockTraining);

  const isOngoing = training.status === 'ONGOING';
  const isCompleted = training.status === 'COMPLETED';

  return (
    <BeneficiaryPortalLayout>
      <div className="space-y-4">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to="/portal/trainings">
            <ChevronLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ទៅការបណ្តុះបណ្តាលរបស់ខ្ញុំ
          </Link>
        </Button>

        {/* Training Header Card */}
        <Card className={cn(
          'overflow-hidden border-2 shadow-lg bg-gradient-to-br',
          getCategoryIcon(training.training_category)
        )}>
          <CardContent className="p-0">
            {/* Gradient Header */}
            <div className="p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                  {training.training_category}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                  {training.training_level}
                </Badge>
                {training.is_enrolled && (
                  <Badge className="bg-green-500 text-white border-white/20">
                    ✓ បានចុះឈ្មោះ
                  </Badge>
                )}
              </div>

              <h1 className="text-xl font-bold mb-1">{training.training_name}</h1>
              <p className="text-sm text-white/90 mb-1">{training.training_name_english}</p>
              <p className="text-xs text-white/70">{training.training_code}</p>
            </div>

            {/* White Content Section */}
            <div className="bg-card p-5 space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">កាលបរិច្ឆេទ</p>
                    <p className="font-medium text-xs">
                      {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">រយៈពេល</p>
                    <p className="font-medium text-xs">{training.total_sessions} វគ្គ</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">ទីតាំង</p>
                    <p className="font-medium text-xs line-clamp-1">{training.training_location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">អ្នកចូលរួម</p>
                    <p className="font-medium text-xs">{training.current_participants}/{training.max_participants}</p>
                  </div>
                </div>
              </div>

              {/* My Progress (if enrolled) */}
              {training.is_enrolled && isOngoing && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">ការវឌ្ឍនភាពរបស់ខ្ញុំ</span>
                    <span className="text-2xl font-bold text-primary">{training.attendance_percentage}%</span>
                  </div>
                  <Progress value={training.attendance_percentage} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    បានចូលរួម {training.attended_sessions} ក្នុងចំណោម {training.total_sessions} វគ្គ
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {training.is_enrolled && isOngoing && (
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild size="lg" className="h-12">
                    <Link to={`/portal/attendance/${training.id}`}>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      ចុះឈ្មោះ
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12">
                    <Link to={`/portal/history/${training.id}/attendance`}>
                      <FileText className="mr-2 h-5 w-5" />
                      ការចូលរួម
                    </Link>
                  </Button>
                </div>
              )}

              {isCompleted && training.is_enrolled && (
                <Button asChild className="w-full h-12">
                  <a href="#" download>
                    <Award className="mr-2 h-5 w-5" />
                    ទាញយកវិញ្ញាបនប័ត្រ
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {training.training_description && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">អំពីការបណ្តុះបណ្តាលនេះ</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {training.training_description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Venue Details */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPinned className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">ព័ត៌មានទីកន្លែង</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">ឈ្មោះទីកន្លែង</p>
                <p className="text-sm font-medium">{training.training_venue}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ទីតាំង</p>
                <p className="text-sm font-medium">{training.training_location}</p>
              </div>

              {(training.gps_validation_required || training.geofence_validation_required) && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">តម្រូវការផ្ទៀងផ្ទាត់ GPS</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {training.geofence_validation_required
                          ? `អ្នកត្រូវស្ថិតក្នុងរង្វង់ ${training.geofence_radius}ម ពីទីកន្លែងដើម្បីចុះឈ្មោះ`
                          : 'ទីតាំង GPS របស់អ្នកនឹងត្រូវបានកត់ត្រាពេលចុះឈ្មោះ'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">ព័ត៌មានលម្អិតការបណ្តុះបណ្តាល</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">លេខកូដការបណ្តុះបណ្តាល</p>
                <p className="font-medium font-mono">{training.training_code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ប្រភេទ</p>
                <p className="font-medium">{training.training_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ប្រភេទមុខវិជ្ជា</p>
                <p className="font-medium">{training.training_category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">កម្រិត</p>
                <p className="font-medium">{training.training_level}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">វគ្គសរុប</p>
                <p className="font-medium">{training.total_sessions} វគ្គ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">សមត្ថភាពទទួល</p>
                <p className="font-medium">{training.max_participants} អ្នកចូលរួម</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BeneficiaryPortalLayout>
  );
}

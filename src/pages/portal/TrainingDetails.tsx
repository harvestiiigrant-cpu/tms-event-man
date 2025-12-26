import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  ListTodo,
  Download,
  ExternalLink,
  File,
  Link2,
  Video,
  Image,
  FileSpreadsheet,
  Presentation,
  Loader2,
} from 'lucide-react';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { MATERIAL_CATEGORIES } from '@/types/training';
import type { Training, TrainingAgenda, TrainingMaterialLink, TrainingMaterial } from '@/types/training';

const getCategoryIcon = (category?: string) => {
  const colors: Record<string, string> = {
    MATH: 'from-purple-500 to-purple-600',
    KHMER: 'from-blue-500 to-blue-600',
    IT: 'from-cyan-500 to-cyan-600',
    PEDAGOGY: 'from-green-500 to-green-600',
    LEADERSHIP: 'from-orange-500 to-orange-600',
  };
  return colors[category || ''] || 'from-gray-500 to-gray-600';
};

// Helper to get material icon
const getMaterialIcon = (material: TrainingMaterial) => {
  if (material.material_type === 'URL') {
    return <Link2 className="h-4 w-4" />;
  }

  const mime = material.mime_type || '';
  if (mime.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (mime.startsWith('video/')) {
    return <Video className="h-4 w-4" />;
  }
  if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return <FileSpreadsheet className="h-4 w-4" />;
  }
  if (mime.includes('presentation') || mime.includes('powerpoint')) {
    return <Presentation className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

// Format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function TrainingDetails() {
  const { id } = useParams();

  // Fetch training details
  const { data: training, isLoading: loadingTraining } = useQuery({
    queryKey: ['training', id],
    queryFn: () => api.trainings.getById(id!),
    enabled: !!id,
  });

  // Fetch agendas
  const { data: agendas = [], isLoading: loadingAgendas } = useQuery({
    queryKey: ['agendas', id],
    queryFn: () => api.agendas.getByTraining(id!),
    enabled: !!id,
  });

  // Fetch linked materials
  const { data: materialLinks = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ['training-materials', id],
    queryFn: () => api.materials.getByTraining(id!),
    enabled: !!id,
  });

  const handleDownloadMaterial = (material: TrainingMaterial) => {
    if (material.material_type === 'URL' && material.external_url) {
      window.open(material.external_url, '_blank');
    } else if (material.file_url) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      window.open(`${apiUrl.replace('/api', '')}${material.file_url}`, '_blank');
    }
  };

  if (loadingTraining) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  if (!training) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">រកមិនឃើញការបណ្តុះបណ្តាល</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/portal/trainings">ត្រឡប់ទៅការបណ្តុះបណ្តាលរបស់ខ្ញុំ</Link>
          </Button>
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  const isOngoing = training.training_status === 'ONGOING';
  const isCompleted = training.training_status === 'COMPLETED';

  // Calculate training days for agenda grouping
  const startDate = new Date(training.training_start_date);
  const endDate = new Date(training.training_end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  // Group agendas by day
  const getAgendasForDay = (dayNumber: number) => {
    return agendas
      .filter((a: TrainingAgenda) => a.day_number === dayNumber)
      .sort((a: TrainingAgenda, b: TrainingAgenda) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.start_time.localeCompare(b.start_time);
      });
  };

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
                    <p className="font-medium text-xs">{totalDays} ថ្ងៃ</p>
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

              {/* Action Buttons */}
              {isOngoing && (
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

              {isCompleted && (
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

        {/* Training Agenda */}
        {agendas.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ListTodo className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">កម្មវិធីបណ្តុះបណ្តាល</h3>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
                  const dayAgendas = getAgendasForDay(dayNum);
                  const dayDate = addDays(startDate, dayNum - 1);

                  if (dayAgendas.length === 0) return null;

                  return (
                    <AccordionItem key={dayNum} value={`day-${dayNum}`}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">ថ្ងៃទី {dayNum}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(dayDate, 'EEEE, MMM d')}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {dayAgendas.map((agenda: TrainingAgenda) => (
                            <div
                              key={agenda.id}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="text-center shrink-0 bg-primary/10 rounded-lg p-2 min-w-[60px]">
                                <p className="text-xs font-semibold text-primary">
                                  {agenda.start_time}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {agenda.end_time}
                                </p>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{agenda.topic_km || agenda.topic_en}</p>
                                {agenda.topic_en && agenda.topic_km && (
                                  <p className="text-xs text-muted-foreground">{agenda.topic_en}</p>
                                )}
                                {(agenda.instructor_name || agenda.instructor_name_km) && (
                                  <p className="text-xs text-primary mt-1">
                                    {agenda.instructor_name_km || agenda.instructor_name}
                                  </p>
                                )}
                                {(agenda.description_km || agenda.description_en) && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {agenda.description_km || agenda.description_en}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Training Materials */}
        {materialLinks.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">ឯកសារបណ្តុះបណ្តាល</h3>
              </div>

              <div className="space-y-2">
                {materialLinks.map((link: TrainingMaterialLink) => {
                  const material = link.material;
                  if (!material) return null;

                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        {getMaterialIcon(material)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {material.title_km || material.title_en}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] py-0">
                            {material.material_type === 'FILE' ? 'ឯកសារ' : 'តំណ'}
                          </Badge>
                          {material.category && (
                            <span className="text-[10px] text-muted-foreground">
                              {MATERIAL_CATEGORIES.find(c => c.code === material.category)?.name_km}
                            </span>
                          )}
                          {material.file_size && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatFileSize(material.file_size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleDownloadMaterial(material)}
                      >
                        {material.material_type === 'URL' ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
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
              {training.training_venue && (
                <div>
                  <p className="text-xs text-muted-foreground">ឈ្មោះទីកន្លែង</p>
                  <p className="text-sm font-medium">{training.training_venue}</p>
                </div>
              )}
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
                <p className="text-xs text-muted-foreground">រយៈពេល</p>
                <p className="font-medium">{totalDays} ថ្ងៃ</p>
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

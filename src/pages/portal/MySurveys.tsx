import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SURVEY_TYPES } from '@/types/training';
import type { SurveyType } from '@/types/training';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const getSurveyTypeIcon = (type: SurveyType) => {
  switch (type) {
    case 'PRE_TEST':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'POST_TEST':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'FEEDBACK':
      return <ClipboardList className="h-5 w-5 text-purple-600" />;
    default:
      return <FileText className="h-5 w-5 text-gray-600" />;
  }
};

export default function MySurveys() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['my-surveys', user?.teacher_id],
    queryFn: () => api.surveys.getBeneficiarySurveys(user?.teacher_id || ''),
    enabled: !!user?.teacher_id,
  });

  const handleTakeSurvey = (surveyId: string, trainingId: string) => {
    navigate(`/portal/surveys/${surveyId}/take?training_id=${trainingId}`);
  };

  const handleViewResults = (surveyId: string) => {
    navigate(`/portal/surveys/${surveyId}/results`);
  };

  return (
    <BeneficiaryPortalLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">ការស្ទង់មតិ និងតេស្ត</h1>
          <p className="text-muted-foreground">ការស្ទង់មតិ និងតេស្តដែលត្រូវធ្វើ</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">មិនមានការស្ទង់មតិ</p>
              <p className="text-sm text-muted-foreground">
                អ្នកមិនទាន់មានការស្ទង់មតិ ឬតេស្តដែលត្រូវធ្វើទេ
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {surveys.map((link: any) => {
              const survey = link.survey;
              const typeConfig = SURVEY_TYPES.find((t) => t.value === survey.survey_type);
              const isCompleted = link.completed;
              const isPassed = link.passed;

              return (
                <Card key={link.id} className={isCompleted ? 'bg-muted/30' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getSurveyTypeIcon(survey.survey_type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base">{survey.title_km}</h3>
                            <p className="text-xs text-muted-foreground">{survey.title_en}</p>
                          </div>
                          {link.is_required && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              តម្រូវ
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{typeConfig?.label_km}</Badge>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {survey._count?.questions || 0} សំណួរ
                          </span>
                          {survey.time_limit && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {survey.time_limit} នាទី
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {link.training?.training_name}
                          </span>
                        </div>

                        {survey.description_km && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {survey.description_km}
                          </p>
                        )}

                        {isCompleted ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-700">បានបញ្ចប់</p>
                              {link.score !== null && link.score !== undefined && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={link.score} className="h-2 flex-1" />
                                  <span className="text-sm font-medium">
                                    {Math.round(link.score)}%
                                  </span>
                                  {isPassed !== null && (
                                    <Badge
                                      variant="outline"
                                      className={
                                        isPassed
                                          ? 'bg-green-50 text-green-700 border-green-200'
                                          : 'bg-red-50 text-red-700 border-red-200'
                                      }
                                    >
                                      {isPassed ? 'ជាប់' : 'ធ្លាក់'}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            {survey.show_results_to_beneficiary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResults(survey.id)}
                              >
                                មើលលទ្ធផល
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleTakeSurvey(survey.id, link.training_id)}
                              className="w-full sm:w-auto"
                            >
                              ចាប់ផ្តើមធ្វើ
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            {link.custom_deadline && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                ថ្ងៃផុតកំណត់: {format(parseISO(link.custom_deadline), 'MMM d')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </BeneficiaryPortalLayout>
  );
}

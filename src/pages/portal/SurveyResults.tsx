import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const responseId = searchParams.get('response_id');
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['survey-response', responseId],
    queryFn: async () => {
      // This would need a specific endpoint to get a single response
      // For now, we'll use the results endpoint and filter
      const results = await api.surveys.getResults(surveyId!);
      return results.responses?.find((r: any) => r.id === responseId);
    },
    enabled: !!surveyId && !!responseId,
  });

  if (isLoading) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  if (!response) {
    return (
      <BeneficiaryPortalLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">រកមិនឃើញលទ្ធផល</p>
          </CardContent>
        </Card>
      </BeneficiaryPortalLayout>
    );
  }

  const isPassed = response.passed;
  const percentage = response.percentage || 0;

  return (
    <BeneficiaryPortalLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <Button variant="ghost" onClick={() => navigate('/portal/surveys')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          ត្រឡប់ទៅការស្ទង់មតិរបស់ខ្ញុំ
        </Button>

        {/* Results Summary */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isPassed !== null ? (
                isPassed ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600" />
                )
              ) : (
                <Award className="h-16 w-16 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isPassed !== null ? (
                isPassed ? (
                  'អបអរសាទរ! អ្នកបានជាប់ ✓'
                ) : (
                  'សូមព្យាយាមម្តងទៀត'
                )
              ) : (
                'បានបញ្ចប់'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            {response.percentage !== null && response.percentage !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ពិន្ទុរបស់អ្នក</span>
                  <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
                {response.total_score !== null && (
                  <p className="text-xs text-muted-foreground text-center">
                    {response.total_score} / {response.max_score} ពិន្ទុ
                  </p>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {response.question_responses?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">សំណួរបានឆ្លើយ</p>
              </div>

              {response.time_spent_seconds && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                    <Clock className="h-5 w-5" />
                    {Math.floor(response.time_spent_seconds / 60)}
                  </div>
                  <p className="text-xs text-muted-foreground">នាទីប្រើប្រាស់</p>
                </div>
              )}

              {response.submitted_at && (
                <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">បានបញ្ជូននៅ</p>
                  <p className="font-medium">
                    {format(new Date(response.submitted_at), 'MMM d, yyyy - h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {/* Pass/Fail Badge */}
            {isPassed !== null && (
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className={
                    isPassed
                      ? 'bg-green-50 text-green-700 border-green-200 px-6 py-2'
                      : 'bg-red-50 text-red-700 border-red-200 px-6 py-2'
                  }
                >
                  {isPassed ? '✓ ជាប់' : '✗ ធ្លាក់'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={() => navigate('/portal/trainings')}>
            ត្រឡប់ទៅការបណ្តុះបណ្តាលរបស់ខ្ញុំ
          </Button>
        </div>
      </div>
    </BeneficiaryPortalLayout>
  );
}

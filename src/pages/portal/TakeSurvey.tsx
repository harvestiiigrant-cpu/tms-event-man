import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import type { SurveyQuestion } from '@/types/training';

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const trainingId = searchParams.get('training_id');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());

  // Fetch survey and start response
  const { data, isLoading } = useQuery({
    queryKey: ['take-survey', surveyId, user?.teacher_id, trainingId],
    queryFn: () => api.surveys.startSurvey(surveyId!, user?.teacher_id!, trainingId!),
    enabled: !!surveyId && !!user?.teacher_id && !!trainingId,
  });

  const survey = data?.survey;
  const questions = survey?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (responseData: any) => api.surveys.submitResponse(surveyId!, responseData),
    onSuccess: (response) => {
      toast({
        title: 'ជោគជ័យ',
        description: 'បានបញ្ជូនការស្ទង់មតិរបស់អ្នក',
      });
      navigate(`/portal/surveys/${surveyId}/results?response_id=${response.id}`);
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const formattedAnswers = Object.entries(answers).map(([question_id, answer_value]) => ({
      question_id,
      answer_value: typeof answer_value === 'object' ? JSON.stringify(answer_value) : String(answer_value),
    }));

    submitMutation.mutate({
      beneficiary_id: user?.teacher_id,
      training_id: trainingId,
      answers: formattedAnswers,
      time_spent_seconds: timeSpent,
    });
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (isLoading) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  if (!survey || !currentQuestion) {
    return (
      <BeneficiaryPortalLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">រកមិនឃើញការស្ទង់មតិ</p>
          </CardContent>
        </Card>
      </BeneficiaryPortalLayout>
    );
  }

  const renderQuestionInput = (question: SurveyQuestion) => {
    const answer = answers[question.id];

    switch (question.question_type) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            {question.options_km.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`q-${question.id}-${index}`} />
                <Label htmlFor={`q-${question.id}-${index}`} className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TRUE_FALSE':
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
              <RadioGroupItem value="true" id={`q-${question.id}-true`} />
              <Label htmlFor={`q-${question.id}-true`} className="flex-1 cursor-pointer">
                ពិត (True)
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
              <RadioGroupItem value="false" id={`q-${question.id}-false`} />
              <Label htmlFor={`q-${question.id}-false`} className="flex-1 cursor-pointer">
                មិនពិត (False)
              </Label>
            </div>
          </RadioGroup>
        );

      case 'LIKERT_SCALE':
      case 'RATING':
        const max = question.scale_max || 5;
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            {Array.from({ length: max }, (_, i) => i + 1).map((value) => (
              <div key={value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={value.toString()} id={`q-${question.id}-${value}`} />
                <Label htmlFor={`q-${question.id}-${value}`} className="flex-1 cursor-pointer">
                  {value} - {question.scale_labels_km?.[value - 1] || ''}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'SHORT_TEXT':
        return (
          <Input
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="វាយចម្លើយរបស់អ្នក..."
          />
        );

      case 'LONG_TEXT':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="វាយចម្លើយរបស់អ្នក..."
            rows={6}
          />
        );

      default:
        return null;
    }
  };

  return (
    <BeneficiaryPortalLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>{survey.title_km}</CardTitle>
            <p className="text-sm text-muted-foreground">{survey.title_en}</p>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>សំណួរទី {currentQuestionIndex + 1} / {questions.length}</span>
              <span className="text-muted-foreground">
                បានឆ្លើយ: {answeredCount} / {questions.length}
              </span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold">
                  {currentQuestion.question_text_km}
                </h2>
                {currentQuestion.is_required && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shrink-0">
                    តម្រូវ
                  </Badge>
                )}
              </div>
              {currentQuestion.help_text_km && (
                <p className="text-sm text-muted-foreground mb-4">
                  {currentQuestion.help_text_km}
                </p>
              )}
              {currentQuestion.points && (
                <p className="text-xs text-muted-foreground mb-4">
                  ពិន្ទុ: {currentQuestion.points}
                </p>
              )}
            </div>

            {renderQuestionInput(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            មុន
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <Clock className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              បញ្ជូន
            </Button>
          ) : (
            <Button onClick={handleNext}>
              បន្ទាប់
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </BeneficiaryPortalLayout>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import type { SurveyQuestion } from '@/types/training';

interface SurveyPreviewDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreviewMode = 'intro' | 'taking' | 'results';

export function SurveyPreviewDialog({
  surveyId,
  open,
  onOpenChange,
}: SurveyPreviewDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<PreviewMode>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [showValidation, setShowValidation] = useState(false);
  const [saveResponses, setSaveResponses] = useState(true); // Changed default to true
  const [submittedResponseId, setSubmittedResponseId] = useState<string | null>(null);

  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => api.surveys.getById(surveyId),
    enabled: open,
  });

  const questions = survey?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isTest = survey?.survey_type === 'PRE_TEST' || 
                 survey?.survey_type === 'POST_TEST' || 
                 survey?.survey_type === 'EVALUATION';

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMode('intro');
      setCurrentQuestionIndex(0);
      setAnswers({});
      setStartTime(0);
      setTimeSpent(0);
      setShowValidation(false);
      setSaveResponses(true); // Default to saving responses
      setSubmittedResponseId(null);
    }
  }, [open]);

  // Track time spent
  useEffect(() => {
    if (mode === 'taking' && startTime > 0) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, startTime]);

  const handleStartPreview = () => {
    setMode('taking');
    setStartTime(Date.now());
  };

  const handleRestart = () => {
    setMode('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStartTime(0);
    setTimeSpent(0);
    setShowValidation(false);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
    setShowValidation(false);
  };

  const handleNext = () => {
    if (currentQuestion.is_required && !answers[currentQuestion.id]) {
      setShowValidation(true);
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowValidation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowValidation(false);
    }
  };

  const handleFinish = () => {
    // Check if all required questions are answered
    const unansweredRequired = questions.filter(
      (q: any) => q.is_required && !answers[q.id]
    );
    if (unansweredRequired.length > 0) {
      setShowValidation(true);
      return;
    }

    if (saveResponses) {
      // Submit real response
      submitMutation.mutate();
    } else {
      // Just show preview results
      setMode('results');
    }
  };

  // Submit mutation for real responses
  const submitMutation = useMutation({
    mutationFn: async () => {
      // Use teacher_id for beneficiaries, id for admins
      const userId = user?.teacher_id || user?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([question_id, answer_value]) => ({
        question_id,
        answer_value: typeof answer_value === 'object' ? JSON.stringify(answer_value) : String(answer_value),
      }));

      // Submit the response using the correct endpoint
      const submitResponse = await api.fetch(`/surveys/${surveyId}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          beneficiary_id: userId,
          training_id: 'preview-test',
          answers: formattedAnswers,
          time_spent_seconds: timeSpent,
        }),
      });

      return submitResponse;
    },
    onSuccess: (response) => {
      setSubmittedResponseId(response.id);
      setMode('results');
      toast({
        title: 'ជោគជ័យ',
        description: 'បានរក្សាទុកចម្លើយរបស់អ្នក ហើយអាចមើលលទ្ធផលក្នុងទំពោរ "មើលលទ្ធផល" បាន។',
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['survey-results', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
    onError: (error: any) => {
      toast({
        title: 'កំហុស',
        description: error.message || 'មិនអាចបញ្ជូនបាន',
        variant: 'destructive',
      });
    },
  });

  const calculateResults = () => {
    if (!isTest) return null;

    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let totalQuestions = 0;

    const questionResults = questions.map((question: any) => {
      const answer = answers[question.id];
      const hasAnswer = answer !== undefined && answer !== null && answer !== '';
      
      if (question.points) {
        totalPoints += question.points;
        totalQuestions++;

        let isCorrect = false;
        if (hasAnswer && question.correct_answer) {
          if (question.question_type === 'TRUE_FALSE') {
            isCorrect = answer === question.correct_answer;
          } else if (question.question_type === 'MULTIPLE_CHOICE') {
            isCorrect = answer === question.correct_answer;
          }
        }

        if (isCorrect) {
          earnedPoints += question.points;
          correctCount++;
        }

        return {
          question,
          answer,
          hasAnswer,
          isCorrect,
        };
      }
      return {
        question,
        answer,
        hasAnswer,
        isCorrect: null,
      };
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = survey?.passing_score ? percentage >= survey.passing_score : null;

    return {
      totalPoints,
      earnedPoints,
      correctCount,
      totalQuestions,
      percentage,
      passed,
      questionResults,
    };
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    const answer = answers[question.id];

    switch (question.question_type) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            <div className="space-y-2">
              {question.options_km.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`q-${question.id}-${index}`} />
                  <Label htmlFor={`q-${question.id}-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-2">
            {question.options_km.map((option, index) => {
              const selectedOptions = answer || [];
              const isChecked = selectedOptions.includes(index.toString());
              return (
                <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`q-${question.id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selectedOptions, index.toString()]
                        : selectedOptions.filter((s: string) => s !== index.toString());
                      handleAnswer(question.id, newSelected);
                    }}
                  />
                  <Label htmlFor={`q-${question.id}-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="true" id={`q-${question.id}-true`} />
                <Label htmlFor={`q-${question.id}-true`} className="flex-1 cursor-pointer">
                  ពិត (True)
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="false" id={`q-${question.id}-false`} />
                <Label htmlFor={`q-${question.id}-false`} className="flex-1 cursor-pointer">
                  មិនពិត (False)
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'LIKERT_SCALE':
      case 'RATING':
        const max = question.scale_max || 5;
        return (
          <RadioGroup value={answer || ''} onValueChange={(value) => handleAnswer(question.id, value)}>
            <div className="space-y-2">
              {Array.from({ length: max }, (_, i) => i + 1).map((value) => (
                <div key={value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={value.toString()} id={`q-${question.id}-${value}`} />
                  <Label htmlFor={`q-${question.id}-${value}`} className="flex-1 cursor-pointer">
                    {value} - {question.scale_labels_km?.[value - 1] || ''}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'SHORT_TEXT':
        return (
          <Input
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="វាយចម្លើយរបស់អ្នក..."
            className="mt-2"
          />
        );

      case 'LONG_TEXT':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="វាយចម្លើយរបស់អ្នក..."
            rows={6}
            className="mt-2"
          />
        );

      default:
        return null;
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <DialogTitle>មើលការស្ទង់មតិជាមុន</DialogTitle>
          </div>
          <DialogDescription>
            {survey?.title_km}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Intro Mode */}
            {mode === 'intro' && (
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{survey?.title_km}</h3>
                        <p className="text-sm text-muted-foreground">{survey?.title_en}</p>
                      </div>

                      {survey?.description_km && (
                        <div>
                          <p className="text-sm">{survey.description_km}</p>
                          {survey.description_en && (
                            <p className="text-xs text-muted-foreground mt-1">{survey.description_en}</p>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">ប្រភេទ</p>
                          <Badge variant="outline" className="text-xs">
                            {survey?.survey_type}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">សំណួរ</p>
                          <p className="text-sm text-muted-foreground">{questions.length} សំណួរ</p>
                        </div>
                        {isTest && (
                          <>
                            {survey?.passing_score && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium">ពិន្ទុជាប់</p>
                                <p className="text-sm text-muted-foreground">{survey.passing_score}%</p>
                              </div>
                            )}
                            {survey?.time_limit && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium">ពេលវេលា</p>
                                <p className="text-sm text-muted-foreground">{survey.time_limit} នាទី</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Response Toggle */}
                  <Alert className={saveResponses ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <AlertDescription>
                          {saveResponses ? (
                            <div className="space-y-2">
                              <p className="font-medium">📝 របៀបធ្វើតេស្តពិតប្រាកដ</p>
                              <p className="text-sm">ចម្លើយរបស់អ្នកនឹងត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធ ហើយអាចមើលលទ្ធផលពិតប្រាកដបាន។ នេះជាការធ្វើតេស្តពេញលេញដូចអ្នកប្រើប្រាស់ចុងក្រោយ។</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-medium">👁️ របៀបមើលជាមុនតែប៉ុណ្ណោះ</p>
                              <p className="text-sm">ចម្លើយរបស់អ្នកនឹងមិនត្រូវបានរក្សាទុកទេ។ នេះគ្រាន់តែសម្រាប់មើលរូបរាងនៃការស្ទង់មតិ។</p>
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="save-responses" className="text-base font-medium">
                            រក្សាទុកចម្លើយ (ធ្វើតេស្តពិតប្រាកដ)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            បើក: ធ្វើតេស្តពេញលេញដូចអ្នកប្រើប្រាស់ពិតប្រាកដ | បិទ: មើលជាមុនតែប៉ុណ្ណោះ
                          </p>
                        </div>
                        <Switch
                          id="save-responses"
                          checked={saveResponses}
                          onCheckedChange={setSaveResponses}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}

            {/* Taking Mode */}
            {mode === 'taking' && currentQuestion && (
              <>
                {/* Progress bar */}
                <div className="px-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      សំណួរទី {currentQuestionIndex + 1} ក្នុងចំណោម {questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        បានឆ្លើយ: {answeredCount}/{questions.length}
                      </span>
                      {timeSpent > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <ScrollArea className="flex-1 px-6">
                  <div className="py-6 space-y-6">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {currentQuestion.question_text_km}
                            {currentQuestion.is_required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {currentQuestion.question_text_en}
                          </p>
                        </div>
                        {currentQuestion.points && (
                          <Badge variant="outline" className="ml-4">
                            {currentQuestion.points} ពិន្ទុ
                          </Badge>
                        )}
                      </div>

                      {currentQuestion.help_text_km && (
                        <Alert className="mb-4">
                          <AlertDescription>{currentQuestion.help_text_km}</AlertDescription>
                        </Alert>
                      )}

                      {renderQuestionInput(currentQuestion)}

                      {showValidation && currentQuestion.is_required && !answers[currentQuestion.id] && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertDescription>
                            សំណួរនេះត្រូវការចម្លើយ
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Results Mode */}
            {mode === 'results' && (() => {
              const results = calculateResults();
              return (
                <ScrollArea className="flex-1 px-6">
                  <div className="py-6 space-y-6">
                    {saveResponses && submittedResponseId && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="text-center">
                          <p className="font-medium">✅ បានរក្សាទុកចម្លើយជោគជ័យ</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Response ID: {submittedResponseId}
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!saveResponses && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertDescription className="text-center">
                          <p className="font-medium">👁️ របៀបមើលជាមុន</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ចម្លើយមិនត្រូវបានរក្សាទុកទេ
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert className={results?.passed === true ? 'border-green-200 bg-green-50' : results?.passed === false ? 'border-red-200 bg-red-50' : ''}>
                      <AlertDescription className="text-center">
                        {isTest ? (
                          <>
                            {results?.passed === true && (
                              <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                                <p className="text-lg font-semibold">អបអរសាទរ! អ្នកបានជាប់</p>
                              </div>
                            )}
                            {results?.passed === false && (
                              <div className="flex flex-col items-center gap-2">
                                <XCircle className="h-12 w-12 text-red-600" />
                                <p className="text-lg font-semibold">សូមព្យាយាមម្តងទៀត</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-lg font-semibold">អរគុណសម្រាប់ការឆ្លើយ!</p>
                        )}
                      </AlertDescription>
                    </Alert>

                    {isTest && results && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-5xl font-bold text-primary mb-2">
                                {Math.round(results.percentage)}%
                              </div>
                              <Progress value={results.percentage} className="h-3 mb-4" />
                              <p className="text-sm text-muted-foreground">
                                {results.earnedPoints} / {results.totalPoints} ពិន្ទុ
                              </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold text-green-600">{results.correctCount}</p>
                                <p className="text-xs text-muted-foreground">ត្រឹមត្រូវ</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-red-600">
                                  {results.totalQuestions - results.correctCount}
                                </p>
                                <p className="text-xs text-muted-foreground">មិនត្រឹមត្រូវ</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-primary">{results.totalQuestions}</p>
                                <p className="text-xs text-muted-foreground">សរុប</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Question by question results for tests */}
                    {isTest && results && survey?.show_correct_answers && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">លទ្ធផលលម្អិត</h3>
                        {results.questionResults.map((result: any, index: number) => (
                          <Card key={result.question.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-sm">
                                    {index + 1}. {result.question.question_text_km}
                                  </p>
                                  {result.isCorrect !== null && (
                                    result.isCorrect ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    )
                                  )}
                                </div>
                                {result.hasAnswer && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">ចម្លើយរបស់អ្នក: </span>
                                    <span>{result.answer}</span>
                                  </div>
                                )}
                                {result.question.correct_answer && (
                                  <div className="text-sm text-green-700">
                                    <span className="font-medium">ចម្លើយត្រឹមត្រូវ: </span>
                                    <span>{result.question.correct_answer}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Non-test survey summary */}
                    {!isTest && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center space-y-2">
                            <p className="text-lg font-medium">បានឆ្លើយសំណួរ {answeredCount} ក្នុងចំណោម {questions.length}</p>
                            <p className="text-sm text-muted-foreground">
                              ពេលវេលាប្រើប្រាស់: {Math.floor(timeSpent / 60)} នាទី {timeSpent % 60} វិនាទី
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              );
            })()}

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t">
              {mode === 'intro' && (
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    បិទ
                  </Button>
                  <Button onClick={handleStartPreview}>
                    <Play className="mr-2 h-4 w-4" />
                    ចាប់ផ្តើមមើល
                  </Button>
                </div>
              )}

              {mode === 'taking' && (
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    ត្រឡប់
                  </Button>
                  <div className="flex gap-2">
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button 
                        onClick={handleFinish}
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            កំពុងបញ្ជូន...
                          </>
                        ) : (
                          'បញ្ចប់'
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>
                        បន្ទាប់
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {mode === 'results' && (
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    បិទ
                  </Button>
                  <Button onClick={handleRestart}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    ធ្វើម្តងទៀត
                  </Button>
                </div>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

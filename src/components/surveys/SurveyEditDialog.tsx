import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SURVEY_TYPES, QUESTION_TYPES } from '@/types/training';
import type { QuestionType } from '@/types/training';
import { Loader2, Trash2, Plus, Pencil, X, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SurveyEditDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurveyEditDialog({
  surveyId,
  open,
  onOpenChange,
}: SurveyEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<any>(null);

  const { data: survey } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => api.surveys.getById(surveyId),
    enabled: open,
  });

  const surveyType = watch('survey_type');
  const isTest =
    surveyType === 'PRE_TEST' ||
    surveyType === 'POST_TEST' ||
    surveyType === 'EVALUATION';

  useEffect(() => {
    if (survey && open) {
      setIsLoadingData(true);
      setValue('title_km', survey.title_km);
      setValue('title_en', survey.title_en);
      setValue('description_km', survey.description_km);
      setValue('survey_type', survey.survey_type);
      setValue('is_required', survey.is_required);
      setValue('is_active', survey.is_active);
      if (isTest) {
        setValue('passing_score', survey.passing_score);
        setValue('time_limit', survey.time_limit);
        setValue('allow_retake', survey.allow_retake);
        setValue('max_attempts', survey.max_attempts);
        setValue('show_correct_answers', survey.show_correct_answers);
      }
      setIsLoadingData(false);
    }
  }, [survey, open, setValue, isTest]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.surveys.update(surveyId, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពការស្ទង់មតិ' });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: { questionId: string; updates: any }) =>
      api.fetch(`/surveys/${surveyId}/questions/${data.questionId}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពសំណួរ' });
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      setEditingQuestionId(null);
      setEditedQuestion(null);
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) =>
      api.fetch(`/surveys/${surveyId}/questions/${questionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុបសំណួរ' });
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  const startEditingQuestion = (question: any) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({ ...question });
  };

  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditedQuestion(null);
  };

  const saveQuestion = () => {
    if (!editedQuestion) return;
    updateQuestionMutation.mutate({
      questionId: editedQuestion.id,
      updates: editedQuestion,
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបសំណួរនេះទេ?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const updateQuestionField = (field: string, value: any) => {
    setEditedQuestion((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateQuestionOption = (index: number, value: string, lang: 'km' | 'en') => {
    const optionsKey = lang === 'km' ? 'options_km' : 'options_en';
    setEditedQuestion((prev: any) => {
      const newOptions = [...(prev[optionsKey] || [])];
      newOptions[index] = value;
      return { ...prev, [optionsKey]: newOptions };
    });
  };

  const addQuestionOption = () => {
    setEditedQuestion((prev: any) => ({
      ...prev,
      options_km: [...(prev.options_km || []), ''],
      options_en: [...(prev.options_en || []), ''],
    }));
  };

  const removeQuestionOption = (index: number) => {
    setEditedQuestion((prev: any) => ({
      ...prev,
      options_km: prev.options_km.filter((_: any, i: number) => i !== index),
      options_en: prev.options_en.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>កែសម្រួលការស្ទង់មតិ</DialogTitle>
          <DialogDescription>
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិតនៃការស្ទង់មតិ
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="h-[calc(90vh-200px)] px-6">
              <div className="space-y-6 pb-4">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title_km">ចំណងជើង (ខ្មែរ) *</Label>
                    <Input id="title_km" {...register('title_km', { required: true })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title_en">Title (English) *</Label>
                    <Input id="title_en" {...register('title_en', { required: true })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description_km">ការពណ៌នា (ខ្មែរ)</Label>
                    <Textarea
                      id="description_km"
                      {...register('description_km')}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="survey_type">ប្រភេទ *</Label>
                    <Select
                      value={surveyType}
                      onValueChange={(value) => setValue('survey_type', value)}
                    >
                      <SelectTrigger id="survey_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SURVEY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label_km}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isTest && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="passing_score">ពិន្ទុជាប់ (%)</Label>
                        <Input
                          id="passing_score"
                          type="number"
                          min="0"
                          max="100"
                          {...register('passing_score')}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time_limit">ពេលវេលា (នាទី)</Label>
                        <Input
                          id="time_limit"
                          type="number"
                          min="1"
                          {...register('time_limit')}
                          placeholder="30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_attempts">ឯកតាព្យាយាម</Label>
                        <Input
                          id="max_attempts"
                          type="number"
                          min="1"
                          {...register('max_attempts')}
                          placeholder="3"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_required">តម្រូវឱ្យធ្វើ</Label>
                      <Switch
                        id="is_required"
                        onCheckedChange={(checked) =>
                          setValue('is_required', checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">សកម្ម</Label>
                      <Switch
                        id="is_active"
                        onCheckedChange={(checked) =>
                          setValue('is_active', checked)
                        }
                      />
                    </div>
                  </div>

                  {isTest && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="allow_retake">អនុញ្ញាតធ្វើម្តងទៀត</Label>
                          <Switch
                            id="allow_retake"
                            onCheckedChange={(checked) =>
                              setValue('allow_retake', checked)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show_correct_answers">
                            បង្ហាញចម្លើយត្រឹមត្រូវ
                          </Label>
                          <Switch
                            id="show_correct_answers"
                            onCheckedChange={(checked) =>
                              setValue('show_correct_answers', checked)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Questions Section */}
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium">សំណួរ ({survey?.questions?.length || 0})</h3>
                  {survey?.questions && survey.questions.length > 0 ? (
                    <div className="space-y-3">
                      {survey.questions.map((question: any, index: number) => {
                        const questionType = QUESTION_TYPES.find(
                          (t) => t.value === question.question_type
                        );
                        const isEditing = editingQuestionId === question.id;
                        const displayQuestion = isEditing ? editedQuestion : question;

                        return (
                          <Card key={question.id} className="bg-muted/50">
                            <CardContent className="pt-4 space-y-3">
                              {isEditing ? (
                                // Edit Mode
                                <>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="font-medium text-sm">កែសម្រួលសំណួរទី {index + 1}</p>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={cancelEditingQuestion}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={saveQuestion}
                                        disabled={updateQuestionMutation.isPending}
                                      >
                                        {updateQuestionMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <Label>សំណួរ (ខ្មែរ)</Label>
                                      <Textarea
                                        value={displayQuestion.question_text_km}
                                        onChange={(e) =>
                                          updateQuestionField('question_text_km', e.target.value)
                                        }
                                        rows={2}
                                      />
                                    </div>

                                    <div>
                                      <Label>Question (English)</Label>
                                      <Textarea
                                        value={displayQuestion.question_text_en}
                                        onChange={(e) =>
                                          updateQuestionField('question_text_en', e.target.value)
                                        }
                                        rows={2}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>ប្រភេទសំណួរ</Label>
                                        <Select
                                          value={displayQuestion.question_type}
                                          onValueChange={(value) =>
                                            updateQuestionField('question_type', value as QuestionType)
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {QUESTION_TYPES.map((type) => (
                                              <SelectItem key={type.value} value={type.value}>
                                                {type.label_km}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {isTest && (
                                        <div>
                                          <Label>ពិន្ទុ</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={displayQuestion.points || 1}
                                            onChange={(e) =>
                                              updateQuestionField('points', parseInt(e.target.value))
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <Label>តម្រូវឱ្យឆ្លើយ</Label>
                                      <Switch
                                        checked={displayQuestion.is_required}
                                        onCheckedChange={(checked) =>
                                          updateQuestionField('is_required', checked)
                                        }
                                      />
                                    </div>

                                    {/* Options for multiple choice */}
                                    {(displayQuestion.question_type === 'MULTIPLE_CHOICE' ||
                                      displayQuestion.question_type === 'MULTIPLE_SELECT') && (
                                      <div className="space-y-2">
                                        <Label>ជម្រើស</Label>
                                        {displayQuestion.options_km?.map((_: any, optIndex: number) => (
                                          <div key={optIndex} className="flex gap-2">
                                            <span className="flex items-center justify-center w-6 h-9 text-sm text-muted-foreground">
                                              {String.fromCharCode(65 + optIndex)}
                                            </span>
                                            <Input
                                              value={displayQuestion.options_km[optIndex]}
                                              onChange={(e) =>
                                                updateQuestionOption(optIndex, e.target.value, 'km')
                                              }
                                              placeholder="ជម្រើស (ខ្មែរ)"
                                            />
                                            <Input
                                              value={displayQuestion.options_en[optIndex]}
                                              onChange={(e) =>
                                                updateQuestionOption(optIndex, e.target.value, 'en')
                                              }
                                              placeholder="Option (English)"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeQuestionOption(optIndex)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={addQuestionOption}
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          បន្ថែមជម្រើស
                                        </Button>
                                      </div>
                                    )}

                                    {/* Correct answer for tests */}
                                    {isTest &&
                                      (displayQuestion.question_type === 'MULTIPLE_CHOICE' ||
                                        displayQuestion.question_type === 'TRUE_FALSE') && (
                                        <div>
                                          <Label>ចម្លើយត្រឹមត្រូវ</Label>
                                          <Select
                                            value={displayQuestion.correct_answer || ''}
                                            onValueChange={(value) =>
                                              updateQuestionField('correct_answer', value)
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="ជ្រើសរើសចម្លើយត្រឹមត្រូវ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {displayQuestion.question_type === 'TRUE_FALSE' ? (
                                                <>
                                                  <SelectItem value="true">ពិត</SelectItem>
                                                  <SelectItem value="false">មិនពិត</SelectItem>
                                                </>
                                              ) : (
                                                displayQuestion.options_km?.map((opt: string, idx: number) => (
                                                  <SelectItem key={idx} value={idx.toString()}>
                                                    {String.fromCharCode(65 + idx)}. {opt || `ជម្រើសទី ${idx + 1}`}
                                                  </SelectItem>
                                                ))
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                  </div>
                                </>
                              ) : (
                                // View Mode
                                <>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        សំណួរទី {index + 1}
                                      </p>
                                      <p className="text-sm">{question.question_text_km}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {question.question_text_en}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => startEditingQuestion(question)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteQuestion(question.id)}
                                        disabled={deleteQuestionMutation.isPending}
                                      >
                                        {deleteQuestionMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {questionType?.label_km}
                                    </Badge>
                                    {question.is_required && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-red-100 text-red-800"
                                      >
                                        តម្រូវ
                                      </Badge>
                                    )}
                                    {question.points && (
                                      <Badge variant="outline" className="text-xs">
                                        {question.points} ពិន្ទុ
                                      </Badge>
                                    )}
                                  </div>

                                  {question.options_km && question.options_km.length > 0 && (
                                    <div className="text-xs space-y-1 pl-3 border-l">
                                      <p className="font-medium">ជម្រើស:</p>
                                      {question.options_km.map(
                                        (option: string, idx: number) => (
                                          <p key={idx} className="text-muted-foreground">
                                            {String.fromCharCode(65 + idx)}. {option}
                                          </p>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {question.correct_answer && (
                                    <div className="bg-green-50 p-2 rounded text-xs">
                                      <p className="font-medium">ចម្លើយត្រឹមត្រូវ:</p>
                                      <p className="text-muted-foreground">
                                        {question.correct_answer}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">មិនមានសំណួរ</p>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                បោះបង់
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                រក្សាទុក
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

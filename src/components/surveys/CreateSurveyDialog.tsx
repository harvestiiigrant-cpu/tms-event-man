import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  DialogTrigger,
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
import type { SurveyType, QuestionType } from '@/types/training';
import { Plus, Trash2, Loader2, GripVertical, ClipboardList } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CreateSurveyDialogProps {
  children?: React.ReactNode;
}

interface QuestionFormData {
  tempId: string;
  question_text_en: string;
  question_text_km: string;
  question_type: QuestionType;
  is_required: boolean;
  points?: number;
  correct_answer?: string;
  options_en: string[];
  options_km: string[];
}

export function CreateSurveyDialog({ children }: CreateSurveyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);

  const surveyType = watch('survey_type');
  const isTest = surveyType === 'PRE_TEST' || surveyType === 'POST_TEST' || surveyType === 'EVALUATION';

  const createMutation = useMutation({
    mutationFn: (data: any) => api.surveys.create(data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតការស្ទង់មតិថ្មី' });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setOpen(false);
      setQuestions([]);
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const addQuestion = () => {
    const newQuestion: QuestionFormData = {
      tempId: Date.now().toString(),
      question_text_en: '',
      question_text_km: '',
      question_type: 'MULTIPLE_CHOICE',
      is_required: true,
      points: isTest ? 1 : undefined,
      options_en: ['', '', '', ''],
      options_km: ['', '', '', ''],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (tempId: string) => {
    setQuestions(questions.filter((q) => q.tempId !== tempId));
  };

  const updateQuestion = (tempId: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.tempId === tempId ? { ...q, [field]: value } : q
      )
    );
  };

  const updateQuestionOption = (tempId: string, index: number, lang: 'en' | 'km', value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.tempId !== tempId) return q;
        const optionsKey = lang === 'en' ? 'options_en' : 'options_km';
        const newOptions = [...q[optionsKey]];
        newOptions[index] = value;
        return { ...q, [optionsKey]: newOptions };
      })
    );
  };

  const onSubmit = (data: any) => {
    const surveyData = {
      ...data,
      questions: questions.map((q, index) => ({
        question_text_en: q.question_text_en,
        question_text_km: q.question_text_km,
        question_type: q.question_type,
        is_required: q.is_required,
        sort_order: index,
        points: q.points,
        correct_answer: q.correct_answer,
        options_en: q.options_en.filter((o) => o.trim()),
        options_km: q.options_km.filter((o) => o.trim()),
      })),
    };

    createMutation.mutate(surveyData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            បង្កើតការស្ទង់មតិ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>បង្កើតការស្ទង់មតិ ឬតេស្តថ្មី</DialogTitle>
          <DialogDescription>
            បំពេញព័ត៌មានខាងក្រោម ហើយបន្ថែមសំណួរ
          </DialogDescription>
        </DialogHeader>

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
                  <Textarea id="description_km" {...register('description_km')} rows={2} />
                </div>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="survey_type">ប្រភេទ *</Label>
                  <Select
                    onValueChange={(value) => setValue('survey_type', value)}
                    defaultValue="FEEDBACK"
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
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_required">តម្រូវឱ្យធ្វើ</Label>
                    <Switch
                      id="is_required"
                      onCheckedChange={(checked) => setValue('is_required', checked)}
                    />
                  </div>
                </div>

                {isTest && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow_retake">អនុញ្ញាតធ្វើម្តងទៀត</Label>
                      <Switch
                        id="allow_retake"
                        onCheckedChange={(checked) => setValue('allow_retake', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">សំណួរ ({questions.length})</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    បន្ថែមសំណួរ
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>មិនទាន់មានសំណួរ</p>
                    <p className="text-sm">ចុច "បន្ថែមសំណួរ" ដើម្បីចាប់ផ្តើម</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.tempId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">សំណួរទី {index + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(question.tempId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid gap-3">
                          <div className="space-y-2">
                            <Label>សំណួរ (ខ្មែរ)</Label>
                            <Input
                              value={question.question_text_km}
                              onChange={(e) =>
                                updateQuestion(question.tempId, 'question_text_km', e.target.value)
                              }
                              placeholder="វាយសំណួររបស់អ្នក..."
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>ប្រភេទសំណួរ</Label>
                              <Select
                                value={question.question_type}
                                onValueChange={(value) =>
                                  updateQuestion(question.tempId, 'question_type', value)
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
                              <div className="space-y-2">
                                <Label>ពិន្ទុ</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={question.points || 1}
                                  onChange={(e) =>
                                    updateQuestion(question.tempId, 'points', parseInt(e.target.value))
                                  }
                                />
                              </div>
                            )}
                          </div>

                          {/* Options for multiple choice */}
                          {(question.question_type === 'MULTIPLE_CHOICE' ||
                            question.question_type === 'MULTIPLE_SELECT') && (
                            <div className="space-y-2">
                              <Label>ជម្រើស</Label>
                              {question.options_km.map((_, optIndex) => (
                                <div key={optIndex} className="flex gap-2">
                                  <span className="flex items-center justify-center w-6 h-9 text-sm text-muted-foreground">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <Input
                                    value={question.options_km[optIndex]}
                                    onChange={(e) =>
                                      updateQuestionOption(question.tempId, optIndex, 'km', e.target.value)
                                    }
                                    placeholder={`ជម្រើសទី ${optIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Correct answer for tests */}
                          {isTest &&
                            (question.question_type === 'MULTIPLE_CHOICE' ||
                              question.question_type === 'TRUE_FALSE') && (
                              <div className="space-y-2">
                                <Label>ចម្លើយត្រឹមត្រូវ</Label>
                                <Select
                                  value={question.correct_answer || ''}
                                  onValueChange={(value) =>
                                    updateQuestion(question.tempId, 'correct_answer', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="ជ្រើសរើសចម្លើយត្រឹមត្រូវ" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {question.question_type === 'TRUE_FALSE' ? (
                                      <>
                                        <SelectItem value="true">ពិត</SelectItem>
                                        <SelectItem value="false">មិនពិត</SelectItem>
                                      </>
                                    ) : (
                                      question.options_km.map((opt, idx) => (
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={createMutation.isPending || questions.length === 0}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              បង្កើត
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

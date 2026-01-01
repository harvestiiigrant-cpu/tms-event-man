import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SURVEY_TYPES, QUESTION_TYPES } from '@/types/training';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SurveyDetailDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurveyDetailDialog({
  surveyId,
  open,
  onOpenChange,
}: SurveyDetailDialogProps) {
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => api.surveys.getById(surveyId),
    enabled: open,
  });

  if (!survey) {
    return null;
  }

  const surveyType = SURVEY_TYPES.find((t) => t.value === survey.survey_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{survey.title_km}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{survey.title_en}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(90vh-150px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Survey Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>{surveyType?.label_km}</Badge>
                  {survey.is_active ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      សកម្ម
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      អសកម្ម
                    </Badge>
                  )}
                </div>
                {survey.description_km && (
                  <p className="text-sm text-muted-foreground">{survey.description_km}</p>
                )}
              </div>

              {/* Survey Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ការកំណត់</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">តម្រូវឱ្យធ្វើ</p>
                      <p className="text-sm text-muted-foreground">
                        {survey.is_required ? 'ដា' : 'ទេ'}
                      </p>
                    </div>
                    {(survey.survey_type === 'PRE_TEST' ||
                      survey.survey_type === 'POST_TEST' ||
                      survey.survey_type === 'EVALUATION') && (
                      <>
                        <div>
                          <p className="text-sm font-medium">ពិន្ទុជាប់</p>
                          <p className="text-sm text-muted-foreground">
                            {survey.passing_score || '-'} %
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ពេលវេលា</p>
                          <p className="text-sm text-muted-foreground">
                            {survey.time_limit ? `${survey.time_limit} នាទី` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ព្យាយាម</p>
                          <p className="text-sm text-muted-foreground">
                            {survey.max_attempts
                              ? `អតិបរមា ${survey.max_attempts}`
                              : 'គ្មានកំរិត'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <div className="space-y-3">
                <h3 className="font-medium">
                  សំណួរ ({survey._count?.questions || 0})
                </h3>
                {survey._count?.questions === 0 ? (
                  <p className="text-sm text-muted-foreground">មិនមានសំណួរ</p>
                ) : (
                  <div className="space-y-4">
                    {survey.questions?.map((question: any, index: number) => {
                      const questionType = QUESTION_TYPES.find(
                        (t) => t.value === question.question_type
                      );
                      return (
                        <Card key={question.id} className="bg-muted/50">
                          <CardContent className="pt-4 space-y-3">
                            <div>
                              <p className="font-medium text-sm">សំណួរទី {index + 1}</p>
                              <p className="text-sm">{question.question_text_km}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {question.question_text_en}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {questionType?.label_km}
                              </Badge>
                              {question.is_required && (
                                <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                  តម្រូវ
                                </Badge>
                              )}
                            </div>

                            {question.options_km && question.options_km.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium">ជម្រើស:</p>
                                <div className="pl-4 space-y-1">
                                  {question.options_km.map(
                                    (option: string, idx: number) => (
                                      <p
                                        key={idx}
                                        className="text-sm text-muted-foreground"
                                      >
                                        {String.fromCharCode(65 + idx)}. {option}
                                      </p>
                                    )
                                  )}
                                </div>
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Statistics */}
              {(survey._count?.responses || 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ស្ថិតិ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">ចម្លើយសរុប</p>
                      <p className="text-lg font-semibold">
                        {survey._count?.responses || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            បិទ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

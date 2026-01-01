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
import { Loader2, BarChart3, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

interface SurveyResultsDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export function SurveyResultsDialog({
  surveyId,
  open,
  onOpenChange,
}: SurveyResultsDialogProps) {
  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => api.surveys.getById(surveyId),
    enabled: open,
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['survey-results', surveyId],
    queryFn: () => api.surveys.getResponses(surveyId),
    enabled: open && !!survey,
  });

  const isLoading = surveyLoading || resultsLoading;

  // Export to Excel
  const handleExport = () => {
    if (!results || !survey) return;

    const exportData = results.map((response: any, index: number) => {
      const row: any = {
        '#': index + 1,
        'Beneficiary ID': response.beneficiary_id,
        'Beneficiary Name': response.beneficiary?.name || 'Unknown',
        'Training ID': response.training_id,
        'Submitted At': new Date(response.submitted_at).toLocaleString(),
        'Time Spent (seconds)': response.time_spent_seconds || 0,
      };

      // Add test scores if applicable
      if (response.total_score !== null) {
        row['Total Score'] = response.total_score;
        row['Max Score'] = response.max_score;
        row['Percentage'] = response.percentage + '%';
        row['Passed'] = response.passed ? 'Yes' : 'No';
      }

      // Add each question's answer
      survey.questions?.forEach((question: any, qIndex: number) => {
        const qResponse = response.question_responses?.find(
          (qr: any) => qr.question_id === question.id
        );
        
        let answerText = qResponse?.answer_value || '';
        
        // Convert option index to actual text
        if (qResponse?.answer_value) {
          if (question.question_type === 'MULTIPLE_CHOICE') {
            const optionIndex = parseInt(qResponse.answer_value);
            if (!isNaN(optionIndex) && question.options_km[optionIndex]) {
              answerText = question.options_km[optionIndex];
            }
          } else if (question.question_type === 'MULTIPLE_SELECT') {
            try {
              const selectedIndices = JSON.parse(qResponse.answer_value);
              if (Array.isArray(selectedIndices)) {
                answerText = selectedIndices
                  .map((idxStr: string) => {
                    const index = parseInt(idxStr);
                    return question.options_km[index] || idxStr;
                  })
                  .join(', ');
              }
            } catch (e) {
              // Keep original value if parsing fails
            }
          } else if (question.question_type === 'TRUE_FALSE') {
            answerText = qResponse.answer_value === 'true' ? 'ពិត' : 'មិនពិត';
          } else if (question.question_type === 'RATING' || question.question_type === 'LIKERT_SCALE') {
            const rating = parseInt(qResponse.answer_value);
            if (!isNaN(rating)) {
              const label = question.scale_labels_km?.[rating - 1] || '';
              answerText = `${rating}${label ? ` - ${label}` : ''}`;
            }
          }
          // For SHORT_TEXT, LONG_TEXT, etc., answerText is already the actual text
        }
        
        row[`Q${qIndex + 1}: ${question.question_text_km}`] = answerText;
        
        if (qResponse?.is_correct !== null) {
          row[`Q${qIndex + 1} Correct`] = qResponse.is_correct ? 'Yes' : 'No';
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Responses');
    XLSX.writeFile(workbook, `Survey_${survey.title_en}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!survey) {
    return null;
  }

  const totalResponses = survey._count?.responses || 0;

  // Calculate statistics for each question
  const questionStats = survey.questions?.map((question: any) => {
    if (!question.options_km || question.options_km.length === 0) {
      return {
        question_id: question.id,
        question_text: question.question_text_km,
        question_type: question.question_type,
        responses: 0,
      };
    }

    const optionCounts = new Array(question.options_km.length).fill(0);
    let correctCount = 0;

    // Count responses for each option
    results?.forEach((response: any) => {
      response.question_responses?.forEach((qr: any) => {
        if (qr.question_id === question.id) {
          if (qr.answer_value) {
            const answer = parseInt(qr.answer_value);
            if (!isNaN(answer) && answer >= 0 && answer < optionCounts.length) {
              optionCounts[answer]++;
            }
          }
          if (
            question.correct_answer &&
            qr.answer_value === question.correct_answer.toString()
          ) {
            correctCount++;
          }
        }
      });
    });

    const chartData = question.options_km.map((option: string, idx: number) => ({
      name: option,
      count: optionCounts[idx],
      percentage: totalResponses > 0 ? ((optionCounts[idx] / totalResponses) * 100).toFixed(1) : 0,
    }));

    return {
      question_id: question.id,
      question_text: question.question_text_km,
      question_type: question.question_type,
      options: question.options_km,
      total_responses: totalResponses,
      correct_count: correctCount,
      chart_data: chartData,
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>ឯកសារលទ្ធផល</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{survey.title_km}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(90vh-150px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Overall Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    ស្ថិតិរួម
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">សរុប</p>
                      <p className="text-2xl font-semibold">{totalResponses}</p>
                    </div>
                    {survey.survey_type === 'PRE_TEST' ||
                    survey.survey_type === 'POST_TEST' ||
                    survey.survey_type === 'EVALUATION' ? (
                      <>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">បានឆ្លង</p>
                          <p className="text-2xl font-semibold text-green-600">
                            {results?.filter(
                              (r: any) => r.total_score >= survey.passing_score
                            ).length || 0}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">មិនឆ្លង</p>
                          <p className="text-2xl font-semibold text-red-600">
                            {results?.filter(
                              (r: any) => r.total_score < survey.passing_score
                            ).length || 0}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Question-wise Analysis */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">ការវិភាគលម្អិតលម្អិត</h3>
                {questionStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">គ្មានលទ្ធផល</p>
                ) : (
                  questionStats.map((stat: any, index: number) => (
                    <Card key={stat.question_id}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          សំណួរទី {index + 1}: {stat.question_text}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {stat.chart_data && stat.chart_data.length > 0 && (
                          <>
                            {/* Bar Chart */}
                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stat.chart_data}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Statistics Table */}
                            <div className="space-y-2">
                              {stat.chart_data.map(
                                (option: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 border rounded"
                                  >
                                    <span className="text-sm">
                                      {String.fromCharCode(65 + idx)}. {option.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {option.count}
                                      </span>
                                      <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full"
                                          style={{
                                            width: `${option.percentage}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground w-12 text-right">
                                        {option.percentage}%
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        )}

                        {stat.correct_count !== undefined && (
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm font-medium">ចម្លើយត្រឹមត្រូវ</p>
                            <p className="text-lg font-semibold text-green-700">
                              {stat.correct_count} /{' '}
                              {stat.total_responses}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Individual Responses */}
              {results && results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ចម្លើយក្នុងលម្អិត</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.map((response: any, idx: number) => (
                      <Card key={idx} className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                អ្នកឆ្លើយទី {idx + 1}: {response.beneficiary?.name || response.beneficiary_id}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                បានបញ្ជូននៅ: {new Date(response.submitted_at).toLocaleString('km-KH')}
                              </p>
                              {response.time_spent_seconds && (
                                <p className="text-xs text-muted-foreground">
                                  ពេលវេលាប្រើប្រាស់: {Math.floor(response.time_spent_seconds / 60)} នាទី {response.time_spent_seconds % 60} វិនាទី
                                </p>
                              )}
                            </div>
                            {(survey.survey_type === 'PRE_TEST' ||
                              survey.survey_type === 'POST_TEST' ||
                              survey.survey_type === 'EVALUATION') && response.percentage !== null && (
                              <div className="text-right">
                                <Badge
                                  variant={response.passed ? 'default' : 'destructive'}
                                  className="text-base px-3 py-1"
                                >
                                  {Math.round(response.percentage)}%
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {response.total_score}/{response.max_score} ពិន្ទុ
                                </p>
                                <p className="text-xs font-medium mt-1">
                                  {response.passed ? '✅ ជាប់' : '❌ ធ្លាក់'}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {survey.questions?.map((question: any, qIdx: number) => {
                            const qResponse = response.question_responses?.find(
                              (qr: any) => qr.question_id === question.id
                            );
                            
                            let answerDisplay = qResponse?.answer_value || '-';
                            
                            // Convert answer to readable format
                            if (qResponse?.answer_value) {
                              if (question.question_type === 'MULTIPLE_CHOICE') {
                                const optionIndex = parseInt(qResponse.answer_value);
                                if (!isNaN(optionIndex) && question.options_km[optionIndex]) {
                                  answerDisplay = `${String.fromCharCode(65 + optionIndex)}. ${question.options_km[optionIndex]}`;
                                }
                              } else if (question.question_type === 'MULTIPLE_SELECT') {
                                try {
                                  const selectedIndices = JSON.parse(qResponse.answer_value);
                                  if (Array.isArray(selectedIndices)) {
                                    answerDisplay = selectedIndices
                                      .map((idxStr: string) => {
                                        const index = parseInt(idxStr);
                                        return question.options_km[index] 
                                          ? `${String.fromCharCode(65 + index)}. ${question.options_km[index]}`
                                          : idxStr;
                                      })
                                      .join(', ');
                                  }
                                } catch (e) {
                                  // Keep original value if parsing fails
                                }
                              } else if (question.question_type === 'TRUE_FALSE') {
                                answerDisplay = qResponse.answer_value === 'true' ? 'ពិត (True)' : 'មិនពិត (False)';
                              } else if (question.question_type === 'RATING' || question.question_type === 'LIKERT_SCALE') {
                                const rating = parseInt(qResponse.answer_value);
                                if (!isNaN(rating)) {
                                  const label = question.scale_labels_km?.[rating - 1] || '';
                                  answerDisplay = `${rating}${label ? ` - ${label}` : ''}`;
                                }
                              }
                            }
                            
                            return (
                              <div key={question.id} className="border-l-2 border-primary/20 pl-3 py-2">
                                <p className="text-sm font-medium mb-1">
                                  សំណួរទី {qIdx + 1}: {question.question_text_km}
                                </p>
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-muted-foreground flex-1">
                                    <span className="font-medium">ចម្លើយ: </span>
                                    {answerDisplay}
                                  </p>
                                  {qResponse?.is_correct !== null && qResponse?.is_correct !== undefined && (
                                    <Badge 
                                      variant={qResponse.is_correct ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {qResponse.is_correct ? '✓ ត្រឹមត្រូវ' : '✗ មិនត្រឹមត្រូវ'}
                                    </Badge>
                                  )}
                                </div>
                                {qResponse?.points_earned !== null && qResponse?.points_earned !== undefined && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ពិន្ទុទទួលបាន: {qResponse.points_earned}/{question.points}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 border-t flex gap-2">
          <Button 
            onClick={handleExport} 
            variant="outline"
            disabled={!results || results.length === 0}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            នាំចេញទិន្នន័យ (Excel)
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            បិទ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

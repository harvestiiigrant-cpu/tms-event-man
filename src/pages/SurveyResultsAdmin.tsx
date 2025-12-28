import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

interface SurveyResult {
  total_responses: number;
  average_score: number;
  pass_rate: number;
  responses: any[];
}

interface QuestionResponse {
  question_id: string;
  answer_value: string;
  answer_text?: string;
  points_earned?: number;
  is_correct?: boolean;
}

interface Question {
  id: string;
  question_text_km: string;
  question_text_en: string;
  question_type: string;
  options_km?: string[];
  options_en?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels_km?: string[];
  scale_labels_en?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function SurveyResultsAdmin() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const trainingId = searchParams.get('training_id');
  const navigate = useNavigate();
  const [selectedTraining, setSelectedTraining] = useState<string>(trainingId || 'all');

  // Fetch survey details
  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => api.surveys.getById(surveyId!),
    enabled: !!surveyId,
  });

  // Fetch results
  const { data: result, isLoading: resultsLoading } = useQuery<SurveyResult>({
    queryKey: ['survey-results', surveyId, selectedTraining],
    queryFn: () => api.surveys.getResults(surveyId!, selectedTraining !== 'all' ? selectedTraining : undefined),
    enabled: !!surveyId,
  });

  // Extract unique training IDs from responses for filter
  const trainingOptions = useMemo(() => {
    if (!result?.responses) return [];
    const trainingMap = new Map<string, string>();
    result.responses.forEach((response: any) => {
      if (response.training_id && !trainingMap.has(response.training_id)) {
        trainingMap.set(response.training_id, response.training_id);
      }
    });
    return Array.from(trainingMap.entries()).map(([id, _]) => ({ id, name: id }));
  }, [result]);

  const isLoading = surveyLoading || resultsLoading;

  // Process question analytics
  const questionAnalytics = useMemo(() => {
    if (!result?.responses || !survey?.questions) return [];

    return survey.questions.map((question: Question) => {
      const responses = result.responses
        .map((r: any) => r.question_responses?.find((qr: QuestionResponse) => qr.question_id === question.id))
        .filter(Boolean);

      const totalResponses = responses.length;
      const correctCount = responses.filter((r: QuestionResponse) => r.is_correct === true).length;
      const avgScore = responses.length > 0
        ? responses.reduce((sum: number, r: QuestionResponse) => sum + (r.points_earned || 0), 0) / responses.length
        : 0;

      // For multiple choice, count option distributions
      const optionCounts: Record<number, number> = {};
      responses.forEach((r: QuestionResponse) => {
        const optionIndex = parseInt(r.answer_value);
        if (!isNaN(optionIndex)) {
          optionCounts[optionIndex] = (optionCounts[optionIndex] || 0) + 1;
        }
      });

      const optionData = Object.entries(optionCounts).map(([index, count]) => ({
        name: question.options_km?.[parseInt(index)] || `Option ${parseInt(index) + 1}`,
        value: count,
        percent: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : 0,
      }));

      // For rating/likert scales
      const ratingCounts: Record<number, number> = {};
      responses.forEach((r: QuestionResponse) => {
        const rating = parseInt(r.answer_value);
        if (!isNaN(rating)) {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        }
      });

      const ratingData = Object.entries(ratingCounts).map(([value, count]) => ({
        rating: parseInt(value),
        count,
        percent: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : 0,
      })).sort((a, b) => a.rating - b.rating);

      return {
        question,
        totalResponses,
        correctCount,
        correctRate: totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0,
        avgScore,
        optionData,
        ratingData,
        textResponses: responses
          .filter((r: QuestionResponse) => ['SHORT_TEXT', 'LONG_TEXT'].includes(question.question_type))
          .map((r: QuestionResponse) => r.answer_text || r.answer_value),
      };
    });
  }, [result, survey]);

  // Time trend data (for tests with multiple attempts over time)
  const timeTrendData = useMemo(() => {
    if (!result?.responses) return [];

    const trendMap = new Map<string, { date: string; avgScore: number; count: number }>();

    result.responses.forEach((response: any) => {
      const date = format(new Date(response.submitted_at), 'MMM d');
      const existing = trendMap.get(date) || { date, avgScore: 0, count: 0 };
      existing.avgScore = (existing.avgScore * existing.count + (response.percentage || 0)) / (existing.count + 1);
      existing.count++;
      trendMap.set(date, existing);
    });

    return Array.from(trendMap.values());
  }, [result]);

  // Training distribution for pass/fail
  const passFailData = useMemo(() => {
    if (!result?.responses) return [];

    const passed = result.responses.filter((r: any) => r.passed === true).length;
    const failed = result.responses.filter((r: any) => r.passed === false).length;
    const notGraded = result.responses.filter((r: any) => r.passed === null).length;

    return [
      { name: 'ជាប់', value: passed, color: '#22c55e' },
      { name: 'ធ្លាក់', value: failed, color: '#ef4444' },
      { name: 'មិនចាត់ថ្នាក់', value: notGraded, color: '#94a3b8' },
    ].filter(d => d.value > 0);
  }, [result]);

  const handleExport = () => {
    if (!result || !survey) return;

    // Create CSV content
    const headers = ['Beneficiary Name', 'Date', 'Score', 'Percentage', 'Status'];
    const rows = result.responses.map((response: any) => [
      response.beneficiary?.name || 'N/A',
      response.submitted_at ? format(new Date(response.submitted_at), 'yyyy-MM-dd HH:mm') : 'N/A',
      response.total_score !== null ? `${response.total_score}/${response.max_score}` : 'N/A',
      response.percentage !== null ? `${response.percentage.toFixed(1)}%` : 'N/A',
      response.passed === true ? 'Passed' : response.passed === false ? 'Failed' : 'N/A',
    ]);

    const csvContent = [
      `Survey: ${survey.title_km} (${survey.title_en})`,
      `Total Responses: ${result.total_responses}`,
      `Average Score: ${result.average_score.toFixed(1)}%`,
      `Pass Rate: ${result.pass_rate.toFixed(1)}%`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey-results-${surveyId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="លទ្ធផលការស្ទង់មតិ" subtitle="កំពុងផ្ទុក...">
        <div className="flex items-center justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!survey) {
    return (
      <DashboardLayout title="លទ្ធផលការស្ទង់មតិ" subtitle="រកមិនឃើញ">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">រកមិនឃើញការស្ទង់មតិ</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="លទ្ធផលការស្ទង់មតិ"
      subtitle={survey.title_km}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Button variant="ghost" onClick={() => navigate('/surveys')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ទៅការស្ទង់មតិ
          </Button>

          <div className="flex gap-2 items-center">
            {trainingOptions.length > 0 && (
              <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="ជ្រើសរើសការបណ្តុះបណ្តាល" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ការបណ្តុះបណ្តាលទាំងអស់</SelectItem>
                  {trainingOptions.map((training: any) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              ទាញយក
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ចំនួនចម្លើយ</p>
                  <p className="text-2xl font-bold">{result?.total_responses || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ពិន្ទុមធ្យម</p>
                  <p className="text-2xl font-bold">{(result?.average_score || 0).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">អត្រាជាប់</p>
                  <p className="text-2xl font-bold">{(result?.pass_rate || 0).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">សំណួរ</p>
                  <p className="text-2xl font-bold">{survey.questions?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pass/Fail Chart */}
        {passFailData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ស្ថានភាពជាប់/ធ្លាក់</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {passFailData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  {passFailData.map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="flex-1">{item.name}</span>
                      <span className="font-bold">{item.value}</span>
                      <span className="text-muted-foreground text-sm">
                        ({result?.total_responses ? ((item.value / result.total_responses) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Trend (if available) */}
        {timeTrendData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>ទំនោរពេលវេលា</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      name="Average Score (%)"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question-by-Question Analysis */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">វិភាគសំណួរម្តងម្កាល</h2>

          {questionAnalytics.map((qa, index) => (
            <Card key={qa.question.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  សំណួរទី {index + 1}: {qa.question.question_text_km}
                </CardTitle>
                {qa.question.question_text_en && (
                  <p className="text-sm text-muted-foreground">{qa.question.question_text_en}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{qa.totalResponses}</p>
                    <p className="text-xs text-muted-foreground">ចំនួនឆ្លើយ</p>
                  </div>
                  {qa.question.question_type === 'TRUE_FALSE' && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{qa.correctRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">អត្រាត្រឹមត្រូវ</p>
                    </div>
                  )}
                  {['LIKERT_SCALE', 'RATING'].includes(qa.question.question_type) && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {qa.ratingData.length > 0
                          ? (qa.ratingData.reduce((sum, r) => sum + r.rating * r.count, 0) / qa.totalResponses).toFixed(1)
                          : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">មធ្យម Rating</p>
                    </div>
                  )}
                </div>

                {/* Charts based on question type */}
                {['MULTIPLE_CHOICE', 'MULTIPLE_SELECT'].includes(qa.question.question_type) && qa.optionData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qa.optionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Responses">
                          {qa.optionData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {['LIKERT_SCALE', 'RATING'].includes(qa.question.question_type) && qa.ratingData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qa.ratingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Responses" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {['TRUE_FALSE'].includes(qa.question.question_type) && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qa.optionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Responses">
                          {qa.optionData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Text responses */}
                {['SHORT_TEXT', 'LONG_TEXT'].includes(qa.question.question_type) && qa.textResponses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">ចម្លើយអត្ថបទ:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {qa.textResponses.slice(0, 10).map((text, i) => (
                        <p key={i} className="text-sm p-2 bg-muted/50 rounded">
                          {text || '(Empty)'}
                        </p>
                      ))}
                      {qa.textResponses.length > 10 && (
                        <p className="text-sm text-muted-foreground">
                          +{qa.textResponses.length - 10} more responses...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Individual Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>ប្រវត្តិចម្លើយ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>អ្នកចូលរួម</TableHead>
                    <TableHead>កាលបរិច្ឆេទ</TableHead>
                    <TableHead>ពិន្ទុ</TableHead>
                    <TableHead>ភាគរយ</TableHead>
                    <TableHead>ស្ថានភាព</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result?.responses?.map((response: any) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{response.beneficiary?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{response.beneficiary?.teacher_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.submitted_at
                          ? format(new Date(response.submitted_at), 'MMM d, yyyy - HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {response.total_score !== null
                          ? `${response.total_score}/${response.max_score}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {response.percentage !== null
                          ? `${response.percentage.toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {response.passed === true ? (
                          <Badge className="bg-green-100 text-green-800">ជាប់</Badge>
                        ) : response.passed === false ? (
                          <Badge className="bg-red-100 text-red-800">ធ្លាក់</Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

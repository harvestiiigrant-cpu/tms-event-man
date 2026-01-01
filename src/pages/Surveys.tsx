import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { SURVEY_TYPES } from '@/types/training';
import type { Survey, SurveyType } from '@/types/training';
import { CreateSurveyDialog } from '@/components/surveys/CreateSurveyDialog';
import { SurveyDetailDialog } from '@/components/surveys/SurveyDetailDialog';
import { SurveyEditDialog } from '@/components/surveys/SurveyEditDialog';
import { SurveyResultsDialog } from '@/components/surveys/SurveyResultsDialog';
import { SurveyPreviewDialog } from '@/components/surveys/SurveyPreviewDialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  BarChart3,
  FileText,
  PlayCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getSurveyTypeBadge = (type: SurveyType) => {
  const config = SURVEY_TYPES.find((t) => t.value === type);
  const colors = {
    PRE_TEST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    POST_TEST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FEEDBACK: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    EVALUATION: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    COMMON_TEST: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Badge variant="outline" className={colors[type]}>
      {config?.label_km}
    </Badge>
  );
};

export default function Surveys() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');

  // Fetch surveys
  const { data: surveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ['surveys', typeFilter, searchQuery],
    queryFn: () =>
      api.surveys.getAll({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.surveys.delete(id),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុបការស្ទង់មតិ' });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបការស្ទង់មតិនេះទេ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout title="ការស្ទង់មតិ និងតេស្ត" subtitle="គ្រប់គ្រងការស្ទង់មតិ និងការធ្វើតេស្ត">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ការស្ទង់មតិ និងតេស្តទាំងអស់</CardTitle>
          <CreateSurveyDialog />
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកការស្ទង់មតិ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="ប្រភេទ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                {SURVEY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label_km}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ចំណងជើង</TableHead>
                  <TableHead>ប្រភេទ</TableHead>
                  <TableHead>សំណួរ</TableHead>
                  <TableHead>ចម្លើយ</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-lg font-medium">រកមិនឃើញការស្ទង់មតិ</p>
                      <p className="text-sm text-muted-foreground">
                        បង្កើតការស្ទង់មតិថ្មីដើម្បីចាប់ផ្តើម
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{survey.title_km}</p>
                          <p className="text-xs text-muted-foreground">{survey.title_en}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getSurveyTypeBadge(survey.survey_type)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {survey._count?.questions || 0} សំណួរ
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {survey._count?.responses || 0} ចម្លើយ
                        </span>
                      </TableCell>
                      <TableCell>
                        {survey.is_active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            សកម្ម
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            អសកម្ម
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>សកម្មភាព</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              មើលព័ត៌មានលម្អិត
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                setPreviewOpen(true);
                              }}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              មើលជាមុន & ធ្វើតេស្ត
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                setEditOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              កែសម្រួល
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                setResultsOpen(true);
                              }}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" />
                              មើលលទ្ធផល
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(survey.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              លុប
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedSurveyId && (
        <SurveyDetailDialog
          surveyId={selectedSurveyId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      {/* Edit Dialog */}
      {selectedSurveyId && (
        <SurveyEditDialog
          surveyId={selectedSurveyId}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {/* Results Dialog */}
      {selectedSurveyId && (
        <SurveyResultsDialog
          surveyId={selectedSurveyId}
          open={resultsOpen}
          onOpenChange={setResultsOpen}
        />
      )}

      {/* Preview Dialog */}
      {selectedSurveyId && (
        <SurveyPreviewDialog
          surveyId={selectedSurveyId}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </DashboardLayout>
  );
}

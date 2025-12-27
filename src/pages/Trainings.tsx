import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { TrainingStatusBadge } from '@/components/trainings/TrainingStatusBadge';
import { TrainingLevelBadge } from '@/components/trainings/TrainingLevelBadge';
import { CreateTrainingDialog } from '@/components/trainings/CreateTrainingDialog';
import { CascadeTrainingDialog } from '@/components/trainings/CascadeTrainingDialog';
import { ShareEnrollmentLink } from '@/components/trainings/ShareEnrollmentLink';
import { TrainingQRCode } from '@/components/trainings/TrainingQRCode';
import { TrainingDetailsDialog } from '@/components/trainings/TrainingDetailsDialog';
import { EditTrainingDialog } from '@/components/trainings/EditTrainingDialog';
import { ManageParticipantsDialog } from '@/components/trainings/ManageParticipantsDialog';
import { ViewAttendanceDialog } from '@/components/trainings/ViewAttendanceDialog';
import { CancelTrainingDialog } from '@/components/trainings/CancelTrainingDialog';
import { ManageAgendaDialog } from '@/components/trainings/ManageAgendaDialog';
import { AttachMaterialsDialog } from '@/components/trainings/AttachMaterialsDialog';
import { AttendanceGridDialog } from '@/components/trainings/AttendanceGridDialog';
import { SmartPagination } from '@/components/ui/smart-pagination';
import { BulkActionToolbar } from '@/components/ui/bulk-action-toolbar';
import { useSelection } from '@/hooks/use-selection';
import { toast } from '@/hooks/use-toast';
import { TRAINING_CATEGORIES, TRAINING_LEVELS } from '@/types/training';
import type { Training } from '@/types/training';
import {
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  Link2,
  QrCode,
  Eye,
  Pencil,
  ClipboardList,
  XCircle,
  GraduationCap,
  ListTodo,
  FileText,
  Grid3x3,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { exportTrainingParticipants } from '@/utils/exportTrainingParticipants';

export default function Trainings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch trainings from API
  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
  });

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training: Training) => {
      const matchesSearch =
        training.training_name_english
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        training.training_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        training.training_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || training.training_status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' || training.training_category === categoryFilter;

      const matchesLevel =
        levelFilter === 'all' || training.training_level === levelFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesLevel;
    });
  }, [trainings, searchQuery, statusFilter, categoryFilter, levelFilter]);

  // Pagination
  const totalItems = filteredTrainings.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTrainings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrainings.slice(start, start + pageSize);
  }, [filteredTrainings, page, pageSize]);

  // Selection hook for bulk operations
  const selection = useSelection<Training>(paginatedTrainings);

  // Update training mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Training> }) =>
      api.trainings.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['trainings'] });
      const previousTrainings = queryClient.getQueryData<Training[]>(['trainings']);
      queryClient.setQueryData<Training[]>(['trainings'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t)) || []
      );
      return { previousTrainings };
    },
    onError: (err, variables, context) => {
      if (context?.previousTrainings) {
        queryClient.setQueryData(['trainings'], context.previousTrainings);
      }
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'ជោគជ័យ',
        description: 'បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });

  // Bulk delete mutation with optimistic update
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.trainings.bulkDelete(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['trainings'] });
      const previousTrainings = queryClient.getQueryData<Training[]>(['trainings']);
      queryClient.setQueryData<Training[]>(['trainings'], (old) =>
        old?.filter((t) => !ids.includes(t.id)) || []
      );
      return { previousTrainings };
    },
    onError: (err, variables, context) => {
      if (context?.previousTrainings) {
        queryClient.setQueryData(['trainings'], context.previousTrainings);
      }
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការលុប',
        variant: 'destructive',
      });
    },
    onSuccess: (data, ids) => {
      selection.deselectAll();
      toast({
        title: 'ជោគជ័យ',
        description: `បានលុប ${ids.length} ការបណ្តុះបណ្តាល`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });

  const handleUpdateTraining = (updatedTraining: Training) => {
    updateMutation.mutate({
      id: updatedTraining.id,
      data: updatedTraining,
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selection.selectedIds);
    bulkDeleteMutation.mutate(ids);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    selection.deselectAll();
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    selection.deselectAll();
  };

  const handleExportParticipants = async (training: Training) => {
    try {
      toast({
        title: 'កំពុងរៀបចំ',
        description: 'កំពុងរៀបចំឯកសារ Excel សូមរង់ចាំ...',
      });

      const exportData = await api.trainings.getExportData(training.id);
      await exportTrainingParticipants(exportData);

      toast({
        title: 'ជោគជ័យ',
        description: 'បាននាំចេញឯកសារដោយជោគជ័យ',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការនាំចេញឯកសារ',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="ការបណ្តុះបណ្តាល" subtitle="គ្រប់គ្រងកម្មវិធីបណ្តុះបណ្តាល">
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">ការបណ្តុះបណ្តាលទាំងអស់</h2>
              <CreateTrainingDialog>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  បង្កើតថ្មី
                </Button>
              </CreateTrainingDialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកការបណ្តុះបណ្តាល..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ស្ថានភាព" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                  <SelectItem value="DRAFT">ព្រាង</SelectItem>
                  <SelectItem value="ONGOING">កំពុងដំណើរការ</SelectItem>
                  <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                  <SelectItem value="CANCELLED">បានលុបចោល</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="កម្រិត" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">កម្រិតទាំងអស់</SelectItem>
                  {TRAINING_LEVELS.map((level) => (
                    <SelectItem key={level.code} value={level.code}>
                      {level.name_km}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Bulk Actions */}
        <BulkActionToolbar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.deselectAll}
          onBulkDelete={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ការបណ្តុះបណ្តាលទេ?`}
        />

        {/* Mobile Training Cards */}
        <div className="space-y-3">
          {paginatedTrainings.map((training) => (
            <Card key={training.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selection.isSelected(training.id)}
                      onCheckedChange={() => selection.toggle(training.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <TrainingStatusBadge status={training.training_status} />
                        <TrainingLevelBadge level={training.training_level} />
                      </div>
                      <h3 className="font-semibold text-sm truncate">{training.training_name}</h3>
                      <p className="text-xs text-muted-foreground">{training.training_code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>សកម្មភាព</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <TrainingDetailsDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Eye className="mr-2 h-4 w-4" />
                            មើលព័ត៌មានលម្អិត
                          </DropdownMenuItem>
                        }
                      />
                      <EditTrainingDialog
                        training={training}
                        onUpdate={handleUpdateTraining}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            កែសម្រួល
                          </DropdownMenuItem>
                        }
                      />
                      <ManageParticipantsDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Users className="mr-2 h-4 w-4" />
                            គ្រប់គ្រងអ្នកចូលរួម
                          </DropdownMenuItem>
                        }
                      />
                      <ViewAttendanceDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            មើលការចូលរួម
                          </DropdownMenuItem>
                        }
                      />
                      <AttendanceGridDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Grid3x3 className="mr-2 h-4 w-4" />
                            គ្រប់គ្រងវត្តមាន
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <ManageAgendaDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            គ្រប់គ្រងកម្មវិធី
                          </DropdownMenuItem>
                        }
                      />
                      <AttachMaterialsDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <FileText className="mr-2 h-4 w-4" />
                            គ្រប់គ្រងឯកសារ
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportParticipants(training)}>
                        <Download className="mr-2 h-4 w-4" />
                        នាំចេញអ្នកចូលរួម
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ShareEnrollmentLink
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Link2 className="mr-2 h-4 w-4" />
                            ចែករំលែកតំណចុះឈ្មោះ
                          </DropdownMenuItem>
                        }
                      />
                      <TrainingQRCode
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <QrCode className="mr-2 h-4 w-4" />
                            បង្កើត QR Code
                          </DropdownMenuItem>
                        }
                      />
                      {training.training_level && training.training_level !== 'CLUSTER' && (
                        <CascadeTrainingDialog training={training} />
                      )}
                      <DropdownMenuSeparator />
                      <CancelTrainingDialog
                        training={training}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <XCircle className="mr-2 h-4 w-4" />
                            លុបចោល
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{training.training_location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{training.current_participants}/{training.max_participants} នាក់</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(training.training_start_date), 'MMM d')} -{' '}
                      {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Pagination */}
        <SmartPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSize={false}
        />

        {filteredTrainings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground">រកមិនឃើញការបណ្តុះបណ្តាល</p>
              <p className="text-sm text-muted-foreground text-center">
                សាកល្បងកែសម្រួលការស្វែងរក ឬលក្ខខណ្ឌត្រង
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ការបណ្តុះបណ្តាលទាំងអស់</CardTitle>
          <CreateTrainingDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              បង្កើតការបណ្តុះបណ្តាល
            </Button>
          </CreateTrainingDialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកការបណ្តុះបណ្តាល..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="ស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                <SelectItem value="DRAFT">ព្រាង</SelectItem>
                <SelectItem value="ONGOING">កំពុងដំណើរការ</SelectItem>
                <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                <SelectItem value="CANCELLED">បានលុបចោល</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="ប្រភេទ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                {TRAINING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.name_km}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="កម្រិត" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">កម្រិតទាំងអស់</SelectItem>
                {TRAINING_LEVELS.map((level) => (
                  <SelectItem key={level.code} value={level.code}>
                    {level.name_km}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <BulkActionToolbar
            selectedCount={selection.selectedCount}
            onClearSelection={selection.deselectAll}
            onBulkDelete={handleBulkDelete}
            isDeleting={bulkDeleteMutation.isPending}
            deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ការបណ្តុះបណ្តាលទេ?`}
          />

          {/* Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selection.isAllSelected}
                      onCheckedChange={selection.toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>ការបណ្តុះបណ្តាល</TableHead>
                  <TableHead>ប្រភេទ</TableHead>
                  <TableHead>កម្រិត</TableHead>
                  <TableHead>ទីតាំង</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead>អ្នកចូលរួម</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrainings.map((training) => (
                  <TableRow
                    key={training.id}
                    className={selection.isSelected(training.id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(training.id)}
                        onCheckedChange={() => selection.toggle(training.id)}
                        aria-label={`Select ${training.training_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {training.training_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {training.training_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {TRAINING_CATEGORIES.find(
                          (c) => c.code === training.training_category
                        )?.name_km || training.training_category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TrainingLevelBadge level={training.training_level} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {training.training_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(training.training_start_date), 'MMM d')} -{' '}
                        {format(new Date(training.training_end_date), 'MMM d')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {training.current_participants}
                        </span>
                        <span className="text-muted-foreground">
                          / {training.max_participants}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TrainingStatusBadge status={training.training_status} />
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
                          <TrainingDetailsDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Eye className="mr-2 h-4 w-4" />
                                មើលព័ត៌មានលម្អិត
                              </DropdownMenuItem>
                            }
                          />
                          <EditTrainingDialog
                            training={training}
                            onUpdate={handleUpdateTraining}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />
                                កែសម្រួល
                              </DropdownMenuItem>
                            }
                          />
                          <ManageParticipantsDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Users className="mr-2 h-4 w-4" />
                                គ្រប់គ្រងអ្នកចូលរួម
                              </DropdownMenuItem>
                            }
                          />
                          <ViewAttendanceDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                មើលការចូលរួម
                              </DropdownMenuItem>
                            }
                          />
                          <AttendanceGridDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Grid3x3 className="mr-2 h-4 w-4" />
                                គ្រប់គ្រងវត្តមាន
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <ManageAgendaDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <ListTodo className="mr-2 h-4 w-4" />
                                គ្រប់គ្រងកម្មវិធី
                              </DropdownMenuItem>
                            }
                          />
                          <AttachMaterialsDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileText className="mr-2 h-4 w-4" />
                                គ្រប់គ្រងឯកសារ
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExportParticipants(training)}>
                            <Download className="mr-2 h-4 w-4" />
                            នាំចេញអ្នកចូលរួម
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ShareEnrollmentLink
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Link2 className="mr-2 h-4 w-4" />
                                ចែករំលែកតំណចុះឈ្មោះ
                              </DropdownMenuItem>
                            }
                          />
                          <TrainingQRCode
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <QrCode className="mr-2 h-4 w-4" />
                                បង្កើត QR Code
                              </DropdownMenuItem>
                            }
                          />
                          {training.training_level && training.training_level !== 'CLUSTER' && (
                            <CascadeTrainingDialog training={training} />
                          )}
                          <DropdownMenuSeparator />
                          <CancelTrainingDialog
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <XCircle className="mr-2 h-4 w-4" />
                                លុបចោល
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <SmartPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />

          {filteredTrainings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">រកមិនឃើញការបណ្តុះបណ្តាល</p>
              <p className="text-sm text-muted-foreground">
                សាកល្បងកែសម្រួលការស្វែងរក ឬលក្ខខណ្ឌត្រង
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

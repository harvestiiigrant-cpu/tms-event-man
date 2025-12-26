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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SmartPagination } from '@/components/ui/smart-pagination';
import { BulkActionToolbar } from '@/components/ui/bulk-action-toolbar';
import { useSelection } from '@/hooks/use-selection';
import { toast } from '@/hooks/use-toast';
import { ViewBeneficiaryDialog } from '@/components/beneficiaries/ViewBeneficiaryDialog';
import { BeneficiaryTrainingHistoryDialog } from '@/components/beneficiaries/BeneficiaryTrainingHistoryDialog';
import { EnrollInTrainingDialog } from '@/components/beneficiaries/EnrollInTrainingDialog';
import {
  Search,
  Upload,
  MoreHorizontal,
  MapPin,
  Phone,
  GraduationCap,
  Users,
  Eye,
  Pencil,
  History,
  UserPlus,
  UserX,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EnrollBeneficiaryDialog } from '@/components/enrollment/EnrollBeneficiaryDialog';
import { BeneficiaryFormDialog } from '@/components/beneficiaries/BeneficiaryFormDialog';
import type { Beneficiary } from '@/types/training';

export default function Beneficiaries() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch beneficiaries from API
  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: api.beneficiaries.getAll,
  });

  // Get unique provinces for filter
  const provinces = useMemo(() => {
    return [...new Set(beneficiaries.map((b: Beneficiary) => b.province_name).filter(Boolean))];
  }, [beneficiaries]);

  // Filter beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((beneficiary: Beneficiary) => {
      const matchesSearch =
        beneficiary.name?.includes(searchQuery) ||
        beneficiary.name_english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.teacher_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beneficiary.phone?.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || beneficiary.status === statusFilter;

      const matchesProvince =
        provinceFilter === 'all' || beneficiary.province_name === provinceFilter;

      return matchesSearch && matchesStatus && matchesProvince;
    });
  }, [beneficiaries, searchQuery, statusFilter, provinceFilter]);

  // Pagination
  const totalItems = filteredBeneficiaries.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedBeneficiaries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBeneficiaries.slice(start, start + pageSize);
  }, [filteredBeneficiaries, page, pageSize]);

  // Selection hook for bulk operations
  const selection = useSelection<Beneficiary & { id: string }>(
    paginatedBeneficiaries.map((b: Beneficiary) => ({ ...b, id: b.teacher_id }))
  );

  // Bulk delete mutation with optimistic update
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.beneficiaries.bulkDelete(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['beneficiaries'] });
      const previousBeneficiaries = queryClient.getQueryData<Beneficiary[]>(['beneficiaries']);
      queryClient.setQueryData<Beneficiary[]>(['beneficiaries'], (old) =>
        old?.filter((b) => !ids.includes(b.teacher_id)) || []
      );
      return { previousBeneficiaries };
    },
    onError: (err, variables, context) => {
      if (context?.previousBeneficiaries) {
        queryClient.setQueryData(['beneficiaries'], context.previousBeneficiaries);
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
        description: `បានលុប ${ids.length} អ្នកទទួលផល`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  // Update beneficiary mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Beneficiary> }) =>
      api.beneficiaries.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['beneficiaries'] });
      const previousBeneficiaries = queryClient.getQueryData<Beneficiary[]>(['beneficiaries']);
      queryClient.setQueryData<Beneficiary[]>(['beneficiaries'], (old) =>
        old?.map((b) => (b.teacher_id === id ? { ...b, ...data } : b)) || []
      );
      return { previousBeneficiaries };
    },
    onError: (err, variables, context) => {
      if (context?.previousBeneficiaries) {
        queryClient.setQueryData(['beneficiaries'], context.previousBeneficiaries);
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
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const handleBulkDelete = () => {
    const ids = Array.from(selection.selectedIds);
    bulkDeleteMutation.mutate(ids);
  };

  const handleDeactivate = (beneficiary: any) => {
    if (confirm(`តើអ្នកប្រាកដថាចង់បិទដំណើរការ ${beneficiary.name} ទេ?`)) {
      updateMutation.mutate({
        id: beneficiary.teacher_id,
        data: { status: 'INACTIVE' },
      });
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'សកម្ម';
      case 'INACTIVE':
        return 'អសកម្ម';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout title="អ្នកទទួលផល" subtitle="គ្រប់គ្រងអ្នកចូលរួមការបណ្តុះបណ្តាល">
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold">អ្នកទទួលផលទាំងអស់</h2>
              <div className="flex gap-2">
                <EnrollBeneficiaryDialog />
                <BeneficiaryFormDialog mode="create" />
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ លេខសម្គាល់ ឬទូរស័ព្ទ..."
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
                  <SelectItem value="ACTIVE">សកម្ម</SelectItem>
                  <SelectItem value="INACTIVE">អសកម្ម</SelectItem>
                </SelectContent>
              </Select>
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ខេត្ត" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ខេត្តទាំងអស់</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province!}>
                      {province}
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
          deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} អ្នកទទួលផលទេ?`}
        />

        {/* Mobile Beneficiary Cards */}
        <div className="space-y-3">
          {paginatedBeneficiaries.map((beneficiary: Beneficiary) => (
            <Card key={beneficiary.teacher_id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selection.isSelected(beneficiary.teacher_id)}
                      onCheckedChange={() => selection.toggle(beneficiary.teacher_id)}
                    />
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={beneficiary.profile_image_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {beneficiary.name_english
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2) || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {beneficiary.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {beneficiary.name_english}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {beneficiary.teacher_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'font-medium text-xs',
                        beneficiary.status === 'ACTIVE'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {getStatusLabel(beneficiary.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>សកម្មភាព</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ViewBeneficiaryDialog
                          beneficiary={beneficiary}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              មើលប្រវត្តិរូប
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem onClick={() => setEditingBeneficiary(beneficiary)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          កែសម្រួល
                        </DropdownMenuItem>
                        <BeneficiaryTrainingHistoryDialog
                          beneficiary={beneficiary}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <History className="mr-2 h-4 w-4" />
                              មើលប្រវត្តិការបណ្តុះបណ្តាល
                            </DropdownMenuItem>
                          }
                        />
                        <EnrollInTrainingDialog
                          beneficiary={beneficiary}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              ចុះឈ្មោះក្នុងការបណ្តុះបណ្តាល
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeactivate(beneficiary)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          បិទដំណើរការ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {beneficiary.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{beneficiary.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{beneficiary.province_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <GraduationCap className="h-3 w-3" />
                    <span className="truncate">{beneficiary.school}</span>
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

        {filteredBeneficiaries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground">រកមិនឃើញអ្នកទទួលផល</p>
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
          <CardTitle>អ្នកទទួលផលទាំងអស់</CardTitle>
          <div className="flex gap-2">
            <EnrollBeneficiaryDialog />
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              នាំចូល
            </Button>
            <BeneficiaryFormDialog mode="create" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ លេខសម្គាល់ ឬទូរស័ព្ទ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="ស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                <SelectItem value="ACTIVE">សកម្ម</SelectItem>
                <SelectItem value="INACTIVE">អសកម្ម</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="ខេត្ត" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ខេត្តទាំងអស់</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province!}>
                    {province}
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
            deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} អ្នកទទួលផលទេ?`}
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
                  <TableHead>អ្នកទទួលផល</TableHead>
                  <TableHead>ទំនាក់ទំនង</TableHead>
                  <TableHead>ទីតាំង</TableHead>
                  <TableHead>សាលារៀន</TableHead>
                  <TableHead>មុខវិជ្ជា</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBeneficiaries.map((beneficiary: Beneficiary) => (
                  <TableRow
                    key={beneficiary.teacher_id}
                    className={selection.isSelected(beneficiary.teacher_id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(beneficiary.teacher_id)}
                        onCheckedChange={() => selection.toggle(beneficiary.teacher_id)}
                        aria-label={`Select ${beneficiary.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={beneficiary.profile_image_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {beneficiary.name_english
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2) || 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {beneficiary.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {beneficiary.teacher_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {beneficiary.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {beneficiary.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {beneficiary.province_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span className="max-w-[150px] truncate">
                          {beneficiary.school}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {beneficiary.subject}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-medium',
                          beneficiary.status === 'ACTIVE'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {getStatusLabel(beneficiary.status)}
                      </Badge>
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
                          <ViewBeneficiaryDialog
                            beneficiary={beneficiary}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Eye className="mr-2 h-4 w-4" />
                                មើលប្រវត្តិរូប
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem onClick={() => setEditingBeneficiary(beneficiary)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            កែសម្រួល
                          </DropdownMenuItem>
                          <BeneficiaryTrainingHistoryDialog
                            beneficiary={beneficiary}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <History className="mr-2 h-4 w-4" />
                                មើលប្រវត្តិការបណ្តុះបណ្តាល
                              </DropdownMenuItem>
                            }
                          />
                          <EnrollInTrainingDialog
                            beneficiary={beneficiary}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                ចុះឈ្មោះក្នុងការបណ្តុះបណ្តាល
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeactivate(beneficiary)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            បិទដំណើរការ
                          </DropdownMenuItem>
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

          {filteredBeneficiaries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">
                រកមិនឃើញអ្នកទទួលផល
              </p>
              <p className="text-sm text-muted-foreground">
                សាកល្បងកែសម្រួលការស្វែងរក ឬលក្ខខណ្ឌត្រង
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <BeneficiaryFormDialog
        mode="edit"
        beneficiary={editingBeneficiary || undefined}
        open={!!editingBeneficiary}
        onOpenChange={(open) => !open && setEditingBeneficiary(null)}
      />
    </DashboardLayout>
  );
}

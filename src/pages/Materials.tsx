import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CreateMaterialDialog } from '@/components/materials/CreateMaterialDialog';
import { EditMaterialDialog } from '@/components/materials/EditMaterialDialog';
import { SmartPagination } from '@/components/ui/smart-pagination';
import { BulkActionToolbar } from '@/components/ui/bulk-action-toolbar';
import { useSelection } from '@/hooks/use-selection';
import { toast } from '@/hooks/use-toast';
import { MATERIAL_CATEGORIES } from '@/types/training';
import type { TrainingMaterial } from '@/types/training';
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Link2,
  Download,
  Pencil,
  Trash2,
  ExternalLink,
  File,
  Video,
  Image,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

// Helper to get icon based on mime type
const getMaterialIcon = (material: TrainingMaterial) => {
  if (material.material_type === 'URL') {
    return <Link2 className="h-4 w-4" />;
  }

  const mime = material.mime_type || '';
  if (mime.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (mime.startsWith('video/')) {
    return <Video className="h-4 w-4" />;
  }
  if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return <FileSpreadsheet className="h-4 w-4" />;
  }
  if (mime.includes('presentation') || mime.includes('powerpoint')) {
    return <Presentation className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

// Helper to format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Materials() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch materials from API
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.materials.getAll(),
  });

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material: TrainingMaterial) => {
      const matchesSearch =
        material.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.title_km?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.file_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || material.category === categoryFilter;

      const matchesType =
        typeFilter === 'all' || material.material_type === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [materials, searchQuery, categoryFilter, typeFilter]);

  // Pagination
  const totalItems = filteredMaterials.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, page, pageSize]);

  // Selection hook for bulk operations
  const selection = useSelection<TrainingMaterial>(paginatedMaterials);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.materials.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានលុបឯកសារដោយជោគជ័យ',
      });
    },
    onError: () => {
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការលុបឯកសារ',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation with optimistic update
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete one by one since we don't have bulk delete endpoint
      await Promise.all(ids.map((id) => api.materials.delete(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['materials'] });
      const previousMaterials = queryClient.getQueryData<TrainingMaterial[]>(['materials']);
      queryClient.setQueryData<TrainingMaterial[]>(['materials'], (old) =>
        old?.filter((m) => !ids.includes(m.id)) || []
      );
      return { previousMaterials };
    },
    onError: (err, variables, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(['materials'], context.previousMaterials);
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
        description: `បានលុប ${ids.length} ឯកសារ`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

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

  const handleDownload = (material: TrainingMaterial) => {
    if (material.material_type === 'URL' && material.external_url) {
      window.open(material.external_url, '_blank');
    } else if (material.file_url) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      window.open(`${apiUrl.replace('/api', '')}${material.file_url}`, '_blank');
    }
  };

  return (
    <DashboardLayout title="បណ្ណាល័យឯកសារ" subtitle="គ្រប់គ្រងឯកសារបណ្តុះបណ្តាល">
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">ឯកសារទាំងអស់</h2>
              <CreateMaterialDialog>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  បន្ថែមថ្មី
                </Button>
              </CreateMaterialDialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកឯកសារ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ប្រភេទ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name_km}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ប្រភេទឯកសារ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                  <SelectItem value="FILE">ឯកសារ</SelectItem>
                  <SelectItem value="URL">តំណ</SelectItem>
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
          deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ឯកសារទេ?`}
        />

        {/* Mobile Material Cards */}
        <div className="space-y-3">
          {paginatedMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selection.isSelected(material.id)}
                      onCheckedChange={() => selection.toggle(material.id)}
                    />
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                      {getMaterialIcon(material)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{material.title_km || material.title_en}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {material.material_type === 'FILE' ? material.file_name : material.external_url}
                      </p>
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
                      <DropdownMenuItem onClick={() => handleDownload(material)}>
                        {material.material_type === 'URL' ? (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            បើកតំណ
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            ទាញយក
                          </>
                        )}
                      </DropdownMenuItem>
                      <EditMaterialDialog
                        material={material}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            កែសម្រួល
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            លុប
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>លុបឯកសារ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              តើអ្នកប្រាកដថាចង់លុបឯកសារនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(material.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              លុប
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">
                    {material.material_type === 'FILE' ? 'ឯកសារ' : 'តំណ'}
                  </Badge>
                  {material.category && (
                    <Badge variant="secondary">
                      {MATERIAL_CATEGORIES.find((c) => c.code === material.category)?.name_km || material.category}
                    </Badge>
                  )}
                  {material.file_size && (
                    <span className="text-muted-foreground">{formatFileSize(material.file_size)}</span>
                  )}
                  {material.linked_trainings_count !== undefined && material.linked_trainings_count > 0 && (
                    <span className="text-muted-foreground">
                      {material.linked_trainings_count} ការបណ្តុះបណ្តាល
                    </span>
                  )}
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

        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground">រកមិនឃើញឯកសារ</p>
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
          <CardTitle>ឯកសារទាំងអស់</CardTitle>
          <CreateMaterialDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              បន្ថែមឯកសារ
            </Button>
          </CreateMaterialDialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកឯកសារ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="ប្រភេទ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.name_km}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="ប្រភេទឯកសារ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                <SelectItem value="FILE">ឯកសារ</SelectItem>
                <SelectItem value="URL">តំណ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <BulkActionToolbar
            selectedCount={selection.selectedCount}
            onClearSelection={selection.deselectAll}
            onBulkDelete={handleBulkDelete}
            isDeleting={bulkDeleteMutation.isPending}
            deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ឯកសារទេ?`}
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
                  <TableHead>ឯកសារ</TableHead>
                  <TableHead>ប្រភេទ</TableHead>
                  <TableHead>ទំហំ</TableHead>
                  <TableHead>ការបណ្តុះបណ្តាល</TableHead>
                  <TableHead>បង្កើតនៅ</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaterials.map((material) => (
                  <TableRow
                    key={material.id}
                    className={selection.isSelected(material.id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(material.id)}
                        onCheckedChange={() => selection.toggle(material.id)}
                        aria-label={`Select ${material.title_en}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                          {getMaterialIcon(material)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {material.title_km || material.title_en}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {material.material_type === 'FILE' ? material.file_name : material.external_url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {material.material_type === 'FILE' ? 'ឯកសារ' : 'តំណ'}
                        </Badge>
                        {material.category && (
                          <span className="text-xs text-muted-foreground">
                            {MATERIAL_CATEGORIES.find((c) => c.code === material.category)?.name_km || material.category}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(material.file_size) || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {material.linked_trainings_count !== undefined ? material.linked_trainings_count : 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(material.created_at), 'MMM d, yyyy')}
                      </span>
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
                          <DropdownMenuItem onClick={() => handleDownload(material)}>
                            {material.material_type === 'URL' ? (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                បើកតំណ
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                ទាញយក
                              </>
                            )}
                          </DropdownMenuItem>
                          <EditMaterialDialog
                            material={material}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />
                                កែសម្រួល
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                លុប
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>លុបឯកសារ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  តើអ្នកប្រាកដថាចង់លុបឯកសារនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(material.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  លុប
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

          {filteredMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">រកមិនឃើញឯកសារ</p>
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

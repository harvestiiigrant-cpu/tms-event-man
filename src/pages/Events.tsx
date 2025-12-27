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
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { EventTypeBadge } from '@/components/events/EventTypeBadge';
import { EventFormatBadge } from '@/components/events/EventFormatBadge';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { SmartPagination } from '@/components/ui/smart-pagination';
import { BulkActionToolbar } from '@/components/ui/bulk-action-toolbar';
import { useSelection } from '@/hooks/use-selection';
import { toast } from '@/hooks/use-toast';
import { EVENT_TYPES } from '@/types/event';
import type { Event } from '@/types/event';
import {
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  Eye,
  Pencil,
  XCircle,
  CalendarDays,
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

export default function Events() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch events from API
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.events.getAll,
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesSearch =
        event.event_name_english
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        event.event_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        event.event_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || event.event_status === statusFilter;

      const matchesType =
        typeFilter === 'all' || event.event_type === typeFilter;

      const matchesFormat =
        formatFilter === 'all' || event.event_format === formatFilter;

      return matchesSearch && matchesStatus && matchesType && matchesFormat;
    });
  }, [events, searchQuery, statusFilter, typeFilter, formatFilter]);

  // Pagination
  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, page, pageSize]);

  // Selection hook for bulk operations
  const selection = useSelection<Event>(paginatedEvents);

  // Delete single event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.events.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const previousEvents = queryClient.getQueryData<Event[]>(['events']);
      queryClient.setQueryData<Event[]>(['events'], (old) =>
        old?.filter((e) => e.id !== id) || []
      );
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      toast({
        title: 'បរាជ័យ',
        description: 'មានបញ្ហាក្នុងការលុប',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'ជោគជ័យ',
        description: 'បានលុបព្រឹត្តិការណ៍ដោយជោគជ័យ',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.events.bulkDelete(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const previousEvents = queryClient.getQueryData<Event[]>(['events']);
      queryClient.setQueryData<Event[]>(['events'], (old) =>
        old?.filter((e) => !ids.includes(e.id)) || []
      );
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
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
        description: `បានលុប ${ids.length} ព្រឹត្តិការណ៍`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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

  return (
    <DashboardLayout title="ព្រឹត្តិការណ៍" subtitle="គ្រប់គ្រងព្រឹត្តិការណ៍ និង សន្និសីទ">
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">ព្រឹត្តិការណ៍ទាំងអស់</h2>
              <CreateEventDialog>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  បង្កើតថ្មី
                </Button>
              </CreateEventDialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកព្រឹត្តិការណ៍..."
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
                  <SelectItem value="UPCOMING">នឹងមកដល់</SelectItem>
                  <SelectItem value="ONGOING">កំពុងដំណើរការ</SelectItem>
                  <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                  <SelectItem value="CANCELLED">បានលុបចោល</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="ប្រភេទ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name_km}
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
          deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ព្រឹត្តិការណ៍ទេ?`}
        />

        {/* Mobile Event Cards */}
        <div className="space-y-3">
          {paginatedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selection.isSelected(event.id)}
                      onCheckedChange={() => selection.toggle(event.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <EventStatusBadge status={event.event_status} />
                        <EventTypeBadge type={event.event_type} />
                        <EventFormatBadge format={event.event_format} />
                      </div>
                      <h3 className="font-semibold text-sm truncate">{event.event_name}</h3>
                      <p className="text-xs text-muted-foreground">{event.event_code}</p>
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        មើលព័ត៌មានលម្អិត
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        កែសម្រួល
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        គ្រប់គ្រងអ្នកចុះឈ្មោះ
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteMutation.mutate(event.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        លុបចោល
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {event.event_location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.event_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{event.current_attendees}/{event.max_attendees} នាក់</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(event.event_start_date), 'MMM d')} -{' '}
                      {format(new Date(event.event_end_date), 'MMM d, yyyy')}
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

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground">រកមិនឃើញព្រឹត្តិការណ៍</p>
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
          <CardTitle>ព្រឹត្តិការណ៍ទាំងអស់</CardTitle>
          <CreateEventDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              បង្កើតព្រឹត្តិការណ៍
            </Button>
          </CreateEventDialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកព្រឹត្តិការណ៍..."
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
                <SelectItem value="UPCOMING">នឹងមកដល់</SelectItem>
                <SelectItem value="ONGOING">កំពុងដំណើរការ</SelectItem>
                <SelectItem value="COMPLETED">បានបញ្ចប់</SelectItem>
                <SelectItem value="CANCELLED">បានលុបចោល</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="ប្រភេទ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name_km}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="ទម្រង់" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទម្រង់ទាំងអស់</SelectItem>
                <SelectItem value="IN_PERSON">ចូលរួមផ្ទាល់</SelectItem>
                <SelectItem value="VIRTUAL">តាមអនឡាញ</SelectItem>
                <SelectItem value="HYBRID">ចូលរួមផ្សំ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <BulkActionToolbar
            selectedCount={selection.selectedCount}
            onClearSelection={selection.deselectAll}
            onBulkDelete={handleBulkDelete}
            isDeleting={bulkDeleteMutation.isPending}
            deleteDescription={`តើអ្នកប្រាកដថាចង់លុប ${selection.selectedCount} ព្រឹត្តិការណ៍ទេ?`}
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
                  <TableHead>ព្រឹត្តិការណ៍</TableHead>
                  <TableHead>ប្រភេទ</TableHead>
                  <TableHead>ទម្រង់</TableHead>
                  <TableHead>ទីតាំង</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead>អ្នកចុះឈ្មោះ</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className={selection.isSelected(event.id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selection.isSelected(event.id)}
                        onCheckedChange={() => selection.toggle(event.id)}
                        aria-label={`Select ${event.event_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {event.event_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.event_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EventTypeBadge type={event.event_type} />
                    </TableCell>
                    <TableCell>
                      <EventFormatBadge format={event.event_format} />
                    </TableCell>
                    <TableCell>
                      {event.event_location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.event_location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(event.event_start_date), 'MMM d')} -{' '}
                        {format(new Date(event.event_end_date), 'MMM d')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {event.current_attendees}
                        </span>
                        <span className="text-muted-foreground">
                          / {event.max_attendees}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EventStatusBadge status={event.event_status} />
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            មើលព័ត៌មានលម្អិត
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            កែសម្រួល
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            គ្រប់គ្រងអ្នកចុះឈ្មោះ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(event.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            លុបចោល
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

          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">រកមិនឃើញព្រឹត្តិការណ៍</p>
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

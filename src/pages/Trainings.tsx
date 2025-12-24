import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CreateTrainingDialog } from '@/components/trainings/CreateTrainingDialog';
import { ShareEnrollmentLink } from '@/components/trainings/ShareEnrollmentLink';
import { TrainingQRCode } from '@/components/trainings/TrainingQRCode';
import { mockTrainings } from '@/data/mockData';
import { TRAINING_CATEGORIES } from '@/types/training';
import {
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  Link2,
  QrCode,
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

export default function Trainings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTrainings = mockTrainings.filter((training) => {
    const matchesSearch =
      training.training_name_english
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      training.training_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || training.training_status === statusFilter;

    const matchesCategory =
      categoryFilter === 'all' || training.training_category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <DashboardLayout title="Trainings" subtitle="Manage training programs">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Trainings</CardTitle>
          <CreateTrainingDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Training
            </Button>
          </CreateTrainingDialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trainings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TRAINING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {training.training_name_english}
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
                        )?.name_en || training.training_category}
                      </span>
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Training</DropdownMenuItem>
                          <DropdownMenuItem>Manage Participants</DropdownMenuItem>
                          <DropdownMenuItem>View Attendance</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ShareEnrollmentLink 
                            training={training} 
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Link2 className="mr-2 h-4 w-4" />
                                Share Enrollment Link
                              </DropdownMenuItem>
                            }
                          />
                          <TrainingQRCode
                            training={training}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR Code
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Cancel Training
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTrainings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">No trainings found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

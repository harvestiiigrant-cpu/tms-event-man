import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Training } from '@/types/training';
import { Users, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ManageParticipantsDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

// Mock participant data structure
interface Participant {
  id: string;
  teacher_id: string;
  name: string;
  phone?: string;
  school?: string;
  attendance_status: 'REGISTERED' | 'ATTENDED' | 'COMPLETED' | 'DROPPED';
  training_role: 'PARTICIPANT' | 'TRAINER' | 'COORDINATOR';
  registration_method: 'QR' | 'MANUAL' | 'IMPORT';
  registration_date: string;
}

// Mock data - replace with actual data fetching
const mockParticipants: Participant[] = [
  {
    id: '1',
    teacher_id: 'T001',
    name: 'សុខ សុវណ្ណា',
    phone: '012345678',
    school: 'Phnom Penh Primary School',
    attendance_status: 'ATTENDED',
    training_role: 'PARTICIPANT',
    registration_method: 'QR',
    registration_date: '2024-01-15',
  },
  {
    id: '2',
    teacher_id: 'T002',
    name: 'ចន្ទ្រា ពេជ្រ',
    phone: '012987654',
    school: 'Siem Reap Secondary School',
    attendance_status: 'REGISTERED',
    training_role: 'PARTICIPANT',
    registration_method: 'MANUAL',
    registration_date: '2024-01-16',
  },
  {
    id: '3',
    teacher_id: 'T003',
    name: 'វិចិត្រា ធារា',
    phone: '011223344',
    school: 'Battambang High School',
    attendance_status: 'COMPLETED',
    training_role: 'TRAINER',
    registration_method: 'MANUAL',
    registration_date: '2024-01-14',
  },
];

const getAttendanceStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'ATTENDED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'REGISTERED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'DROPPED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'TRAINER':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'COORDINATOR':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export function ManageParticipantsDialog({ training, trigger }: ManageParticipantsDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.teacher_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.school?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || participant.attendance_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter((p) => p.id !== participantId));
    toast({
      title: 'Participant Removed',
      description: 'The participant has been removed from this training.',
    });
  };

  const handleAddParticipant = () => {
    toast({
      title: 'Add Participant',
      description: 'This feature will open a dialog to search and add participants.',
    });
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Users className="mr-2 h-4 w-4" />
      Manage Participants
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Participants - {training.training_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {training.current_participants} / {training.max_participants} participants enrolled
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
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
                <SelectItem value="REGISTERED">Registered</SelectItem>
                <SelectItem value="ATTENDED">Attended</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddParticipant} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </div>

          {/* Participants Table */}
          <div className="max-h-[500px] overflow-y-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.teacher_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{participant.name}</p>
                        {participant.phone && (
                          <p className="text-xs text-muted-foreground">{participant.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {participant.school || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(participant.training_role)}>
                        {participant.training_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getAttendanceStatusColor(participant.attendance_status)}>
                        {participant.attendance_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {participant.registration_method}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveParticipant(participant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredParticipants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-lg font-medium text-foreground">No participants found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold text-foreground">{participants.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
                <p className="text-2xl font-bold text-foreground">
                  {training.max_participants - participants.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {participants.filter((p) => p.attendance_status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

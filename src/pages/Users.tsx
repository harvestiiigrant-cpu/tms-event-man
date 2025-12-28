import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Shield,
  Mail,
  Phone,
  UserCog,
  Loader2,
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

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'BENEFICIARY';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function Users() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    phone: '',
    password: '',
    role: 'ADMIN' as const,
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      // For now, we'll use a mock endpoint - this would need to be implemented
      // api.auth.getAllUsers is not defined yet
      return [] as User[];
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      // This would call api.users.create(data)
      console.log('Creating user:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតអ្នកប្រើប្រាស់' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateDialogOpen(false);
      setNewUser({ username: '', email: '', name: '', phone: '', password: '', role: 'ADMIN' });
    },
    onError: (error: any) => {
      toast({ title: 'បរាជ័យ', description: error.message, variant: 'destructive' });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting user:', id);
      return id;
    },
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុបអ្នកប្រើប្រាស់' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({ title: 'បរាជ័យ', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.name || !newUser.password) {
      toast({ title: 'បរាជ័យ', description: 'សូមបំពេញព័ត៌មានទាំងអស់', variant: 'destructive' });
      return;
    }
    createMutation.mutate(newUser);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើប្រាស់នេះទេ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-100 text-purple-800">អ្នកគ្រប់គ្រងជាន់ខ្ពស់</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-800">អ្នកគ្រប់គ្រង</Badge>;
      case 'BENEFICIARY':
        return <Badge className="bg-gray-100 text-gray-800">អ្នកទទួលផល</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // Mock users for demo
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@tms.com',
      name: 'Admin User',
      phone: '012 345 678',
      role: 'SUPER_ADMIN',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@tms.com',
      name: 'Manager User',
      phone: '012 345 679',
      role: 'ADMIN',
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  ];

  const displayUsers = users.length > 0 ? filteredUsers : mockUsers;

  return (
    <DashboardLayout
      title="អ្នកប្រើប្រាស់"
      subtitle="គ្រប់គ្រងអ្នកប្រើប្រាស់"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>អ្នកប្រើប្រាស់ទាំងអស់</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                បង្កើតអ្នកប្រើប្រាស់
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>បង្កើតអ្នកប្រើប្រាស់ថ្មី</DialogTitle>
                <DialogDescription>
                  បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតអ្នកប្រើប្រាស់ថ្មី
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">ឈ្មោះ</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="ឈ្មោះពេញ"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">ឈ្មោះប្រើប្រាស់</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">អ៊ីមែល</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">លេខទូរស័ព្ទ</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="012 345 678"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">ពាក្យសម្ងាត់</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">តួនាទី</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">អ្នកគ្រប់គ្រង</SelectItem>
                      <SelectItem value="SUPER_ADMIN">អ្នកគ្រប់គ្រងជាន់ខ្ពស់</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  បោះបង់
                </Button>
                <Button onClick={handleCreateUser} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  បង្កើត
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកតាម ឈ្មោះ អ៊ីមែល ឬ ឈ្មោះប្រើ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="តួនាទី" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                <SelectItem value="SUPER_ADMIN">អ្នកគ្រប់គ្រងជាន់ខ្ពស់</SelectItem>
                <SelectItem value="ADMIN">អ្នកគ្រប់គ្រង</SelectItem>
                <SelectItem value="BENEFICIARY">អ្នកទទួលផល</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>អ្នកប្រើប្រាស់</TableHead>
                  <TableHead>អ៊ីមែល</TableHead>
                  <TableHead>លេខទូរស័ព្ទ</TableHead>
                  <TableHead>តួនាទី</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-lg font-medium">រកមិនឃើញអ្នកប្រើប្រាស់</p>
                      <p className="text-sm text-muted-foreground">
                        បង្កើតអ្នកប្រើប្រាស់ថ្មី
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {user.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              មើល
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              កែសម្រួល
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
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
    </DashboardLayout>
  );
}

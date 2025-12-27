import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Database, Globe, Type, Settings2, Briefcase, Building2 } from 'lucide-react';
import { useFont, KHMER_FONTS } from '@/contexts/FontContext';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { uploadProfileImage } from '@/lib/uploadUtils';
import type { TrainingCategory, TrainingType } from '@/types/training';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CategoryFormDialog } from '@/components/settings/CategoryFormDialog';
import { TypeFormDialog } from '@/components/settings/TypeFormDialog';
import { DeleteConfirmDialog } from '@/components/settings/DeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { khmerFont, setKhmerFont } = useFont();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profileImageRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.getAll,
  });

  // Fetch types
  const { data: types = [] } = useQuery({
    queryKey: ['types'],
    queryFn: api.types.getAll,
  });

  // Fetch positions
  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: api.positions.getAll,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: api.departments.getAll,
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string }) =>
      api.auth.updateProfile(data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួនដោយជោគជ័យ' });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.auth.changePassword(data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: api.categories.create,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតប្រភេទថ្មី' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.categories.update(id, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទ' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: api.categories.delete,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុបប្រភេទ' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Type mutations
  const createTypeMutation = useMutation({
    mutationFn: api.types.create,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតប្រភេទថ្មី' });
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.types.update(id, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទ' });
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: api.types.delete,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុបប្រភេទ' });
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Handlers
  const handleCreateCategory = (data: { code: string; name_en: string; name_km: string }) => {
    createCategoryMutation.mutate(data);
  };

  const handleUpdateCategory = (category: any, data: { code: string; name_en: string; name_km: string }) => {
    updateCategoryMutation.mutate({ id: category.id, data });
  };

  const handleDeleteCategory = (category: any) => {
    deleteCategoryMutation.mutate(category.id);
  };

  const handleCreateType = (data: { code: string; name_en: string; name_km: string }) => {
    createTypeMutation.mutate(data);
  };

  const handleUpdateType = (type: any, data: { code: string; name_en: string; name_km: string }) => {
    updateTypeMutation.mutate({ id: type.id, data });
  };

  const handleDeleteType = (type: any) => {
    deleteTypeMutation.mutate(type.id);
  };

  // Position mutations (same pattern as categories/types)
  const createPositionMutation = useMutation({
    mutationFn: api.positions.create,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតមុខតំណែង' });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.positions.update(id, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាព' });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  const deletePositionMutation = useMutation({
    mutationFn: api.positions.delete,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុប' });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: api.departments.create,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានបង្កើតនាយកដ្ឋាន' });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.departments.update(id, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាព' });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: api.departments.delete,
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានលុប' });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => toast({ title: 'កំហុស', description: error.message, variant: 'destructive' }),
  });

  // Position handlers
  const handleCreatePosition = (data: any) => createPositionMutation.mutate(data);
  const handleUpdatePosition = (position: any, data: any) => updatePositionMutation.mutate({ id: position.id, data });
  const handleDeletePosition = (position: any) => deletePositionMutation.mutate(position.id);

  // Department handlers
  const handleCreateDepartment = (data: any) => createDepartmentMutation.mutate(data);
  const handleUpdateDepartment = (dept: any, data: any) => updateDepartmentMutation.mutate({ id: dept.id, data });
  const handleDeleteDepartment = (dept: any) => deleteDepartmentMutation.mutate(dept.id);

  const handleProfileSave = () => {
    profileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'កំហុស', description: 'ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា', variant: 'destructive' });
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await uploadProfileImage(file, user?.id || '');
      if (result.success && result.url) {
        const updatedUser = await profileMutation.mutateAsync({ profile_image_url: result.url });

        // Update AuthContext user state
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const auth = JSON.parse(storedAuth);
          auth.user = updatedUser;
          localStorage.setItem('auth', JSON.stringify(auth));
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));

          // Force page reload to update all avatar components
          window.location.reload();
        }

        toast({ title: 'ជោគជ័យ', description: 'រូបថតប្រវត្តិរូបបានរក្សាទុក' });
      }
    } catch (error) {
      toast({ title: 'កំហុស', description: 'បរាជ័យក្នុងការផ្ទុករូបថត', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់';
      case 'ADMIN':
        return 'អ្នកគ្រប់គ្រង';
      default:
        return role;
    }
  };

  return (
    <DashboardLayout title="ការកំណត់" subtitle="គ្រប់គ្រងគណនី និងចំណូលចិត្តរបស់អ្នក">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">គណនី</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">ប្រព័ន្ធ</span>
          </TabsTrigger>
          <TabsTrigger value="references" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">ឯកសារយោង</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">សុវត្ថិភាព</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile & Account Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              ការកំណត់គណនី
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              កែសម្រួលព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
              <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                <AvatarImage src={user?.profile_image_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg lg:text-xl">
                  {user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => profileImageRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? 'កំពុងផ្ទុក...' : 'ប្តូររូបភាព'}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG ឬ GIF។ ទំហំអតិបរមា 5MB។
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">ឈ្មោះពេញ</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">អ៊ីមែល</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">លេខទូរស័ព្ទ</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">តួនាទី</Label>
                <Input id="role" defaultValue={user?.role ? getRoleName(user.role) : ''} disabled />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleProfileSave} disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <Bell className="h-4 w-4 text-primary" />
                ការជូនដំណឹង
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">ការជូនដំណឹងអ៊ីមែល</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">ទទួលបានព័ត៌មានថ្មីៗតាមអ៊ីមែល</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">ការរំលឹកបណ្តុះបណ្តាល</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">មុនពេលបណ្តុះបណ្តាលចាប់ផ្តើម</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">ការជូនដំណឹងអំពីវត្តមាន</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">ការព្រមានពេលវត្តមានទាប</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <Globe className="h-4 w-4 text-primary" />
                ភាសា និងតំបន់
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">ភាសា</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">ភាសាបង្ហាញ</p>
                </div>
                <span className="text-xs lg:text-sm text-muted-foreground">ខ្មែរ</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium">តំបន់ពេលវេលា</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">UTC+7 កម្ពុជា</p>
                </div>
                <span className="text-xs lg:text-sm text-muted-foreground">Asia/Phnom_Penh</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                <Type className="h-4 w-4 text-primary" />
                ពុម្ពអក្សរខ្មែរ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="khmer-font" className="text-xs lg:text-sm">ជ្រើសរើសពុម្ពអក្សរខ្មែរ</Label>
                <Select value={khmerFont} onValueChange={setKhmerFont}>
                  <SelectTrigger id="khmer-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KHMER_FONTS.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.labelKm} ({font.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-muted-foreground mb-2">មើលជាមុន៖</p>
                <p className="text-base lg:text-lg" style={{ fontFamily: khmerFont }}>
                  វគ្គបណ្តុះបណ្តាលគ្រូបង្រៀន
                </p>
                <p className="text-xs lg:text-sm mt-1" style={{ fontFamily: khmerFont }}>
                  ភាសាខ្មែរ, គណិតវិទ្យា, ព័ត៌មានវិទ្យា
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              សុវត្ថិភាព
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              គ្រប់គ្រងពាក្យសម្ងាត់ និងការកំណត់សុវត្ថិភាពរបស់អ្នក
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">ពាក្យសម្ងាត់បច្ចុប្បន្ន</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="hidden sm:block"></div>
              <div className="space-y-2">
                <Label htmlFor="new-password">ពាក្យសម្ងាត់ថ្មី</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">បញ្ជាក់ពាក្យសម្ងាត់</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handlePasswordChange}
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់'}
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  ការជូនដំណឹង
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ការជូនដំណឹងអ៊ីមែល</p>
                    <p className="text-xs text-muted-foreground">ទទួលបានព័ត៌មានថ្មីៗតាមអ៊ីមែល</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ការរំលឹកបណ្តុះបណ្តាល</p>
                    <p className="text-xs text-muted-foreground">មុនពេលបណ្តុះបណ្តាលចាប់ផ្តើម</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  ភាសា និងពុម្ពអក្សរ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ពុម្ពអក្សរខ្មែរ</Label>
                  <Select value={khmerFont} onValueChange={setKhmerFont}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KHMER_FONTS.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.labelKm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground mb-2">មើលជាមុន៖</p>
                  <p className="text-lg" style={{ fontFamily: khmerFont }}>វគ្គបណ្តុះបណ្តាលគ្រូបង្រៀន</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  ព័ត៌មានប្រព័ន្ធ
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="flex justify-between sm:flex-col">
                  <span className="text-sm text-muted-foreground">កំណែ</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between sm:flex-col">
                  <span className="text-sm text-muted-foreground">ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ</span>
                  <span className="font-medium">ធ្នូ ២៣, ២០២៥</span>
                </div>
                <div className="flex justify-between sm:flex-col">
                  <span className="text-sm text-muted-foreground">មូលដ្ឋានទិន្នន័យ</span>
                  <span className="font-medium text-primary">បានភ្ជាប់</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                ផ្លាស់ប្តូរពាក្យសម្ងាត់
              </CardTitle>
              <CardDescription>
                គ្រប់គ្រងពាក្យសម្ងាត់ និងការកំណត់សុវត្ថិភាពរបស់អ្នក
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="sec-current-password">ពាក្យសម្ងាត់បច្ចុប្បន្ន</Label>
                  <Input
                    id="sec-current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sec-new-password">ពាក្យសម្ងាត់ថ្មី</Label>
                  <Input
                    id="sec-new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sec-confirm-password">បញ្ជាក់ពាក្យសម្ងាត់</Label>
                  <Input
                    id="sec-confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Data Tab */}
        <TabsContent value="references" className="space-y-4">
        {/* Training Categories Management */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 lg:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                <CardTitle className="text-base lg:text-lg">ប្រភេទ និងប្រភេទបណ្តុះបណ្តាល</CardTitle>
              </div>
              <div className="flex gap-2">
                <CategoryFormDialog mode="create" onSave={handleCreateCategory} />
                <TypeFormDialog mode="create" onSave={handleCreateType} />
              </div>
            </div>
            <CardDescription className="text-xs lg:text-sm">
              គ្រប់គ្រងប្រភេទ និងប្រភេទបណ្តុះបណ្តាល (អ្នកគ្រប់គ្រងជាន់ខ្ពស់ និងអ្នកគ្រប់គ្រង)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
              {/* Categories - Desktop Table */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xs lg:text-sm font-medium">ប្រភេទមុខវិជ្ជា</h3>

                {/* Desktop Table */}
                <div className="rounded-md border hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>កូដ</TableHead>
                        <TableHead>អង់គ្លេស</TableHead>
                        <TableHead>ខ្មែរ</TableHead>
                        <TableHead className="w-[100px]">សកម្មភាព</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.code}>
                          <TableCell className="font-mono text-xs">{category.code}</TableCell>
                          <TableCell>{category.name_en}</TableCell>
                          <TableCell>{category.name_km}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <CategoryFormDialog
                                mode="edit"
                                category={category}
                                onSave={(data) => handleUpdateCategory(category, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="category"
                                itemName={category.name_km}
                                onConfirm={() => handleDeleteCategory(category)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-2 lg:hidden">
                  {categories.map((category) => (
                    <div key={category.code} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{category.code}</span>
                        <div className="flex gap-1">
                          <CategoryFormDialog
                            mode="edit"
                            category={category}
                            onSave={(data) => handleUpdateCategory(category, data)}
                          />
                          <DeleteConfirmDialog
                            itemType="category"
                            itemName={category.name_km}
                            onConfirm={() => handleDeleteCategory(category)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">អង់គ្លេស</p>
                          <p className="font-medium">{category.name_en}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ខ្មែរ</p>
                          <p className="font-medium">{category.name_km}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Types */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xs lg:text-sm font-medium">ប្រភេទបណ្តុះបណ្តាល</h3>

                {/* Desktop Table */}
                <div className="rounded-md border hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>កូដ</TableHead>
                        <TableHead>អង់គ្លេស</TableHead>
                        <TableHead>ខ្មែរ</TableHead>
                        <TableHead className="w-[100px]">សកម្មភាព</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {types.map((type) => (
                        <TableRow key={type.code}>
                          <TableCell className="font-mono text-xs">{type.code}</TableCell>
                          <TableCell>{type.name_en}</TableCell>
                          <TableCell>{type.name_km}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <TypeFormDialog
                                mode="edit"
                                type={type}
                                onSave={(data) => handleUpdateType(type, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="type"
                                itemName={type.name_km}
                                onConfirm={() => handleDeleteType(type)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-2 lg:hidden">
                  {types.map((type) => (
                    <div key={type.code} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{type.code}</span>
                        <div className="flex gap-1">
                          <TypeFormDialog
                            mode="edit"
                            type={type}
                            onSave={(data) => handleUpdateType(type, data)}
                          />
                          <DeleteConfirmDialog
                            itemType="type"
                            itemName={type.name_km}
                            onConfirm={() => handleDeleteType(type)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">អង់គ្លេស</p>
                          <p className="font-medium">{type.name_en}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ខ្មែរ</p>
                          <p className="font-medium">{type.name_km}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 lg:mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 lg:p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-xs lg:text-sm text-blue-800 dark:text-blue-200">
                <strong>ចំណាំ៖</strong> ការផ្លាស់ប្តូរដែលធ្វើនៅទីនេះត្រូវបានរក្សាទុកក្នុងមូលដ្ឋានទិន្នន័យ។
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiary Positions & Departments */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 lg:pb-6">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              <CardTitle className="text-base lg:text-lg">មុខតំណែង និងនាយកដ្ឋានអ្នកទទួលផល</CardTitle>
            </div>
            <CardDescription className="text-xs lg:text-sm">
              គ្រប់គ្រងមុខតំណែង និងនាយកដ្ឋានសម្រាប់គ្រូបង្រៀន (អ្នកគ្រប់គ្រងជាន់ខ្ពស់ និងអ្នកគ្រប់គ្រង)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
              {/* Positions */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xs lg:text-sm font-medium">មុខតំណែង</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>កូដ</TableHead>
                        <TableHead>អង់គ្លេស</TableHead>
                        <TableHead>ខ្មែរ</TableHead>
                        <TableHead className="w-[100px]">សកម្មភាព</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position: any) => (
                        <TableRow key={position.code}>
                          <TableCell className="font-mono text-xs">{position.code}</TableCell>
                          <TableCell>{position.name_en}</TableCell>
                          <TableCell>{position.name_km}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <CategoryFormDialog
                                mode="edit"
                                category={position}
                                onSave={(data) => handleUpdatePosition(position, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="position"
                                itemName={position.name_km}
                                onConfirm={() => handleDeletePosition(position)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <CategoryFormDialog mode="create" onSave={handleCreatePosition} />
              </div>

              {/* Departments */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xs lg:text-sm font-medium">នាយកដ្ឋាន/មុខវិជ្ជា</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>កូដ</TableHead>
                        <TableHead>អង់គ្លេស</TableHead>
                        <TableHead>ខ្មែរ</TableHead>
                        <TableHead className="w-[100px]">សកម្មភាព</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept: any) => (
                        <TableRow key={dept.code}>
                          <TableCell className="font-mono text-xs">{dept.code}</TableCell>
                          <TableCell>{dept.name_en}</TableCell>
                          <TableCell>{dept.name_km}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <CategoryFormDialog
                                mode="edit"
                                category={dept}
                                onSave={(data) => handleUpdateDepartment(dept, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="department"
                                itemName={dept.name_km}
                                onConfirm={() => handleDeleteDepartment(dept)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <CategoryFormDialog mode="create" onSave={handleCreateDepartment} />
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Shield, Database, Globe, Type, Settings2 } from 'lucide-react';
import { useFont, KHMER_FONTS } from '@/contexts/FontContext';
import { useState } from 'react';
import { TRAINING_CATEGORIES, TRAINING_TYPES } from '@/types/training';
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
  const [categories, setCategories] = useState<Array<{ code: TrainingCategory; name_en: string; name_km: string }>>(
    TRAINING_CATEGORIES
  );
  const [types, setTypes] = useState<Array<{ code: TrainingType; name_en: string; name_km: string }>>(
    TRAINING_TYPES
  );

  // Category CRUD operations
  const handleCreateCategory = (data: { code: string; name_en: string; name_km: string }) => {
    // TODO: Replace with actual API call
    const newCategory = { ...data, code: data.code as TrainingCategory };
    setCategories([...categories, newCategory]);
    console.log('Create category:', data);
  };

  const handleUpdateCategory = (oldCode: TrainingCategory, data: { code: string; name_en: string; name_km: string }) => {
    // TODO: Replace with actual API call
    setCategories(categories.map(cat =>
      cat.code === oldCode ? { ...data, code: data.code as TrainingCategory } : cat
    ));
    console.log('Update category:', oldCode, data);
  };

  const handleDeleteCategory = (code: TrainingCategory) => {
    // TODO: Replace with actual API call
    setCategories(categories.filter(cat => cat.code !== code));
    console.log('Delete category:', code);
  };

  // Type CRUD operations
  const handleCreateType = (data: { code: string; name_en: string; name_km: string }) => {
    // TODO: Replace with actual API call
    const newType = { ...data, code: data.code as TrainingType };
    setTypes([...types, newType]);
    console.log('Create type:', data);
  };

  const handleUpdateType = (oldCode: TrainingType, data: { code: string; name_en: string; name_km: string }) => {
    // TODO: Replace with actual API call
    setTypes(types.map(t =>
      t.code === oldCode ? { ...data, code: data.code as TrainingType } : t
    ));
    console.log('Update type:', oldCode, data);
  };

  const handleDeleteType = (code: TrainingType) => {
    // TODO: Replace with actual API call
    setTypes(types.filter(t => t.code !== code));
    console.log('Delete type:', code);
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
                <Button variant="outline" size="sm">
                  ប្តូររូបភាព
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG ឬ GIF។ ទំហំអតិបរមា 2MB។
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">ឈ្មោះពេញ</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">អ៊ីមែល</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">លេខទូរស័ព្ទ</Label>
                <Input id="phone" defaultValue="+855 12 345 678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">តួនាទី</Label>
                <Input id="role" defaultValue={user?.role ? getRoleName(user.role) : ''} disabled />
              </div>
            </div>

            <div className="flex justify-end">
              <Button>រក្សាទុកការផ្លាស់ប្តូរ</Button>
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
                <Input id="current-password" type="password" />
              </div>
              <div className="hidden sm:block"></div>
              <div className="space-y-2">
                <Label htmlFor="new-password">ពាក្យសម្ងាត់ថ្មី</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">បញ្ជាក់ពាក្យសម្ងាត់</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline">ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <Database className="h-4 w-4 text-primary" />
              ព័ត៌មានប្រព័ន្ធ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs lg:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">កំណែ</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ</span>
              <span className="font-medium">ធ្នូ ២៣, ២០២៥</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">មូលដ្ឋានទិន្នន័យ</span>
              <span className="font-medium text-primary">បានភ្ជាប់</span>
            </div>
          </CardContent>
        </Card>

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
                                onSave={(data) => handleUpdateCategory(category.code, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="category"
                                itemName={category.name_km}
                                onConfirm={() => handleDeleteCategory(category.code)}
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
                            onSave={(data) => handleUpdateCategory(category.code, data)}
                          />
                          <DeleteConfirmDialog
                            itemType="category"
                            itemName={category.name_km}
                            onConfirm={() => handleDeleteCategory(category.code)}
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
                                onSave={(data) => handleUpdateType(type.code, data)}
                              />
                              <DeleteConfirmDialog
                                itemType="type"
                                itemName={type.name_km}
                                onConfirm={() => handleDeleteType(type.code)}
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
                            onSave={(data) => handleUpdateType(type.code, data)}
                          />
                          <DeleteConfirmDialog
                            itemType="type"
                            itemName={type.name_km}
                            onConfirm={() => handleDeleteType(type.code)}
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
                <strong>ចំណាំ៖</strong> ការផ្លាស់ប្តូរដែលធ្វើនៅទីនេះត្រូវបានរក្សាទុកក្នុងអង្គចងចាំរបស org រឺសាប្រព័ន្ធ។ ដើម្បីរក្សាទុកក្នុងមូលដ្ឋានទិន្នន័យ សូមប្រាកដថា API endpoints របស់អ្នកត្រូវបានភ្ជាប់សម្រាប់ការគ្រប់គ្រងប្រភេទ និងប្រភេទ។
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

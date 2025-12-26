import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MATERIAL_CATEGORIES } from '@/types/training';
import type { Training, TrainingMaterial, TrainingMaterialLink } from '@/types/training';
import {
  Search,
  Loader2,
  File,
  Link2,
  FileText,
  Video,
  Image,
  FileSpreadsheet,
  Presentation,
  Trash2,
  GripVertical,
  Copy,
} from 'lucide-react';

interface AttachMaterialsDialogProps {
  training: Training;
  trigger: React.ReactNode;
}

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

export function AttachMaterialsDialog({ training, trigger }: AttachMaterialsDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());

  // Fetch all materials
  const { data: allMaterials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.materials.getAll(),
    enabled: open,
  });

  // Fetch materials linked to this training
  const { data: linkedMaterials = [], isLoading: loadingLinked } = useQuery({
    queryKey: ['training-materials', training.id],
    queryFn: () => api.materials.getByTraining(training.id),
    enabled: open,
  });

  // Fetch all trainings for copy feature
  const { data: allTrainings = [] } = useQuery({
    queryKey: ['trainings'],
    queryFn: api.trainings.getAll,
    enabled: open,
  });

  // Get IDs of already linked materials
  const linkedMaterialIds = useMemo(() => {
    return new Set(linkedMaterials.map((link: TrainingMaterialLink) => link.material_id));
  }, [linkedMaterials]);

  // Filter available materials (not yet linked)
  const availableMaterials = useMemo(() => {
    return allMaterials.filter((material: TrainingMaterial) => {
      const notLinked = !linkedMaterialIds.has(material.id);
      const matchesSearch =
        material.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.title_km?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.file_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || material.category === categoryFilter;

      return notLinked && matchesSearch && matchesCategory;
    });
  }, [allMaterials, linkedMaterialIds, searchQuery, categoryFilter]);

  // Link materials mutation
  const linkMutation = useMutation({
    mutationFn: (materialIds: string[]) =>
      api.materials.linkToTraining(training.id, materialIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-materials', training.id] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setSelectedMaterialIds(new Set());
      toast({
        title: 'ជោគជ័យ',
        description: 'បានភ្ជាប់ឯកសារដោយជោគជ័យ',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការភ្ជាប់ឯកសារ',
        variant: 'destructive',
      });
    },
  });

  // Unlink material mutation
  const unlinkMutation = useMutation({
    mutationFn: (materialId: string) =>
      api.materials.unlinkFromTraining(training.id, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-materials', training.id] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានផ្តាច់ឯកសារដោយជោគជ័យ',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការផ្តាច់ឯកសារ',
        variant: 'destructive',
      });
    },
  });

  // Copy from another training
  const copyMutation = useMutation({
    mutationFn: (sourceTrainingId: string) =>
      api.materials.copyFrom(training.id, sourceTrainingId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['training-materials', training.id] });
      toast({
        title: 'ជោគជ័យ',
        description: `បានចម្លង ${data.count} ឯកសារ`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការចម្លង',
        variant: 'destructive',
      });
    },
  });

  const toggleMaterial = (materialId: string) => {
    const newSelected = new Set(selectedMaterialIds);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.add(materialId);
    }
    setSelectedMaterialIds(newSelected);
  };

  const handleLink = () => {
    if (selectedMaterialIds.size > 0) {
      linkMutation.mutate(Array.from(selectedMaterialIds));
    }
  };

  const handleCopyFrom = (sourceTrainingId: string) => {
    if (sourceTrainingId) {
      copyMutation.mutate(sourceTrainingId);
    }
  };

  // Other trainings that can be copied from
  const otherTrainings = allTrainings.filter(
    (t: Training) => t.id !== training.id
  );

  const isLoading = loadingMaterials || loadingLinked;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>គ្រប់គ្រងឯកសារ</DialogTitle>
          <DialogDescription>
            ភ្ជាប់ឯកសារពីបណ្ណាល័យទៅការបណ្តុះបណ្តាល "{training.training_name}"
          </DialogDescription>
        </DialogHeader>

        {/* Copy from another training */}
        {otherTrainings.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">ចម្លងពី:</span>
            <Select onValueChange={handleCopyFrom}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="ជ្រើសរើសការបណ្តុះបណ្តាល" />
              </SelectTrigger>
              <SelectContent>
                {otherTrainings.map((t: Training) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.training_name} ({t.training_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs defaultValue="linked" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linked">
              ឯកសារបានភ្ជាប់ ({linkedMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="library">
              បណ្ណាល័យ ({availableMaterials.length})
            </TabsTrigger>
          </TabsList>

          {/* Linked Materials Tab */}
          <TabsContent value="linked" className="mt-4">
            <ScrollArea className="h-[40vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : linkedMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">មិនមានឯកសារភ្ជាប់ទេ</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedMaterials.map((link: TrainingMaterialLink) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        {link.material && getMaterialIcon(link.material)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {link.material?.title_km || link.material?.title_en}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {link.material?.material_type === 'FILE' ? 'ឯកសារ' : 'តំណ'}
                          </Badge>
                          {link.material?.category && (
                            <span className="text-xs text-muted-foreground">
                              {MATERIAL_CATEGORIES.find(
                                (c) => c.code === link.material?.category
                              )?.name_km || link.material.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => unlinkMutation.mutate(link.material_id)}
                        disabled={unlinkMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-4">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ប្រភេទ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់</SelectItem>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name_km}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[35vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : availableMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">មិនមានឯកសារទេ</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableMaterials.map((material: TrainingMaterial) => (
                    <div
                      key={material.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMaterialIds.has(material.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleMaterial(material.id)}
                    >
                      <Checkbox
                        checked={selectedMaterialIds.has(material.id)}
                        onCheckedChange={() => toggleMaterial(material.id)}
                      />
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        {getMaterialIcon(material)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {material.title_km || material.title_en}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {material.material_type === 'FILE' ? 'ឯកសារ' : 'តំណ'}
                          </Badge>
                          {material.category && (
                            <span className="text-xs text-muted-foreground">
                              {MATERIAL_CATEGORIES.find(
                                (c) => c.code === material.category
                              )?.name_km || material.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedMaterialIds.size > 0 && (
              <div className="flex items-center justify-between mt-4 p-3 bg-primary/5 rounded-lg">
                <span className="text-sm">
                  បានជ្រើសរើស {selectedMaterialIds.size} ឯកសារ
                </span>
                <Button size="sm" onClick={handleLink} disabled={linkMutation.isPending}>
                  {linkMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  ភ្ជាប់ឯកសារ
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            បិទ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

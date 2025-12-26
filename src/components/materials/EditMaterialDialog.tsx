import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from '@/hooks/use-toast';
import { MATERIAL_CATEGORIES } from '@/types/training';
import type { TrainingMaterial } from '@/types/training';
import { Loader2, File, Link2 } from 'lucide-react';

interface EditMaterialDialogProps {
  material: TrainingMaterial;
  trigger: React.ReactNode;
}

export function EditMaterialDialog({ material, trigger }: EditMaterialDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form state
  const [titleEn, setTitleEn] = useState(material.title_en);
  const [titleKm, setTitleKm] = useState(material.title_km);
  const [descriptionEn, setDescriptionEn] = useState(material.description_en || '');
  const [descriptionKm, setDescriptionKm] = useState(material.description_km || '');
  const [category, setCategory] = useState(material.category || '');
  const [externalUrl, setExternalUrl] = useState(material.external_url || '');

  // Reset form when material changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitleEn(material.title_en);
      setTitleKm(material.title_km);
      setDescriptionEn(material.description_en || '');
      setDescriptionKm(material.description_km || '');
      setCategory(material.category || '');
      setExternalUrl(material.external_url || '');
    }
  }, [open, material]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      api.materials.update(material.id, {
        title_en: titleEn,
        title_km: titleKm,
        description_en: descriptionEn || undefined,
        description_km: descriptionKm || undefined,
        category: category || undefined,
        external_url: material.material_type === 'URL' ? externalUrl : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានកែសម្រួលឯកសារដោយជោគជ័យ',
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការកែសម្រួលឯកសារ',
        variant: 'destructive',
      });
    },
  });

  const canSubmit = () => {
    if (material.material_type === 'URL') {
      return titleEn.trim() && externalUrl.trim();
    }
    return titleEn.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit()) {
      updateMutation.mutate();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>កែសម្រួលឯកសារ</DialogTitle>
          <DialogDescription>កែសម្រួលព័ត៌មានលម្អិតរបស់ឯកសារ</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Current File/URL Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
            {material.material_type === 'FILE' ? (
              <>
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{material.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(material.file_size)} - ឯកសារ
                  </p>
                </div>
              </>
            ) : (
              <>
                <Link2 className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">តំណខាងក្រៅ</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {material.external_url}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {/* External URL (only for URL type) */}
            {material.material_type === 'URL' && (
              <div className="space-y-2">
                <Label htmlFor="externalUrl">តំណ URL *</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            )}

            {/* Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">ចំណងជើង (English) *</Label>
                <Input
                  id="titleEn"
                  placeholder="Material title"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleKm">ចំណងជើង (ខ្មែរ)</Label>
                <Input
                  id="titleKm"
                  placeholder="ចំណងជើងឯកសារ"
                  value={titleKm}
                  onChange={(e) => setTitleKm(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">ប្រភេទ</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name_km} ({cat.name_en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">ការពិពណ៌នា (English)</Label>
                <Textarea
                  id="descriptionEn"
                  placeholder="Description..."
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionKm">ការពិពណ៌នា (ខ្មែរ)</Label>
                <Textarea
                  id="descriptionKm"
                  placeholder="ការពិពណ៌នា..."
                  value={descriptionKm}
                  onChange={(e) => setDescriptionKm(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={!canSubmit() || updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              រក្សាទុក
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

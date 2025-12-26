import { useState, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MATERIAL_CATEGORIES } from '@/types/training';
import { Upload, Link2, File, X, Loader2 } from 'lucide-react';

interface CreateMaterialDialogProps {
  children: React.ReactNode;
}

export function CreateMaterialDialog({ children }: CreateMaterialDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [titleEn, setTitleEn] = useState('');
  const [titleKm, setTitleKm] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionKm, setDescriptionKm] = useState('');
  const [category, setCategory] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === 'file' && selectedFile) {
        return api.materials.upload(selectedFile, {
          title_en: titleEn || selectedFile.name,
          title_km: titleKm || selectedFile.name,
          description_en: descriptionEn,
          description_km: descriptionKm,
          category: category || undefined,
        });
      } else if (activeTab === 'url') {
        return api.materials.create({
          title_en: titleEn,
          title_km: titleKm,
          description_en: descriptionEn,
          description_km: descriptionKm,
          material_type: 'URL',
          external_url: externalUrl,
          category: category || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'ជោគជ័យ',
        description: 'បានបន្ថែមឯកសារដោយជោគជ័យ',
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'បរាជ័យ',
        description: error.message || 'មានបញ្ហាក្នុងការបន្ថែមឯកសារ',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitleEn('');
    setTitleKm('');
    setDescriptionEn('');
    setDescriptionKm('');
    setCategory('');
    setExternalUrl('');
    setSelectedFile(null);
    setActiveTab('file');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'ប្រភេទឯកសារមិនត្រឹមត្រូវ',
        description: 'សូមជ្រើសរើសឯកសារប្រភេទ PDF, Word, PowerPoint, Excel, រូបភាព ឬវីដេអូ',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'ឯកសារធំពេក',
        description: 'ទំហំឯកសារអតិបរមាគឺ 50MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    if (!titleEn && !titleKm) {
      setTitleEn(file.name);
      setTitleKm(file.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit = () => {
    if (activeTab === 'file') {
      return selectedFile !== null;
    }
    return titleEn.trim() && externalUrl.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit()) {
      uploadMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>បន្ថែមឯកសារថ្មី</DialogTitle>
          <DialogDescription>
            បញ្ចូលឯកសារថ្មីទៅក្នុងបណ្ណាល័យ ដើម្បីភ្ជាប់ជាមួយការបណ្តុះបណ្តាល
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                ផ្ទុកឯកសារ
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <Link2 className="h-4 w-4" />
                តំណខាងក្រៅ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4 mt-4">
              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      អូសនិងទម្លាក់ឯកសារនៅទីនេះ ឬ
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      ជ្រើសរើសឯកសារ
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, Word, PowerPoint, Excel, រូបភាព, វីដេអូ (អតិបរមា 50MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav"
                  onChange={handleFileInputChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
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
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">ចំណងជើង (English)</Label>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={!canSubmit() || uploadMutation.isPending}>
              {uploadMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {activeTab === 'file' ? 'ផ្ទុកឡើង' : 'បន្ថែម'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { TrainingCategory } from '@/types/training';

const categorySchema = z.object({
  code: z.string().min(2, 'កូដត្រូវមានយ៉ាងហោចណាស់ ២ តួអក្សរ').max(20).regex(/^[A-Z_]+$/, 'កូដត្រូវតែជាអក្សរធំ និងសញ្ញា underscore តែប៉ុណ្ណោះ'),
  name_en: z.string().min(2, 'ឈ្មោះអង់គ្លេសត្រូវបានទាមទារ').max(100),
  name_km: z.string().min(1, 'ឈ្មោះខ្មែរត្រូវបានទាមទារ').max(100),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  mode: 'create' | 'edit';
  category?: { code: TrainingCategory; name_en: string; name_km: string };
  onSave: (data: CategoryFormValues) => void;
  trigger?: React.ReactNode;
}

export function CategoryFormDialog({ mode, category, onSave, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = mode === 'edit';

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: category?.code || '',
      name_en: category?.name_en || '',
      name_km: category?.name_km || '',
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    onSave(data);
    toast({
      title: isEdit ? 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទ' : 'បានបង្កើតប្រភេទ',
      description: `${data.name_km} ត្រូវបាន${isEdit ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}ដោយជោគជ័យ។`,
    });
    setOpen(false);
    form.reset();
  };

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Pencil className="h-3 w-3" />
    </Button>
  ) : (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      បន្ថែមប្រភេទ
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{isEdit ? 'កែសម្រួលប្រភេទ' : 'បន្ថែមប្រភេទថ្មី'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រភេទខាងក្រោម។' : 'បញ្ចូលព័ត៌មានប្រភេទដើម្បីបន្ថែមទៅក្នុងប្រព័ន្ធ។'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>កូដ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ឧ. SCIENCE"
                      {...field}
                      disabled={isEdit}
                      className="font-mono uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ឈ្មោះអង់គ្លេស *</FormLabel>
                  <FormControl>
                    <Input placeholder="ឧ. Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ឈ្មោះខ្មែរ *</FormLabel>
                  <FormControl>
                    <Input placeholder="ឧ. វិទ្យាសាស្ត្រ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                បោះបង់
              </Button>
              <Button type="submit">
                {isEdit ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បង្កើត'}ប្រភេទ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

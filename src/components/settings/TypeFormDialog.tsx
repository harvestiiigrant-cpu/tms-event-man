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
import type { TrainingType } from '@/types/training';

const typeSchema = z.object({
  code: z.string().min(2, 'កូដត្រូវមានយ៉ាងហោចណាស់ ២ តួអក្សរ').max(20).regex(/^[A-Z_]+$/, 'កូដត្រូវតែជាអក្សរធំ និងសញ្ញា underscore តែប៉ុណ្ណោះ'),
  name_en: z.string().min(2, 'ឈ្មោះអង់គ្លេសត្រូវបានទាមទារ').max(100),
  name_km: z.string().min(1, 'ឈ្មោះខ្មែរត្រូវបានទាមទារ').max(100),
});

type TypeFormValues = z.infer<typeof typeSchema>;

interface TypeFormDialogProps {
  mode: 'create' | 'edit';
  type?: { code: TrainingType; name_en: string; name_km: string };
  onSave: (data: TypeFormValues) => void;
  trigger?: React.ReactNode;
}

export function TypeFormDialog({ mode, type, onSave, trigger }: TypeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = mode === 'edit';

  const form = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      code: type?.code || '',
      name_en: type?.name_en || '',
      name_km: type?.name_km || '',
    },
  });

  const onSubmit = (data: TypeFormValues) => {
    onSave(data);
    toast({
      title: isEdit ? 'បានធ្វើបច្ចុប្បន្នភាពប្រភេទបណ្តុះបណ្តាល' : 'បានបង្កើតប្រភេទបណ្តុះបណ្តាល',
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
    <Button size="sm" variant="outline">
      <Plus className="mr-2 h-4 w-4" />
      បន្ថែមប្រភេទបណ្តុះបណ្តាល
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{isEdit ? 'កែសម្រួលប្រភេទបណ្តុះបណ្តាល' : 'បន្ថែមប្រភេទបណ្តុះបណ្តាលថ្មី'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រភេទបណ្តុះបណ្តាលខាងក្រោម។' : 'បញ្ចូលព័ត៌មានប្រភេទបណ្តុះបណ្តាលដើម្បីបន្ថែមទៅក្នុងប្រព័ន្ធ។'}
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
                      placeholder="ឧ. WEBINAR"
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
                    <Input placeholder="ឧ. Webinar" {...field} />
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
                    <Input placeholder="ឧ. សិក្ខាសាលាតាមអ៊ីនធឺណិត" {...field} />
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
                {isEdit ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បង្កើត'}ប្រភេទបណ្តុះបណ្តាល
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

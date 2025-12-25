import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Beneficiary } from "@/types/training";

const beneficiarySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  sex: z.enum(["M", "F"], { required_error: "Please select gender" }),
  role: z.string().optional(),
  phone: z.string().regex(/^[0-9]{9,10}$/, "Phone must be 9-10 digits").optional().or(z.literal("")),
  province_name: z.string().min(1, "Province is required"),
  district_name: z.string().optional(),
  commune_name: z.string().optional(),
  village_name: z.string().optional(),
  school: z.string().min(1, "School is required"),
  school_id: z.string().optional(),
  position: z.string().optional(),
  subject: z.string().optional(),
  grade: z.coerce.number().min(1).max(12).optional(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

const PROVINCES = [
  "ភ្នំពេញ",
  "កណ្ដាល",
  "កំពង់ចាម",
  "កំពង់ធំ",
  "សៀមរាប",
  "បាត់ដំបង",
  "កំពត",
  "ព្រះសីហនុ",
];

const POSITIONS = [
  "Teacher",
  "Principal",
  "Vice Principal",
  "Department Head",
  "Coordinator",
];

const SUBJECTS = [
  "Khmer",
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Physical Education",
  "Arts",
  "IT",
];

interface BeneficiaryFormDialogProps {
  mode: "create" | "edit";
  beneficiary?: Beneficiary;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BeneficiaryFormDialog({ 
  mode, 
  beneficiary, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BeneficiaryFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const isEdit = mode === "edit";

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      sex: undefined,
      role: "",
      phone: "",
      province_name: "",
      district_name: "",
      commune_name: "",
      village_name: "",
      school: "",
      school_id: "",
      position: "",
      subject: "",
      grade: undefined,
    },
  });

  // Reset form with beneficiary data when editing
  useEffect(() => {
    if (isEdit && beneficiary && open) {
      form.reset({
        name: beneficiary.name || "",
        sex: beneficiary.sex,
        role: beneficiary.role || "",
        phone: beneficiary.phone || "",
        province_name: beneficiary.province_name || "",
        district_name: beneficiary.district_name || "",
        commune_name: beneficiary.commune_name || "",
        village_name: beneficiary.village_name || "",
        school: beneficiary.school || "",
        school_id: beneficiary.school_id || "",
        position: beneficiary.position || "",
        subject: beneficiary.subject || "",
        grade: beneficiary.grade,
      });
    }
  }, [isEdit, beneficiary, open, form]);

  const onSubmit = (data: BeneficiaryFormValues) => {
    console.log(`${isEdit ? "Updated" : "Created"} beneficiary:`, data);
    
    toast({
      title: isEdit ? "Beneficiary Updated" : "Beneficiary Created",
      description: `${data.name} has been ${isEdit ? "updated" : "added"} successfully.`,
    });

    setOpen(false);
    if (!isEdit) {
      form.reset();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !isEdit) {
      form.reset();
    }
  };

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Pencil className="mr-2 h-4 w-4" />
      Edit Details
    </Button>
  ) : (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Beneficiary
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{isEdit ? "Edit Beneficiary" : "Add New Beneficiary"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the participant's information below."
              : "Enter the participant's information to add them to the system."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="ឈ្មោះ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Male / ប្រុស</SelectItem>
                            <SelectItem value="F">Female / ស្រី</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Teacher" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Contact Details</h3>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Location</h3>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="province_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROVINCES.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder="District name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="commune_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commune</FormLabel>
                        <FormControl>
                          <Input placeholder="Commune name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="village_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <FormControl>
                          <Input placeholder="Village name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* School Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">School Assignment</h3>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="School name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="school_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SCH-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {POSITIONS.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(parseInt(val))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save Changes" : "Create Beneficiary"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

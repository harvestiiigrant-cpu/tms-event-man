import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { mockTrainings, mockBeneficiaries } from "@/data/mockData";
import type { Training, Beneficiary } from "@/types/training";

const enrollmentSchema = z.object({
  training_id: z.string().min(1, "Please select a training"),
  beneficiary_ids: z.array(z.string()).min(1, "Select at least one beneficiary"),
  training_role: z.enum(["PARTICIPANT", "TRAINER", "COORDINATOR"]),
  enrollment_type: z.string().min(1, "Enrollment type is required"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollBeneficiaryDialogProps {
  preselectedTrainingId?: string;
  preselectedBeneficiaryId?: string;
}

export function EnrollBeneficiaryDialog({ 
  preselectedTrainingId, 
  preselectedBeneficiaryId 
}: EnrollBeneficiaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>(
    preselectedBeneficiaryId ? [preselectedBeneficiaryId] : []
  );

  const availableTrainings = mockTrainings.filter(
    (t) => t.training_status !== "COMPLETED" && t.training_status !== "CANCELLED"
  );

  const filteredBeneficiaries = mockBeneficiaries.filter(
    (b) =>
      b.status === "ACTIVE" &&
      (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.name_english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.teacher_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      training_id: preselectedTrainingId || "",
      beneficiary_ids: preselectedBeneficiaryId ? [preselectedBeneficiaryId] : [],
      training_role: "PARTICIPANT",
      enrollment_type: "MANUAL",
    },
  });

  const toggleBeneficiary = (beneficiaryId: string) => {
    setSelectedBeneficiaries((prev) => {
      const newSelection = prev.includes(beneficiaryId)
        ? prev.filter((id) => id !== beneficiaryId)
        : [...prev, beneficiaryId];
      form.setValue("beneficiary_ids", newSelection);
      return newSelection;
    });
  };

  const onSubmit = (data: EnrollmentFormValues) => {
    const training = mockTrainings.find((t) => t.id === data.training_id);
    const enrolledNames = data.beneficiary_ids
      .map((id) => mockBeneficiaries.find((b) => b.teacher_id === id)?.name)
      .filter(Boolean)
      .join(", ");

    console.log("Enrollment data:", data);
    
    toast({
      title: "Enrollment Successful",
      description: `${data.beneficiary_ids.length} participant(s) enrolled in "${training?.training_name}"`,
    });

    setOpen(false);
    setSelectedBeneficiaries([]);
    setSearchQuery("");
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedBeneficiaries(preselectedBeneficiaryId ? [preselectedBeneficiaryId] : []);
      setSearchQuery("");
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll Participants
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Enroll Participants in Training</DialogTitle>
          <DialogDescription>
            Select a training and choose participants to enroll.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <FormField
              control={form.control}
              name="training_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a training" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTrainings.map((training) => (
                        <SelectItem key={training.id} value={training.id}>
                          <div className="flex flex-col">
                            <span>{training.training_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {training.training_location} • {training.current_participants}/{training.max_participants} enrolled
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="training_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PARTICIPANT">Participant</SelectItem>
                        <SelectItem value="TRAINER">Trainer</SelectItem>
                        <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enrollment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="QR">QR Code</SelectItem>
                        <SelectItem value="IMPORT">Import</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="beneficiary_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Select Participants *</FormLabel>
                  <FormDescription>
                    Search and select participants to enroll
                  </FormDescription>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {selectedBeneficiaries.length > 0 && (
                    <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-md">
                      {selectedBeneficiaries.map((id) => {
                        const beneficiary = mockBeneficiaries.find((b) => b.teacher_id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleBeneficiary(id)}
                          >
                            {beneficiary?.name}
                            <span className="ml-1">×</span>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <ScrollArea className="h-[200px] border rounded-md">
                    <div className="p-2 space-y-1">
                      {filteredBeneficiaries.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No participants found
                        </p>
                      ) : (
                        filteredBeneficiaries.map((beneficiary) => (
                          <div
                            key={beneficiary.teacher_id}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                              selectedBeneficiaries.includes(beneficiary.teacher_id)
                                ? "bg-accent"
                                : ""
                            }`}
                            onClick={() => toggleBeneficiary(beneficiary.teacher_id)}
                          >
                            <Checkbox
                              checked={selectedBeneficiaries.includes(beneficiary.teacher_id)}
                              onCheckedChange={() => toggleBeneficiary(beneficiary.teacher_id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{beneficiary.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {beneficiary.teacher_id} • {beneficiary.school} • {beneficiary.province_name}
                              </p>
                            </div>
                            {selectedBeneficiaries.includes(beneficiary.teacher_id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={selectedBeneficiaries.length === 0}>
                Enroll {selectedBeneficiaries.length > 0 && `(${selectedBeneficiaries.length})`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

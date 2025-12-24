import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, areIntervalsOverlapping } from "date-fns";
import { GraduationCap, Calendar, MapPin, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { mockTrainings } from "@/data/mockData";
import type { Training } from "@/types/training";

const enrollmentSchema = z.object({
  teacher_id: z.string().min(3, "Teacher ID is required"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{9,10}$/, "Phone must be 9-10 digits"),
  selected_trainings: z.array(z.string()).min(1, "Select at least one training"),
  accept_conflicts: z.boolean().optional(),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface ConflictInfo {
  training1: Training;
  training2: Training;
}

export default function PublicEnrollment() {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<EnrollmentFormValues | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTrainings = mockTrainings.filter(
    (t) => t.training_status === "ONGOING" || t.training_status === "DRAFT"
  );

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      teacher_id: "",
      name: "",
      phone: "",
      selected_trainings: [],
      accept_conflicts: false,
    },
  });

  const selectedTrainingIds = form.watch("selected_trainings");

  // Detect conflicts between selected trainings
  const conflicts = useMemo((): ConflictInfo[] => {
    const selected = availableTrainings.filter((t) =>
      selectedTrainingIds.includes(t.id)
    );
    const foundConflicts: ConflictInfo[] = [];

    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const t1 = selected[i];
        const t2 = selected[j];

        const overlap = areIntervalsOverlapping(
          { start: parseISO(t1.training_start_date), end: parseISO(t1.training_end_date) },
          { start: parseISO(t2.training_start_date), end: parseISO(t2.training_end_date) }
        );

        if (overlap) {
          foundConflicts.push({ training1: t1, training2: t2 });
        }
      }
    }

    return foundConflicts;
  }, [selectedTrainingIds, availableTrainings]);

  const hasConflicts = conflicts.length > 0;

  const toggleTraining = (trainingId: string) => {
    const current = form.getValues("selected_trainings");
    const updated = current.includes(trainingId)
      ? current.filter((id) => id !== trainingId)
      : [...current, trainingId];
    form.setValue("selected_trainings", updated, { shouldValidate: true });
  };

  const onSubmit = (data: EnrollmentFormValues) => {
    // If there are conflicts and user hasn't accepted them, show dialog
    if (hasConflicts && !data.accept_conflicts) {
      setPendingSubmission(data);
      setShowConflictDialog(true);
      return;
    }

    // Process submission
    console.log("Enrollment submitted:", data);
    
    toast({
      title: "Enrollment Successful!",
      description: `You have been enrolled in ${data.selected_trainings.length} training(s).`,
    });

    setIsSubmitted(true);
  };

  const handleConfirmWithConflicts = () => {
    if (pendingSubmission) {
      const dataWithAccept = { ...pendingSubmission, accept_conflicts: true };
      console.log("Enrollment submitted with conflicts:", dataWithAccept);
      
      toast({
        title: "Enrollment Successful!",
        description: `You have been enrolled in ${dataWithAccept.selected_trainings.length} training(s).`,
      });

      setIsSubmitted(true);
    }
    setShowConflictDialog(false);
    setPendingSubmission(null);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Enrollment Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for registering. You will receive a confirmation message shortly.
            </p>
            <Button onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}>
              Enroll in More Trainings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Training Enrollment</h1>
              <p className="text-sm text-muted-foreground">Self-registration portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Enter your details to enroll in trainings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="teacher_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., TCH-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="0XX XXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <FormField
                      control={form.control}
                      name="selected_trainings"
                      render={() => (
                        <FormItem>
                          <FormLabel>Selected Trainings *</FormLabel>
                          <FormDescription>
                            {selectedTrainingIds.length} training(s) selected
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {hasConflicts && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Schedule Conflict Detected</AlertTitle>
                        <AlertDescription>
                          {conflicts.length} conflict(s) found. You can still enroll but may miss sessions.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={selectedTrainingIds.length === 0}
                    >
                      Complete Enrollment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Available Trainings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Trainings</CardTitle>
                <CardDescription>
                  Select the trainings you want to enroll in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {availableTrainings.map((training) => {
                      const isSelected = selectedTrainingIds.includes(training.id);
                      const hasConflictWith = conflicts.find(
                        (c) => c.training1.id === training.id || c.training2.id === training.id
                      );
                      const isFull = training.current_participants >= training.max_participants;

                      return (
                        <div
                          key={training.id}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${isFull ? "opacity-60" : ""}`}
                          onClick={() => !isFull && toggleTraining(training.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              disabled={isFull}
                              onCheckedChange={() => !isFull && toggleTraining(training.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-medium text-foreground">
                                    {training.training_name}
                                  </h3>
                                  {training.training_name_english && (
                                    <p className="text-sm text-muted-foreground">
                                      {training.training_name_english}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {isSelected && hasConflictWith && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Conflict
                                    </Badge>
                                  )}
                                  {isFull && (
                                    <Badge variant="secondary">Full</Badge>
                                  )}
                                  <Badge variant="outline">
                                    {training.training_category}
                                  </Badge>
                                </div>
                              </div>

                              {training.training_description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {training.training_description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(parseISO(training.training_start_date), "MMM d")} - {format(parseISO(training.training_end_date), "MMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {training.training_location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {training.current_participants}/{training.max_participants} enrolled
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {availableTrainings.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          No trainings available for enrollment at this time.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conflict Confirmation Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Schedule Conflict Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                The following trainings have overlapping schedules:
              </p>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium text-foreground">
                      {conflict.training1.training_name}
                    </p>
                    <p className="text-muted-foreground">
                      conflicts with
                    </p>
                    <p className="font-medium text-foreground">
                      {conflict.training2.training_name}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm">
                You may not be able to attend all sessions. Do you want to proceed anyway?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSubmission(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWithConflicts}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

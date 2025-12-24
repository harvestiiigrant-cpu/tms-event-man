import { useState } from "react";
import { Link2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Training } from "@/types/training";

interface ShareEnrollmentLinkProps {
  training: Training;
  trigger?: React.ReactNode;
}

export function ShareEnrollmentLink({ training, trigger }: ShareEnrollmentLinkProps) {
  const [copied, setCopied] = useState(false);

  const enrollmentUrl = `${window.location.origin}/enroll?training=${training.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enrollmentUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Enrollment link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Link2 className="mr-2 h-4 w-4" />
            Share Enrollment Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Enrollment Link</DialogTitle>
          <DialogDescription>
            Share this link with participants to let them self-enroll in this training.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Training</Label>
            <p className="text-sm text-muted-foreground">
              {training.training_name}
              {training.training_name_english && (
                <span className="block">{training.training_name_english}</span>
              )}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="enrollment-link">Enrollment Link</Label>
            <div className="flex gap-2">
              <Input
                id="enrollment-link"
                value={enrollmentUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleCopy}
                variant={copied ? "default" : "secondary"}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Participants can use this link to register for this training. The training will be pre-selected on the enrollment form.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

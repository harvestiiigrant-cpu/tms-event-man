import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface Event {
  id: string;
  event_code: string;
  event_name: string;
  event_name_english?: string;
  current_attendees?: number;
}

interface CloneEventDialogProps {
  event: Event;
  trigger?: React.ReactNode;
  onCloneSuccess?: (clonedEvent: Event) => void;
}

export function CloneEventDialog({
  event,
  trigger,
  onCloneSuccess,
}: CloneEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeRegistrations, setIncludeRegistrations] = useState(false);
  const queryClient = useQueryClient();

  const handleCloneEvent = async () => {
    setLoading(true);

    try {
      const result = await api.events.clone(event.id, includeRegistrations);

      toast({
        title: 'Event Cloned Successfully',
        description: `"${event.event_name}" has been cloned. The new event is in DRAFT status.`,
      });

      // Invalidate events query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['events'] });

      setOpen(false);
      onCloneSuccess?.(result.event);
    } catch (error) {
      toast({
        title: 'Failed to Clone Event',
        description: error instanceof Error ? error.message : 'An error occurred while cloning the event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Copy className="mr-2 h-4 w-4" />
      Clone Event
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Event</DialogTitle>
          <DialogDescription>
            Create a duplicate of this event with the same settings and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium text-foreground">{event.event_name}</p>
            <p className="text-xs text-muted-foreground">Code: {event.event_code}</p>
          </div>

          {/* Clone Options */}
          <div className="space-y-3 border-t border-b py-4">
            <p className="text-sm font-medium">What should be cloned?</p>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="include-registrations"
                  checked={includeRegistrations}
                  onCheckedChange={(checked) => setIncludeRegistrations(!!checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="include-registrations" className="text-sm font-medium cursor-pointer">
                    Include registered attendees
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Copy all {event.current_attendees || 0} registered attendees to the new event
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 ml-6">
              <p>✓ Event details (name, dates, location, settings)</p>
              <p>✓ Sessions and schedule</p>
              <p>✓ Speakers and information</p>
              <p>✓ Materials and resources</p>
              <p>✓ GPS and geofence settings</p>
              <p>✓ New event created in DRAFT status</p>
              <p>✓ New unique event code generated</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium">New event will be created as DRAFT</p>
              <p>You can edit dates and other details before publishing.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCloneEvent} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Cloning...' : 'Clone Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Training } from '@/types/training';
import { TRAINING_CATEGORIES, TRAINING_TYPES, TRAINING_LEVELS } from '@/types/training';
import { TrainingStatusBadge } from './TrainingStatusBadge';
import { TrainingLevelBadge } from './TrainingLevelBadge';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useState } from 'react';

interface TrainingDetailsDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

export function TrainingDetailsDialog({ training, trigger }: TrainingDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const category = TRAINING_CATEGORIES.find(c => c.code === training.training_category);
  const type = TRAINING_TYPES.find(t => t.code === training.training_type);
  const level = TRAINING_LEVELS.find(l => l.code === training.training_level);

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <Eye className="mr-2 h-4 w-4" />
      View Details
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">{training.training_name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{training.training_code}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Status and Level */}
          <div className="flex items-center gap-2">
            <TrainingStatusBadge status={training.training_status} />
            <TrainingLevelBadge level={training.training_level} />
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-sm mt-1">{category?.name_km || category?.name_en}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm mt-1">{type?.name_km || type?.name_en}</p>
            </div>
          </div>

          {training.training_description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{training.training_description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Schedule */}
          <div>
            <p className="text-sm font-medium mb-3">Schedule</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Start:</span>
                <span>{format(new Date(training.training_start_date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">End:</span>
                <span>{format(new Date(training.training_end_date), 'PPP')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <p className="text-sm font-medium mb-3">Location</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{training.training_location}</span>
              </div>
              {training.training_venue && (
                <p className="text-sm text-muted-foreground pl-6">{training.training_venue}</p>
              )}
              {training.province_name && (
                <p className="text-sm text-muted-foreground pl-6">Province: {training.province_name}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Participants */}
          <div>
            <p className="text-sm font-medium mb-3">Participants</p>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{training.current_participants}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{training.max_participants} max</span>
            </div>
          </div>

          <Separator />

          {/* GPS & Geofence Settings */}
          <div>
            <p className="text-sm font-medium mb-3">Validation Settings</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {training.gps_validation_required ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>GPS Validation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {training.geofence_validation_required ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Geofence Validation</span>
                {training.geofence_validation_required && (
                  <span className="text-muted-foreground">({training.geofence_radius}m radius)</span>
                )}
              </div>
            </div>
          </div>

          {training.venue_latitude && training.venue_longitude && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">GPS Coordinates</p>
                <div className="text-sm font-mono bg-muted p-2 rounded">
                  {training.venue_latitude}, {training.venue_longitude}
                </div>
              </div>
            </>
          )}

          {training.cluster_schools && training.cluster_schools.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Cluster Schools</p>
                <div className="flex flex-wrap gap-2">
                  {training.cluster_schools.map((school, index) => (
                    <Badge key={index} variant="secondary">{school}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

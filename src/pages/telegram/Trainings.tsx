import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

export default function TelegramTrainings() {
  const { user } = useAuth();
  const { hideMainButton } = useTelegram();
  const [activeTab, setActiveTab] = useState('enrolled');

  // Fetch trainings
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings-enrolled', user?.teacher_id],
    queryFn: () => api.trainings.getEnrolled(user?.teacher_id!),
    enabled: !!user?.teacher_id,
  });

  useEffect(() => {
    hideMainButton?.();
  }, [hideMainButton]);

  if (isLoading) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TelegramLayout>
    );
  }

  const enrolledTrainings = trainings?.filter((t) => {
    const isEnrolled = t.beneficiary_trainings?.some((bt) => bt.beneficiary_id === user?.teacher_id);
    return isEnrolled && t.training_status !== 'COMPLETED';
  }) || [];

  const completedTrainings = trainings?.filter((t) => {
    const isEnrolled = t.beneficiary_trainings?.some((bt) => bt.beneficiary_id === user?.teacher_id && bt.certificate_issued);
    return isEnrolled && t.training_status === 'COMPLETED';
  }) || [];

  const TrainingCard = ({ training }: { training: any }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">
              {training.training_name}
            </CardTitle>
            {training.training_name_english && (
              <CardDescription className="text-xs mt-1">
                {training.training_name_english}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {training.training_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {training.training_level && (
            <p className="text-muted-foreground">
              Level: <span className="font-medium text-foreground">{training.training_level}</span>
            </p>
          )}
          {training.province_name && (
            <p className="text-muted-foreground">
              Location: <span className="font-medium text-foreground">{training.province_name}</span>
            </p>
          )}
          {training.training_start_date && (
            <p className="text-muted-foreground">
              Starts: <span className="font-medium text-foreground">
                {formatDistanceToNow(new Date(training.training_start_date), { addSuffix: true })}
              </span>
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <TelegramLayout title="My Trainings">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled">
            Enrolled ({enrolledTrainings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTrainings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-3 mt-4">
          {enrolledTrainings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center gap-3 text-center py-8">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No active trainings yet
                </p>
              </CardContent>
            </Card>
          ) : (
            enrolledTrainings.map((training) => (
              <TrainingCard key={training.id} training={training} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedTrainings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center gap-3 text-center py-8">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No completed trainings yet
                </p>
              </CardContent>
            </Card>
          ) : (
            completedTrainings.map((training) => (
              <TrainingCard key={training.id} training={training} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </TelegramLayout>
  );
}

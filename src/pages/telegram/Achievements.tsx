import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Download } from 'lucide-react';

export default function TelegramAchievements() {
  const { user } = useAuth();
  const { hideMainButton } = useTelegram();

  // Fetch trainings for certificates
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings-achievements', user?.teacher_id],
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

  const certificates = trainings?.filter((t) => {
    const enrollment = t.beneficiary_trainings?.find((bt) => bt.beneficiary_id === user?.teacher_id);
    return enrollment?.certificate_issued;
  }) || [];

  const totalHours = certificates.length * 16; // Assuming average training is 2 days x 8 hours
  const completionRate = trainings ? Math.round((certificates.length / trainings.length) * 100) : 0;

  return (
    <TelegramLayout title="Certificates & Achievements">
      <div className="space-y-4">
        {/* Summary Stats */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-50/50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{certificates.length}</p>
                <p className="text-xs text-yellow-700">Certificates</p>
              </div>
              <div className="text-center border-l border-r border-yellow-200">
                <p className="text-2xl font-bold text-yellow-600">{totalHours}</p>
                <p className="text-xs text-yellow-700">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{completionRate}%</p>
                <p className="text-xs text-yellow-700">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates List */}
        <div>
          <h3 className="font-semibold mb-3">Your Certificates</h3>
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center gap-3 text-center py-8">
                <Award className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No certificates earned yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete trainings to earn certificates
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {certificates.map((training) => {
                const enrollment = training.beneficiary_trainings?.find(
                  (bt) => bt.beneficiary_id === user?.teacher_id
                );
                return (
                  <Card key={training.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {training.training_name}
                          </CardTitle>
                          {enrollment?.certificate_issue_date && (
                            <CardDescription className="text-xs mt-1">
                              Issued:{' '}
                              {new Date(enrollment.certificate_issue_date).toLocaleDateString()}
                            </CardDescription>
                          )}
                        </div>
                        <Award className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        {certificates.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Badges & Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {completionRate >= 50 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">🌟</span>
                    <p className="text-sm font-medium text-blue-900">
                      Dedicated Learner
                    </p>
                  </CardContent>
                </Card>
              )}
              {certificates.length >= 3 && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">🏆</span>
                    <p className="text-sm font-medium text-purple-900">
                      Training Champion
                    </p>
                  </CardContent>
                </Card>
              )}
              {totalHours >= 50 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">⚡</span>
                    <p className="text-sm font-medium text-green-900">
                      50+ Hours
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </TelegramLayout>
  );
}

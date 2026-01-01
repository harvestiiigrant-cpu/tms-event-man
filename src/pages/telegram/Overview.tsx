import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Award, TrendingUp, LogOut } from 'lucide-react';

export default function TelegramOverview() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showMainButton, hideMainButton, hapticFeedback } = useTelegram();

  // Fetch beneficiary data
  const { data: beneficiary, isLoading: beneficiaryLoading } = useQuery({
    queryKey: ['beneficiary', user?.teacher_id],
    queryFn: () => api.beneficiaries.getById(user?.teacher_id!),
    enabled: !!user?.teacher_id,
  });

  // Fetch enrolled trainings for statistics
  const { data: trainings, isLoading: trainingsLoading } = useQuery({
    queryKey: ['trainings-enrolled', user?.teacher_id],
    queryFn: () => api.trainings.getEnrolled(user?.teacher_id!),
    enabled: !!user?.teacher_id,
  });

  // Setup main button
  useEffect(() => {
    showMainButton?.('View My Trainings', () => {
      hapticFeedback?.('light');
      navigate('/tg/trainings');
    });

    return () => {
      hideMainButton?.();
    };
  }, [showMainButton, hideMainButton, navigate, hapticFeedback]);

  if (beneficiaryLoading || trainingsLoading) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TelegramLayout>
    );
  }

  const enrolledCount = trainings?.filter((t) => t.beneficiary_trainings?.some((bt) => bt.beneficiary_id === user?.teacher_id))?.length || 0;
  const completedCount = trainings?.filter((t) => t.beneficiary_trainings?.some((bt) => bt.beneficiary_id === user?.teacher_id && bt.certificate_issued))?.length || 0;
  const attendanceRate = completedCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

  return (
    <TelegramLayout title="Profile Overview">
      <div className="space-y-4">
        {/* Profile Hero Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={beneficiary?.profile_image_url} alt={beneficiary?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {beneficiary?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{beneficiary?.name}</h2>
                <p className="text-sm text-muted-foreground">ID: {user?.teacher_id}</p>
                <p className="text-sm text-muted-foreground">{beneficiary?.school}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center flex-col gap-2">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <p className="text-2xl font-bold">{enrolledCount}</p>
                <p className="text-xs text-center text-muted-foreground">Trainings</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center flex-col gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-center text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center flex-col gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <p className="text-2xl font-bold">{attendanceRate}%</p>
                <p className="text-xs text-center text-muted-foreground">Completion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Info */}
        {beneficiary?.province_name && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Province: </span>
                <span className="font-medium">{beneficiary.province_name}</span>
              </p>
              {beneficiary.district_name && (
                <p>
                  <span className="text-muted-foreground">District: </span>
                  <span className="font-medium">{beneficiary.district_name}</span>
                </p>
              )}
              {beneficiary.school && (
                <p>
                  <span className="text-muted-foreground">School: </span>
                  <span className="font-medium">{beneficiary.school}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              hapticFeedback?.('light');
              navigate('/tg/achievements');
            }}
          >
            <Award className="mr-2 h-4 w-4" />
            View Certificates & Achievements
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              hapticFeedback?.('light');
              navigate('/tg/settings');
            }}
          >
            <span className="mr-2">⚙️</span>
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </TelegramLayout>
  );
}

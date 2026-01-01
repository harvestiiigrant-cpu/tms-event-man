import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/contexts/TelegramContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function TelegramAuth() {
  const navigate = useNavigate();
  const { isRunningInTelegram, initData, user, ready, expand } = useTelegram();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState('');
  const [step, setStep] = useState<'login' | 'link'>('login');

  useEffect(() => {
    ready?.();
    expand?.();
  }, [ready, expand]);

  // Auto-attempt login on mount if we have valid Telegram data
  useEffect(() => {
    if (isRunningInTelegram && initData && user && !isLoading) {
      attemptLogin(undefined);
    }
  }, [isRunningInTelegram, initData, user]);

  const attemptLogin = async (teacherIdOverride?: string) => {
    if (!initData || !user) {
      setError('Telegram data not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/telegram-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData,
          teacher_id: teacherIdOverride,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If new user and no teacher_id provided, show linking form
        if (response.status === 400 && data.error?.includes('teacher_id')) {
          setStep('link');
          setError(null);
          toast({
            title: 'Welcome to Training Management System!',
            description: 'Please link your Telegram account to your beneficiary profile',
          });
          setIsLoading(false);
          return;
        }

        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user info
      if (data.token) {
        login(data.token, data.user);

        toast({
          title: 'Welcome!',
          description: `សូមស្វាគមន៍ ${data.user.beneficiary?.name}`,
        });

        // Redirect to dashboard
        navigate('/tg/overview', { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      toast({
        title: 'Authentication Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim()) {
      setError('Please enter your teacher ID');
      return;
    }

    setIsLinking(true);
    try {
      await attemptLogin(teacherId);
    } finally {
      setIsLinking(false);
    }
  };

  if (!isRunningInTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Telegram Mini App</CardTitle>
            <CardDescription>
              This page must be accessed from within Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Not running in Telegram environment</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Authenticating with Telegram...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">TMS Training Portal</CardTitle>
          <CardDescription className="text-center">
            {step === 'link'
              ? 'Link Your Account'
              : 'Verify Your Identity'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 'link' && user && (
            <>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-2">Telegram User:</p>
                <p className="font-semibold">
                  {user.first_name} {user.last_name || ''}
                </p>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
              </div>

              <form onSubmit={handleLinkAccount} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="teacher_id">
                    Teacher ID / Beneficiary ID
                  </Label>
                  <Input
                    id="teacher_id"
                    placeholder="e.g., TCH-2024-001"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    disabled={isLinking}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLinking || !teacherId.trim()}
                  className="w-full h-11"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    'Link Account'
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                Don't know your Teacher ID? Contact your administrator.
              </p>
            </>
          )}

          {step === 'login' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Logging you in...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

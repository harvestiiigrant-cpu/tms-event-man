import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, getDefaultRedirectPath } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BrandHeader } from '@/components/branding/BrandHeader';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const redirectPath = getDefaultRedirectPath(user.role);
    navigate(redirectPath, { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      // Trim whitespace from username and password
      await login(data.username.trim(), data.password.trim());

      // Get user from localStorage to determine redirect
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const auth = JSON.parse(storedAuth);
        const user = auth.user;
        const redirectPath = location.state?.from || getDefaultRedirectPath(user.role);

        toast({
          title: 'ចូលប្រើប្រាស់ជោគជ័យ',
          description: `សូមស្វាគមន៍ ${user.name}!`,
        });

        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Official Branding */}
        <BrandHeader variant="full" />

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>ចូលគណនី</CardTitle>
            <CardDescription>បញ្ចូលព័ត៌មានសម្ងាត់របស់អ្នកដើម្បីចូលប្រើ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">ឈ្មោះអ្នកប្រើប្រាស់</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់"
                  autoComplete="username"
                  disabled={isLoading}
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">ពាក្យសម្ងាត់</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ភ្លេចពាក្យសម្ងាត់?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    កំពុងចូល...
                  </>
                ) : (
                  'ចូល'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              មិនទាន់មានគណនី?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                ចុះឈ្មោះនៅទីនេះ
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">គណនីសាកល្បង</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid gap-2">
              <div>
                <p className="font-medium">អ្នកគ្រប់គ្រង:</p>
                <p className="text-muted-foreground">Username: <code className="text-xs">admin</code> / Password: <code className="text-xs">admin123</code></p>
              </div>
              <div>
                <p className="font-medium">អ្នកគ្រប់គ្រងជាន់ខ្ពស់:</p>
                <p className="text-muted-foreground">Username: <code className="text-xs">superadmin</code> / Password: <code className="text-xs">super123</code></p>
              </div>
              <div>
                <p className="font-medium">គ្រូបង្រៀន:</p>
                <p className="text-muted-foreground">Username: <code className="text-xs">teacher001</code> / Password: <code className="text-xs">teacher123</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

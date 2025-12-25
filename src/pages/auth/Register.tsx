import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, getDefaultRedirectPath, UserRole } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BrandHeader } from '@/components/branding/BrandHeader';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[0-9]{9,15}$/, 'Phone number must be 9-15 digits'),
  role: z.enum(['ADMIN', 'BENEFICIARY'] as const),
  teacher_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'BENEFICIARY',
    },
  });

  const watchRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);

      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: data.role as UserRole,
        teacher_id: data.teacher_id,
      });

      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully!',
      });

      const redirectPath = getDefaultRedirectPath(data.role as UserRole);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Back to Login */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/login')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ត្រលប់ទៅការចូល
        </Button>

        {/* Official Branding */}
        <BrandHeader variant="full" />

        {/* Register Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>ចុះឈ្មោះ</CardTitle>
            <CardDescription>បំពេញព័ត៌មានដើម្បីបង្កើតគណនីរបស់អ្នក</CardDescription>
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

              {/* Account Type */}
              <div className="space-y-2">
                <Label htmlFor="role">ប្រភេទគណនី *</Label>
                <Select
                  value={watchRole}
                  onValueChange={(value) => setValue('role', value as 'ADMIN' | 'BENEFICIARY')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BENEFICIARY">គ្រូបង្រៀន / អ្នកទទួលផល</SelectItem>
                    <SelectItem value="ADMIN">អ្នកគ្រប់គ្រង</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              {/* Two Column Layout for Desktop */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">ឈ្មោះអ្នកប្រើប្រាស់ *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username123"
                    autoComplete="username"
                    disabled={isLoading}
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">អ៊ីមែល *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">ឈ្មោះពេញ *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="សុខ សុវណ្ណា or Sok Sovannak"
                    autoComplete="name"
                    disabled={isLoading}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">លេខទូរស័ព្ទ *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="012345678"
                    autoComplete="tel"
                    disabled={isLoading}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {/* Teacher ID (only for beneficiaries) */}
                {watchRole === 'BENEFICIARY' && (
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id">លេខសម្គាល់គ្រូ</Label>
                    <Input
                      id="teacher_id"
                      type="text"
                      placeholder="T001"
                      disabled={isLoading}
                      {...register('teacher_id')}
                    />
                    {errors.teacher_id && (
                      <p className="text-sm text-destructive">{errors.teacher_id.message}</p>
                    )}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">ពាក្យសម្ងាត់ *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">បញ្ជាក់ពាក្យសម្ងាត់ *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                ដោយចុះឈ្មោះ អ្នកយល់ព្រមតាមលក្ខខណ្ឌសេវាកម្ម និងគោលការណ៍ភាពឯកជន
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    កំពុងបង្កើតគណនី...
                  </>
                ) : (
                  'បង្កើតគណនី'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              មានគណនីរួចហើយ?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                ចូលនៅទីនេះ
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

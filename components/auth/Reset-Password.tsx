'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useResetPassword } from '@/lib/queries';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  reset_token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.new_password.length >= 8, {
  message: "Password must be at least 8 characters long",
  path: ['new_password'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('new_password');

  // Get reset token from URL params
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token) {
      setValue('reset_token', token);
    }
    
    if (email) {
      setValue('email', email);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync(data);
      setIsSuccess(true);
      toast.success('Password reset successfully!', {
        description: 'You can now login with your new password.',
        duration: 5000,
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error('Failed to reset password', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0872b3] to-white py-8 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="text-center px-8 pt-8 pb-4 bg-white">
            <Image
              src="/logo/logo.png"
              alt="Imotrak Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-[#0872b3] mb-2">
              Imotarak System
            </h1>
          </div>

          {/* Success Content */}
          <div className="px-8 py-8 bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Password Reset Successful!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              
              <Link href="/login" className="block">
                <Button className="w-full bg-[#0872b3] hover:bg-[#065d8f] text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 bg-[#f8f9fa] border-t border-[#0872b3]/20">
            <p className="text-[#0872b3] text-sm m-0">
              &copy; {new Date().getFullYear()} Imotrak - Imotrak System
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0872b3] to-white py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-4 bg-white">
          <Image
            src="/logo/logo.png"
            alt="Imotrak Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-[#0872b3] mb-2">
            Imotrak System
          </h1>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8 bg-white">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#0872b3] mb-2 text-center">
              Reset Your Password
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Enter your email and new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block mb-2 text-[#0872b3] font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                {...register('email')}
                disabled={resetPasswordMutation.isPending}
              />
              {errors.email && (
                <Alert className="mt-2" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="new_password" className="block mb-2 text-[#0872b3] font-medium">
                <Lock className="w-4 h-4 inline mr-2" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20 pr-12"
                  {...register('new_password')}
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0872b3] hover:text-[#065d8f] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={resetPasswordMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <Alert className="mt-2" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.new_password.message}</AlertDescription>
                </Alert>
              )}
              
              {/* Password strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Password strength:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          newPassword.length < 8 ? 'bg-red-400 w-1/4' :
                          newPassword.length < 12 ? 'bg-yellow-400 w-2/4' :
                          'bg-green-400 w-full'
                        }`}
                      />
                    </div>
                    <span className={`font-medium ${
                      newPassword.length < 8 ? 'text-red-600' :
                      newPassword.length < 12 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {newPassword.length < 8 ? 'Weak' :
                       newPassword.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden reset token field */}
            <input type="hidden" {...register('reset_token')} />
            {errors.reset_token && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.reset_token.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#0872b3] hover:underline">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 bg-[#f8f9fa] border-t border-[#0872b3]/20">
          <p className="text-[#0872b3] text-sm m-0">
            &copy; {new Date().getFullYear()} Imotrak - Imotrak System
          </p>
        </div>
      </div>
    </div>
  );
}
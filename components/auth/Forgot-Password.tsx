'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useForgotPassword } from '@/lib/queries';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setIsEmailSent(true);
      toast.success('Reset link sent successfully!', {
        description: 'Please check your email for the password reset link.',
        duration: 5000,
      });
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error('Failed to send reset link', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  const handleTryAnotherEmail = () => {
    setIsEmailSent(false);
    reset();
  };

  if (isEmailSent) {
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

          {/* Success Content */}
          <div className="px-8 py-8 bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Check your email
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-[#0872b3]">{getValues('email')}</span>
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Didn&apos;t receive the email?</strong> Check your spam folder or try again with a different email address.
                  </p>
                </div>
                
                <Button
                  onClick={handleTryAnotherEmail}
                  variant="outline"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                >
                  Try another email
                </Button>
                
                <Link href="/login" className="block">
                  <Button className="w-full bg-[#0872b3] hover:bg-[#065d8f] text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
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
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block mb-2 text-[#0872b3] font-medium">
                <Mail className="w-4 h-4 inline mr-2" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                {...register('email')}
                disabled={forgotPasswordMutation.isPending}
              />
              {errors.email && (
                <Alert className="mt-2" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send reset link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link href="/login" className="text-sm text-[#0872b3] hover:underline block">
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
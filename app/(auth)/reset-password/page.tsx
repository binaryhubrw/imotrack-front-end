"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faKey,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useResetPassword } from "@/lib/queries";

// Main Reset Password Form Component
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const resetPassword = useResetPassword();

  // Check if token and email are present
  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      toast.error("Invalid reset link", {
        description: "The reset link is invalid or has expired",
        duration: 4000,
      });
    }
  }, [token, email]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validatePassword(password)) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long",
        duration: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are identical",
        duration: 4000,
      });
      return;
    }

    try {
      // await resetPassword.mutateAsync({ 
      //   // token: token!,
      //   email: email!,
      //   // password 
      // });
      setIsSubmitted(true);
      toast.success("Password reset successfully!", {
        description: "You can now login with your new password",
        duration: 4000,
      });
    } catch (error) {
      // Error handling is already done in the mutation
      console.error("Error resetting password:", error);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  // Invalid token state
  if (!tokenValid) {
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

          {/* Error Content */}
          <div className="px-8 py-8 bg-white text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-xl" />
            </div>
            
            <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/login"
                className="block w-full py-3 border-2 border-[#0872b3] text-[#0872b3] rounded-md font-medium text-base text-center transition hover:bg-[#0872b3] hover:text-white hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Login
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

        {/* Main Content */}
        <div className="px-8 py-8 bg-white">
          {!isSubmitted ? (
            <>
              {/* Reset Password Form */}
              <h2 className="text-xl font-semibold text-[#0872b3] mb-2 text-center flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} /> Set New Password
              </h2>
              
              <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
                Enter your new password below. Make sure it&apos;s strong and secure.
              </p>

              {/* User Email Display */}
              <div className="bg-[#0872b3]/5 border border-[#0872b3]/20 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Resetting password for:</p>
                <p className="text-[#0872b3] font-medium text-sm break-all">{email}</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* New Password Input */}
                <div className="mb-4">
                  <label
                    className="block mb-2 text-[#0872b3] font-medium"
                    htmlFor="password"
                  >
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={resetPassword.isPending}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#0872b3] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={resetPassword.isPending}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div className="mb-6">
                  <label
                    className="block mb-2 text-[#0872b3] font-medium"
                    htmlFor="confirmPassword"
                  >
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={resetPassword.isPending}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#0872b3] transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={resetPassword.isPending}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Updating Password...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faKey} /> Reset Password
                    </>
                  )}
                </button>

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-[#0872b3] hover:text-[#065d8f] transition-colors text-sm font-medium"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                </div>

                <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
                  Password Reset Complete
                </h2>
                
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Your password has been successfully updated. You can now login with your new password.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 text-xs font-medium">
                      🔒 Your account is now secure with the new password
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base transition hover:bg-[#065d8f] hover:-translate-y-0.5"
                >
                  Continue to Login
                </button>
              </div>
            </>
          )}
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

// Loading fallback component
function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0872b3] to-white py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="text-center px-8 pt-8 pb-4 bg-white">
          <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
        </div>
        <div className="px-8 py-8 bg-white">
          <Skeleton className="h-6 w-32 mx-auto mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
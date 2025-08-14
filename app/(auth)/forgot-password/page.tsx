"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faArrowLeft,
  faSpinner,
  faPaperPlane,
  faCheck,
  faEnvelope,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useForgotPassword } from "@/lib/queries";

// Main Forgot Password Form Component
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword.mutateAsync({ email });
      setIsSubmitted(true);
    } catch (error) {
      // Error handling is already done in the mutation
      console.error("Error sending reset link:", error);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
  };

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
                <FontAwesomeIcon icon={faKey} /> Reset Password
              </h2>

              <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
                Enter your email address and we&apos;ll send you a secure link
                to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="mb-6">
                  <label
                    className="block mb-2 text-[#0872b3] font-medium"
                    htmlFor="email"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={forgotPassword.isPending}
                  />
                </div>

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  className="w-full py-3 cursor-pointer bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  disabled={forgotPassword.isPending}
                >
                  {forgotPassword.isPending ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} /> Send Reset Link
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
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-white text-xl"
                  />
                </div>

                <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
                  Check Your Email
                </h2>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    We&apos;ve sent a password reset link to:
                  </p>
                  <div className="bg-[#0872b3]/5 border border-[#0872b3]/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center gap-2 text-[#0872b3] font-medium">
                      <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                      <span className="break-all">{email}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Please check your email inbox and follow the instructions to
                    reset your password. The link will expire in 24 hours for
                    security reasons.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleTryAgain}
                    className="w-full py-3 cursor-pointer bg-[#0872b3] text-white rounded-md font-medium text-base transition hover:bg-[#065d8f] hover:-translate-y-0.5"
                    disabled={forgotPassword.isPending}
                  >
                    Try Different Email
                  </button>

                  <Link
                    href="/login"
                    className="block w-full py-3 border-2 border-[#0872b3] text-[#0872b3] rounded-md font-medium text-base text-center transition hover:bg-[#0872b3] hover:text-white hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Login
                  </Link>
                </div>
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
function ForgotPasswordFallback() {
  return (
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
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

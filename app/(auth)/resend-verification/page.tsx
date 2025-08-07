"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSpinner,
  faCheck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useResendVerification } from "@/lib/queries";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resendVerification = useResendVerification();

  // Pre-fill email if available in localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("verification_email");
    if (storedEmail && !email) {
      setEmail(storedEmail);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await resendVerification.mutateAsync({ email });
      setIsSubmitted(true);
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Resend verification failed:", error);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (isSubmitted) {
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
          <div className="px-8 py-8 bg-white text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
            </div>

            <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
              Verification Email Sent!
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We&apos;ve sent a new verification link to{" "}
              <strong>{email}</strong>. Please check your email and follow the
              instructions to verify your account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-blue-700 text-xs">
                💡 Don&apos;t see the email? Check your spam/junk folder
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="block w-full py-3 cursor-pointer bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5"
              >
                Send Another Email
              </button>

              <Link
                href="/login"
                className="block w-full py-3 bg-gray-500 text-white rounded-md font-medium text-base text-center transition hover:bg-gray-600 hover:-translate-y-0.5"
              >
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

        {/* Form Content */}
        <div className="px-8 py-8 bg-white">
          <h2 className="text-xl font-semibold text-[#0872b3] mb-2 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} /> Resend Verification
          </h2>

          <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
            Enter your email address to receive a new verification link.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-6">
              <label
                className="block mb-2 text-[#0872b3] font-medium"
                htmlFor="email"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={resendVerification.isPending}
              />
              {email && !validateEmail(email) && (
                <p className="text-xs text-indigo-500 mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 cursor-pointer bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              disabled={
                resendVerification.isPending || !email || !validateEmail(email)
              }
            >
              {resendVerification.isPending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Sending Email...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEnvelope} /> Send Verification Email
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

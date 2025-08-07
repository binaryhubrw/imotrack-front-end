"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheck,
  faExclamationTriangle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifyEmail, useResendVerification } from "@/lib/queries";

// Main Verify Email Component
function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error" | "already-verified"
  >("pending");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAttemptedVerification, setHasAttemptedVerification] =
    useState(false);
  const [userEmail, setUserEmail] = useState("");

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  // Verify email on mount if token is present
  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasAttemptedVerification) {
      return;
    }

    if (!token) {
      setVerificationStatus("error");
      toast.error("Invalid verification link", {
        description: "The verification link is invalid or missing",
        duration: 4000,
      });
      return;
    }

    // Try to get email from localStorage if available
    const storedEmail = localStorage.getItem("verification_email");
    if (storedEmail && !userEmail) {
      setUserEmail(storedEmail);
      console.log("Loaded email from localStorage:", storedEmail);
    }

    // Mark that we've attempted verification to prevent re-runs
    setHasAttemptedVerification(true);

    const verifyUserEmail = async () => {
      try {
        console.log("Starting email verification with token:", token);
        const result = await verifyEmail.mutateAsync({ token });
        console.log("Email verification result:", result);

        setVerificationStatus("success");

        // Show success message
        toast.success("Email verified successfully!", {
          description: "Redirecting to password setup...",
          duration: 3000,
        });

        // Store the verification token for use in set-password page
        if (result.token) {
          localStorage.setItem("verification_token", result.token);
          console.log("Verification token stored successfully");
        } else {
          console.warn("No token received from verification API");
        }

        // Store the user's email for resend verification functionality
        // Note: Backend doesn't return email, so we'll need to get it from the token or other means
        if (result.email) {
          setUserEmail(result.email);
          localStorage.setItem("verification_email", result.email);
          console.log(
            "User email stored for resend verification:",
            result.email
          );
        } else {
          console.log(
            "No email returned from verification API - this is expected"
          );
          // Try to extract email from token if possible
          try {
            const tokenPayload = JSON.parse(atob(result.token.split(".")[1]));
            if (tokenPayload.email) {
              setUserEmail(tokenPayload.email);
              localStorage.setItem("verification_email", tokenPayload.email);
              console.log("Email extracted from token:", tokenPayload.email);
            }
          } catch {
            console.log("Could not extract email from token");
          }
        }

        // Redirect to set-password page after a short delay
        setTimeout(() => {
          console.log("Redirecting to set-password page...");
          setIsRedirecting(true);
          router.push(`/set-password?token=${token}`);
        }, 2000);
      } catch (error: unknown) {
        console.error("Email verification failed:", error);
        const axiosError = error as {
          message?: string;
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        // Check for already verified status
        if (
          axiosError.response?.status === 409 ||
          axiosError.message?.includes("already verified") ||
          axiosError.response?.data?.message?.includes("already verified")
        ) {
          setVerificationStatus("already-verified");
          toast.info("Email is already verified", {
            description: "You can now login with your account",
            duration: 4000,
          });
        } else if (axiosError.response?.status === 401) {
          // 401 might be expected for verification calls, don't show error
          console.log(
            "401 error on verification call - this might be expected"
          );
          setVerificationStatus("error");
        } else {
          setVerificationStatus("error");
          toast.error("Verification failed", {
            description:
              axiosError.response?.data?.message ||
              axiosError.message ||
              "Failed to verify email",
            duration: 4000,
          });
        }
      }
    };

    verifyUserEmail();
  }, [token, verifyEmail, router, hasAttemptedVerification, userEmail]);

  // Loading state while verifying email
  if (verificationStatus === "pending") {
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

          {/* Loading Content */}
          <div className="px-8 py-8 bg-white text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0872b3] to-[#065d8f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-white text-xl"
              />
            </div>

            <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
              Verifying Your Email
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Please wait while we verify your email address...
            </p>
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

  // Error state - invalid or expired token
  if (verificationStatus === "error") {
    const handleResendVerification = async () => {
      // Try to get email from state or localStorage
      const emailToUse =
        userEmail || localStorage.getItem("verification_email");

      if (!emailToUse) {
        toast.error("Email not found", {
          description:
            "Unable to determine email address for resending verification. Please try the resend verification page.",
          duration: 4000,
        });
        return;
      }

      try {
        await resendVerification.mutateAsync({ email: emailToUse });
      } catch (error) {
        // Error is already handled in the mutation
        console.error("Resend verification failed:", error);
      }
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

          {/* Error Content */}
          <div className="px-8 py-8 bg-white text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-white text-xl"
              />
            </div>

            <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
              Verification Failed
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              This verification link is invalid or has expired. You can request
              a new verification email or contact your administrator.
            </p>

            <div className="space-y-3">
              {(userEmail || localStorage.getItem("verification_email")) && (
                <>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendVerification.isPending}
                    className="block w-full py-3 cursor-pointer bg-green-600 text-white rounded-md font-medium text-base text-center transition hover:bg-green-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendVerification.isPending ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="mr-2"
                        />
                        Sending...
                      </>
                    ) : (
                      <>Resend Verification Email</>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">
                    Sending to:{" "}
                    {userEmail || localStorage.getItem("verification_email")}
                  </p>
                </>
              )}

              {!(userEmail || localStorage.getItem("verification_email")) && (
                <Link
                  href="/resend-verification"
                  className="block w-full py-3 bg-green-600 text-white rounded-md font-medium text-base text-center transition hover:bg-green-700 hover:-translate-y-0.5"
                >
                  Resend Verification Email
                </Link>
              )}

              <Link
                href="/login"
                className="block w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5"
              >
                Go to Login
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

  // Already verified state
  if (verificationStatus === "already-verified") {
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

          {/* Already Verified Content */}
          <div className="px-8 py-8 bg-white text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
            </div>

            <h2 className="text-xl font-semibold text-[#0872b3] mb-2">
              Email Already Verified
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Your email has already been verified. You can now login to your
              account.
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5"
              >
                Continue to Login
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

  // Success state - redirecting to set-password
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
            Email Verified Successfully!
          </h2>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Your email has been verified. You will be redirected to set your
            password in a moment.
          </p>

          {isRedirecting && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-[#0872b3]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                <span className="text-sm">
                  Redirecting to password setup...
                </span>
              </div>

              <Link
                href={`/set-password?token=${token}`}
                className="block w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                Continue to Set Password
              </Link>
            </div>
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
function VerifyEmailFallback() {
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

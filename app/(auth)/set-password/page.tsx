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
import { useSetPasswordAndVerify } from "@/lib/queries";

// Main Set Password Form Component
function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  const setPasswordAndVerify = useSetPasswordAndVerify();

  // Initialize page and check for verification token
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) {
      return;
    }

    console.log("Set password page initializing with token:", token);

    if (!token) {
      console.error("No token provided in URL");
      setPageStatus("error");
      toast.error("Invalid verification link", {
        description: "The verification link is invalid or missing",
        duration: 4000,
      });
      setHasInitialized(true);
      return;
    }

    // Check if verification token exists in localStorage
    const verificationToken = localStorage.getItem("verification_token");
    console.log(
      "Verification token in localStorage:",
      verificationToken ? "exists" : "missing"
    );

    if (!verificationToken) {
      console.error("No verification token found, redirecting to verify page");
      setPageStatus("error");
      toast.error("Verification required", {
        description: "Please complete email verification first",
        duration: 4000,
      });
      // Redirect back to verification page
      setTimeout(() => {
        router.push(`/verify?token=${token}`);
      }, 2000);
      setHasInitialized(true);
      return;
    }

    // All checks passed, page is ready
    console.log("All checks passed, setting page to ready");
    setPageStatus("ready");
    setHasInitialized(true);
  }, [token, router, hasInitialized]);

  // Cleanup verification token when component unmounts or on successful submission
  useEffect(() => {
    return () => {
      // Only clear if user successfully submitted or navigated away
      if (isSubmitted) {
        localStorage.removeItem("verification_token");
        localStorage.removeItem("verification_email");
      }
    };
  }, [isSubmitted]);

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

    // Get the verification token from localStorage
    const verificationToken = localStorage.getItem("verification_token");
    if (!verificationToken) {
      toast.error("Verification token not found", {
        description: "Please go back to the verification link and try again",
        duration: 4000,
      });
      router.push(`/verify?token=${token}`);
      return;
    }

    try {
      console.log("Attempting to set password...");
      await setPasswordAndVerify.mutateAsync({ password });
      console.log("Password set successfully");

      // Clear the verification token after successful password setting
      localStorage.removeItem("verification_token");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error setting password:", error);
      // Error handling is already done in the mutation
    }
  };

  const handleGoToLogin = () => {
    // Clean up any remaining tokens
    localStorage.removeItem("verification_token");
    localStorage.removeItem("verification_email");
    router.push("/login");
  };

  // Loading state while checking verification status
  if (pageStatus === "loading") {
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
              Checking Verification Status
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Please wait while we verify your session...
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

  // Error state - invalid token or verification required
  if (pageStatus === "error") {
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
              Verification Required
            </h2>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Please complete email verification first before setting your
              password.
            </p>

            <div className="space-y-3">
              {token && (
                <Link
                  href={`/verify?token=${token}`}
                  className="block w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base text-center transition hover:bg-[#065d8f] hover:-translate-y-0.5"
                >
                  Verify Email First
                </Link>
              )}
              <Link
                href="/login"
                className="block w-full py-3 bg-gray-500 text-white rounded-md font-medium text-base text-center transition hover:bg-gray-600 hover:-translate-y-0.5"
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
              {/* Set Password Form */}
              <h2 className="text-xl font-semibold text-[#0872b3] mb-2 text-center flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} /> Set Your Password
              </h2>

              <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
                Your email has been verified successfully! Now set a strong
                password to complete your account setup.
              </p>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-green-600 text-sm"
                  />
                  <p className="text-green-700 text-xs font-medium">
                    Email verified successfully
                  </p>
                </div>
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
                      disabled={setPasswordAndVerify.isPending}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#0872b3] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={setPasswordAndVerify.isPending}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
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
                      disabled={setPasswordAndVerify.isPending}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#0872b3] transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={setPasswordAndVerify.isPending}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                </div>

                {/* Set Password Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  disabled={setPasswordAndVerify.isPending}
                >
                  {setPasswordAndVerify.isPending ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Setting
                      Password...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faKey} /> Set Password
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
                  Account Setup Complete
                </h2>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Your account has been verified and your password has been
                    set successfully. You can now login to your account.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 text-xs font-medium">
                      🎉 Your account is now ready to use
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
function SetPasswordFallback() {
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

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordFallback />}>
      <SetPasswordForm />
    </Suspense>
  );
}

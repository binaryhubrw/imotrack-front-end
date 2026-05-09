"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faUserLock,
  faSpinner,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/types/next-auth";
import { toast } from "sonner";
import { toastStyles } from "@/lib/toast-config";
import { Skeleton } from "@/components/ui/skeleton";

// Position Selection Modal Component
function PositionSelectionModal({
  positions,
  onSelectPosition,
  onCancel,
  isLoading,
}: {
  positions: Array<{
    position_id: string;
    position_name: string;
    unit_id: string;
    unit_name: string;
    organisation_id: string;
    organization_name: string;
  }>;
  onSelectPosition: (positionId: string, positionName: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Select Position
              </h3>
              <p className="text-sm text-gray-500">
                Choose your role to continue
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 cursor-pointer hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
            aria-label="Close"
            title="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {positions.map((position) => (
            <button
              key={position.position_id}
              onClick={() =>
                onSelectPosition(position.position_id, position.position_name)
              }
              disabled={isLoading}
              className="w-full p-4 cursor-pointer text-left border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-[#0872b3] transition-colors flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Role:
                    </span>
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-[#0872b3]/10 text-[#0872b3] font-semibold">
                      {position.position_name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      Unit:
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-medium border border-blue-200 mr-2">
                      {position.unit_name}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Organization:
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 font-medium border border-green-200">
                      {position.organization_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0872b3] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-[#0872b3] opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 cursor-pointer border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Login Form Component
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const {
    login,
    selectPosition,
    isLoading,
    positions,
    showPositionSelector,
    cancelPositionSelection,
  } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const credentials: LoginCredentials = { email, password };
      const positionsResult = await login(credentials);

      // Automatic redirect logic
      if (positionsResult && positionsResult.length === 1) {
        // Only one position, select it automatically
        const pos = positionsResult[0];
        await selectPosition(pos.position_id, positionsResult);
        toast.success(`Login successful! Redirecting to ${pos.position_name} dashboard...`, {
          style: toastStyles.success.style,
          duration: toastStyles.success.duration,
        });
        // router.push('/dashboard'); // selectPosition already redirects
      } else if (positionsResult && positionsResult.length === 0) {
        const msg =
          "Your account has no position assigned. Please contact your administrator.";
        toast.error("Login blocked", {
          description: msg,
          style: toastStyles.error.style,
          duration: toastStyles.error.duration,
        });
        setError(msg);
        return;
      } else {
        console.log("positionsResult", positionsResult);
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      let errorMessage = "Invalid email or password";

      if (err && typeof err === "object" && "response" in err) {
        const error = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (err instanceof Error) {
        if (err.message === "Network Error") {
          errorMessage =
            "Cannot connect to the server. Please check your internet connection.";
        } else if (err.message === "User not found") {
          errorMessage = "Email address not found. Please check your email.";
        } else if (err.message === "Invalid credentials") {
          errorMessage = "Incorrect password. Please try again.";
        } else if (
          err.message.includes("User not found") ||
          err.message.includes("Invalid credentials")
        ) {
          errorMessage = err.message;
        }
      }

      toast.error("Login Failed", {
        description: errorMessage,
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });

      setError(errorMessage);
    }
  };

  const handlePositionSelect = async (
    positionId: string,
    positionName: string
  ) => {
    try {
      console.log("handlePositionSelect called with:", {
        positionId,
        positionName,
      });
      console.log("Available positions in handlePositionSelect:", positions);
      await selectPosition(positionId, positions);
      toast.success(`Position selected! Redirecting to ${positionName} dashboard...`, {
        style: toastStyles.success.style,
        duration: toastStyles.success.duration,
      });
    } catch (err: unknown) {
      console.error("Position selection error:", err);
      let errorMessage = "Failed to select position";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error("Position Selection Failed", {
        description: errorMessage,
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 px-4 overflow-hidden bg-gradient-to-br from-slate-950 via-[#062b42] to-[#0872b3]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft “landing page” blobs */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400 blur-3xl opacity-30" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl opacity-30" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-sky-300 blur-3xl opacity-25" />
        {/* subtle grid + vignette */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>
      <div className="w-full max-w-lg relative">
        {/* Back to home */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <span className="text-base leading-none">←</span>
            Back to home
          </Link>
        </div>

        <div className="bg-slate-950/35 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/10 shadow-black/40">
        {/* Header */}
        <div className="text-center px-9 sm:px-10 pt-12 pb-7">
          <Image
            src="/logo/logo.png"
            alt="Imotrak Logo"
            width={80}
            height={80}
            className="mx-auto mb-4 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 shadow-lg shadow-black/20"
            priority
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
            Imotrak System
          </h1>
          <p className="text-sm text-white/70">
            Sign in to manage fleet activity and reservations
          </p>
        </div>

        {/* Login Form */}
        <div className="px-9 sm:px-10 pb-12">
          <h2 className="text-lg font-semibold text-white mb-8 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faUserLock} /> Login
          </h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-6">
              <label
                className="block mb-2 text-white/80 font-medium"
                htmlFor="email"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3.5 border border-white/10 rounded-xl text-base transition bg-white/7.5 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:outline-none focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/15"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="mb-6 relative">
              <label
                className="block mb-2 text-white/80 font-medium"
                htmlFor="password"
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3.5 border border-white/10 rounded-xl text-base transition bg-white/7.5 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:outline-none focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/15"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-4 top-[3.7rem] -translate-y-1/2 text-white/70 hover:text-white text-lg cursor-pointer transition-colors"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="mb-6 text-right">
              <Link
                href="/forgot-password"
                className="text-cyan-200/90 hover:text-cyan-100 transition-colors text-sm font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-400/30 rounded-xl text-red-200 text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 cursor-pointer bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_30px_-12px_rgba(34,211,238,0.55)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Loading...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} /> Login
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white/65 text-sm mb-2">
              Haven&apos;t received your verification email?
            </p>
            <Link
              href="/resend-verification"
              className="text-cyan-200 hover:text-cyan-100 transition-colors text-sm font-semibold"
            >
              Resend Verification Email
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 bg-white/5 border-t border-white/5">
          <p className="text-white/55 text-xs m-0">
            &copy; {new Date().getFullYear()} Imotrak - Imotrak System
          </p>
        </div>
        </div>
      </div>

      {/* Position Selection Modal */}
      {showPositionSelector && positions.length > 1 && (
        <PositionSelectionModal
          positions={positions}
          onSelectPosition={handlePositionSelect}
          onCancel={cancelPositionSelection}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Loading fallback component
function LoginFallback() {
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
          <Skeleton className="h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

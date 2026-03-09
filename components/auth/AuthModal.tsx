"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faSpinner,
  faTimes,
  faCheck,
  faEnvelope,
  faKey,
  faArrowLeft,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";
import { useForgotPassword } from "@/lib/queries";
import { LoginCredentials } from "@/types/next-auth";
import { toast } from "sonner";
import { toastStyles } from "@/lib/toast-config";

const PRIMARY = "#00628B";

type View = "login" | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const {
    login,
    selectPosition,
    isLoading,
    positions,
    showPositionSelector,
    cancelPositionSelection,
  } = useAuth();

  const forgotPasswordMutation = useForgotPassword();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const credentials: LoginCredentials = { email, password };
      const positionsResult = await login(credentials);

      if (positionsResult && positionsResult.length === 1) {
        const pos = positionsResult[0];
        await selectPosition(pos.position_id, positionsResult);
        toast.success(`Welcome! Redirecting to dashboard...`, {
          style: toastStyles.success.style,
          duration: toastStyles.success.duration,
        });
        onClose();
        router.push("/dashboard");
      } else if (positionsResult && positionsResult.length === 0) {
        toast.success(`Login successful! Redirecting...`, {
          style: toastStyles.success.style,
          duration: toastStyles.success.duration,
        });
        onClose();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      let errorMessage = "Invalid email or password";
      if (err && typeof err === "object" && "response" in err) {
        const e = err as { response?: { data?: { message?: string } } };
        if (e.response?.data?.message) errorMessage = e.response.data.message;
      } else if (err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
      toast.error("Login Failed", {
        description: errorMessage,
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordMutation.mutateAsync({ email: forgotEmail });
      setForgotSubmitted(true);
      toast.success("Reset link sent! Check your email.", {
        style: toastStyles.success.style,
        duration: toastStyles.success.duration,
      });
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  const handleBackToLogin = () => {
    setView("login");
    setForgotSubmitted(false);
    setForgotEmail("");
  };

  const handlePositionSelect = async (
    positionId: string,
    positionName: string
  ) => {
    try {
      await selectPosition(positionId, positions);
      toast.success(`Redirecting to ${positionName}...`, {
        style: toastStyles.success.style,
        duration: toastStyles.success.duration,
      });
      onClose();
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to select position", {
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !showPositionSelector) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        {/* Header with logo */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden ring-2 ring-[#00628B]/20 bg-[#00628B]/5">
            <Image
              src="/logo.png"
              alt="Imotrak"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900">
            Welcome to Imotrak
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {view === "login" ? "Sign in to your account" : "Reset your password"}
          </p>
        </div>

        <div className="p-8">
          {/* Position selector */}
          {showPositionSelector && positions.length > 1 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select your role
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Choose a position to continue
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {positions.map((position) => (
                  <button
                    key={position.position_id}
                    type="button"
                    onClick={() =>
                      handlePositionSelect(
                        position.position_id,
                        position.position_name
                      )
                    }
                    disabled={isLoading}
                    className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-[#00628B]/40 hover:bg-[#00628B]/5 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-[#00628B]">
                        {position.position_name}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {position.unit_name} · {position.organization_name}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-[#00628B] opacity-0 group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={cancelPositionSelection}
                className="mt-4 w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : view === "forgot-password" ? (
            /* Forgot password view - all inside modal, no redirect */
            forgotSubmitted ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/10 text-green-600">
                  <FontAwesomeIcon icon={faCheck} className="text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check your email
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We&apos;ve sent a password reset link to:
                </p>
                <div className="bg-[#00628B]/5 border border-[#00628B]/20 rounded-xl p-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-[#00628B] font-medium text-sm">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span className="break-all">{forgotEmail}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-6">
                  Check your inbox and follow the link. It expires in 24 hours.
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setForgotEmail("");
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-95"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Try different email
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full py-3 rounded-xl font-medium border-2 text-[#00628B] border-[#00628B] hover:bg-[#00628B]/5 flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} className="text-[#00628B]" />
                  Reset password
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter your email and we&apos;ll send you a secure reset link.
                </p>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FontAwesomeIcon icon={faUser} className="text-sm" />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      disabled={forgotPasswordMutation.isPending}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00628B]/20 focus:border-[#00628B] outline-none transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send reset link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full py-2.5 text-sm font-medium text-[#00628B] hover:underline flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  Back to Login
                </button>
              </form>
            )
          ) : (
            /* Login form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FontAwesomeIcon icon={faUser} className="text-sm" />
                  </span>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00628B]/20 focus:border-[#00628B] outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FontAwesomeIcon icon={faLock} className="text-sm" />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00628B]/20 focus:border-[#00628B] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="text-sm"
                    />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView("forgot-password")}
                  className="text-sm font-medium text-[#00628B] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY }}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Signing in...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    Sign in
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {view === "login" && !showPositionSelector && (
          <div className="px-8 pb-6 pt-0 text-center">
            <p className="text-gray-500 text-xs">
              Need to verify your email?{" "}
              <Link
                href="/resend-verification"
                onClick={onClose}
                className="text-[#00628B] font-medium hover:underline"
              >
                Resend verification
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

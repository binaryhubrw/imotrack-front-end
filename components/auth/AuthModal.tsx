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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      {/* Decorative “landing” backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400 blur-3xl opacity-20" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl opacity-20" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-sky-300 blur-3xl opacity-20" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 bg-slate-950/35 backdrop-blur-2xl border border-white/10 ring-1 ring-white/10 shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white/65 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        {/* Header with logo */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden ring-1 ring-white/15 bg-white/10 shadow-lg shadow-black/20">
            <Image
              src="/logo.png"
              alt="Imotrak"
              width={48}
              height={48}
              className="w-12 h-12 object-contain rounded-xl"
            />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-white tracking-tight">
            Welcome to Imotrak
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {view === "login" ? "Sign in to your account" : "Reset your password"}
          </p>
        </div>

        <div className="p-8">
          {/* Position selector */}
          {showPositionSelector && positions.length > 1 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Select your role
              </h3>
              <p className="text-white/70 text-sm mb-4">
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
                    className="w-full p-4 text-left rounded-xl border border-white/10 bg-white/5 hover:border-cyan-300/30 hover:bg-white/8 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium text-white group-hover:text-cyan-100">
                        {position.position_name}
                      </span>
                      <span className="block text-xs text-white/65 mt-0.5">
                        {position.unit_name} · {position.organization_name}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-cyan-200 opacity-0 group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={cancelPositionSelection}
                className="mt-4 w-full py-2.5 text-sm font-medium text-white/80 hover:text-white border border-white/10 rounded-xl hover:bg-white/10"
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
                <h3 className="text-lg font-semibold text-white mb-2">
                  Check your email
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  We&apos;ve sent a password reset link to:
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-cyan-200 font-medium text-sm">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span className="break-all">{forgotEmail}</span>
                  </div>
                </div>
                <p className="text-white/60 text-xs mb-6">
                  Check your inbox and follow the link. It expires in 24 hours.
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setForgotEmail("");
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-slate-950 hover:brightness-105 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_12px_30px_-12px_rgba(34,211,238,0.55)]"
                  >
                    Try different email
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full py-3 rounded-xl font-medium border border-white/15 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} className="text-cyan-200" />
                  Reset password
                </h3>
                <p className="text-white/70 text-sm">
                  Enter your email and we&apos;ll send you a secure reset link.
                </p>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-white/80 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
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
                      className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-white/7.5 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:ring-4 focus:ring-cyan-400/15 focus:border-cyan-300/40 outline-none transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-semibold text-slate-950 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_12px_30px_-12px_rgba(34,211,238,0.55)]"
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
                  className="w-full py-2.5 text-sm font-medium text-cyan-200 hover:text-cyan-100 flex items-center justify-center gap-2"
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
                  className="block text-sm font-medium text-white/80 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
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
                    className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-white/7.5 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:ring-4 focus:ring-cyan-400/15 focus:border-cyan-300/40 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-white/80 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
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
                    className="w-full pl-10 pr-12 py-3 border border-white/10 rounded-xl bg-white/7.5 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:ring-4 focus:ring-cyan-400/15 focus:border-cyan-300/40 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
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
                  className="text-sm font-medium text-cyan-200 hover:text-cyan-100"
                >
                  Forgot password?
                </button>
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-slate-950 transition-all hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_12px_30px_-12px_rgba(34,211,238,0.55)]"
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
            <p className="text-white/65 text-xs">
              Need to verify your email?{" "}
              <Link
                href="/resend-verification"
                onClick={onClose}
                className="text-cyan-200 font-semibold hover:text-cyan-100 hover:underline"
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

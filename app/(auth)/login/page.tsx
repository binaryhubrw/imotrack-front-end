"use client";

import { useState, useEffect, Suspense } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/types/next-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Separate component for the search params logic
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    // Only redirect if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      router.push(callbackUrl || '/dashboard');
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      
      // Show success toast
      toast.success("Login successful! Redirecting to dashboard...", {
        description: "Welcome back to Imotrak System",
        duration: 3000,
      });
      
      // Navigation will be handled by the useEffect above
    } catch (err: unknown) {
      console.error("Login error:", err);
      let errorMessage = "Invalid email or password";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } };
        if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (err instanceof Error) {
        if (err.message === "Network Error") {
          errorMessage = "Cannot connect to the server. Please check your internet connection.";
        } else if (err.message === "User not found") {
          errorMessage = "Email address not found. Please check your email.";
        } else if (err.message === "Invalid credentials") {
          errorMessage = "Incorrect password. Please try again.";
        } else if (err.message.includes("User not found") || err.message.includes("Invalid credentials")) {
          errorMessage = err.message;
        }
      }
      
      // Show error toast
      toast.error("Login Failed", {
        description: errorMessage,
        duration: 4000,
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      {/* Login Form */}
      <div className="px-8 py-8 bg-white">
        <h2 className="text-xl font-semibold text-[#0872b3] mb-6 text-center flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faUserLock} /> Login
        </h2>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-6">
            <label
              className="block mb-2 text-[#0872b3] font-medium"
              htmlFor="email"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
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
              className="block mb-2 text-[#0872b3] font-medium"
              htmlFor="password"
            >
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-4 top-[3.5rem] -translate-y-1/2 text-[#0872b3] text-lg cursor-pointer"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
              {error}
            </div>
          )}
          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
      {/* Footer */}
      <div className="text-center py-4 bg-[#f8f9fa] border-t border-[#0872b3]/20">
        <p className="text-[#0872b3] text-sm m-0">
          &copy; {new Date().getFullYear()} Imotrak - Imotrak System
        </p>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginFallback() {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="text-center px-8 pt-8 pb-4 bg-white">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
      </div>
      <div className="px-8 py-8 bg-white">
        <div className="h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0872b3] to-white py-8 px-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
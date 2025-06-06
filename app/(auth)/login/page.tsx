"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Mock users for testing
  const users = [
    { username: "superadmin", password: "admin123", role: "super-admin" },
    { username: "fleetmanager", password: "manager123", role: "fleet-manager" },
    { username: "staff", password: "staff123", role: "staff" },
    { username: "staffadmin", password: "staffadmin123", role: "staff-admin" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) {
      setError("Invalid credentials");
      return;
    }
    // Save user to localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ username: found.username, role: found.role })
    );
    // Set a cookie for middleware
    document.cookie = `role=${found.role}; path=/; max-age=86400`;
    // Redirect to dashboard
    router.push("/dashboard");
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
        {/* Login Form */}
        <div className="px-8 py-8 bg-white">
          <h2 className="text-xl font-semibold text-[#0872b3] mb-6 text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faUserLock} /> Login
          </h2>
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="mb-6">
              <label
                className="block mb-2 text-[#0872b3] font-medium"
                htmlFor="username"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-3 border border-[#0872b3]/30 rounded-md text-base transition focus:outline-none focus:border-[#0872b3] focus:ring-2 focus:ring-[#0872b3]/20"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              />
              <button
                type="button"
                className="absolute right-4 top-[3.5rem] -translate-y-1/2 text-[#0872b3] text-lg cursor-pointer"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {/* Options */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <label className="flex items-center text-sm text-[#0872b3]">
                <input type="checkbox" className="mr-2 accent-[#0872b3]" />
                Remember me
              </label>
              <Link
                href="#"
                className="text-[#0872b3] text-sm hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#0872b3] text-white rounded-md font-medium text-base flex items-center justify-center gap-2 transition hover:bg-[#065d8f] hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faSignInAlt} /> Login
            </button>
            {error && (
              <div className="mt-4 text-red-600 text-center">{error}</div>
            )}
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

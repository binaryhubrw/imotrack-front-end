/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function DashboardRoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
          {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Dashboard'}
        </h1>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "Staff"}
                </p>
              </div>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setShowSettings(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4"
                  
                  />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  onMenuButtonClick: () => void;
}

export default function DashboardHeader({ onMenuButtonClick }: DashboardHeaderProps) {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Optionally clear other related data here

    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {/* Menu button visible only on small screens */}
        <button
          onClick={onMenuButtonClick}
          className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 focus:outline-none"
          aria-label="You have 2 notifications"
        >
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="sr-only">2 new notifications</span>
          {/* You can replace this with an icon */}
          🔔
        </button>

        {/* User info and logout */}
        <div className="flex items-center gap-3">
          {/* User avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold uppercase">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>

          {/* Username */}
          <span className="text-gray-700 font-medium">{user?.name || 'Staff Name'}</span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Logout"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

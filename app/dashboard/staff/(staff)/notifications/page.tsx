'use client';
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/queries';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError } = useNotifications();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] via-gray-50 to-[#e6f2fa] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 text-gray-800">
            <Bell className="w-7 h-7 text-[#0872B3]" /> Notifications
          </h1>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-16">Loading notifications...</div>
          ) : isError ? (
            <div className="text-center text-red-500 py-16">Failed to load notifications.</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 py-16">No notifications.</div>
          ) : (
            notifications.map((msg: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-xl border bg-blue-50 border-blue-100 transition-all hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  <Bell className="w-6 h-6 text-[#0872B3]" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 text-base">{msg}</div>
                  <div className="text-xs text-gray-400 mt-1">Just now</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </main>
  );
}
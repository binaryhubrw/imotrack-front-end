

'use client';
import React, { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead } from '@/lib/queries';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const [searchTerm, setSearchTerm] = useState('');

  const handleMarkAsRead = async (notification_id: string) => {
    try {
      await markAsRead.mutateAsync({ notification_id });
      toast.success('Notification marked as read');
      refetch();
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.notification_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.notification_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;
  }
  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load notifications.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center text-gray-500">No notifications found.</div>
          ) : (
            filteredNotifications.map(n => (
              <div key={n.notification_id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{n.notification_title}</div>
                    <div className="text-gray-700 text-sm">{n.notification_message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <button
                  className="ml-auto text-gray-400 hover:text-red-600"
                  onClick={() => handleMarkAsRead(n.notification_id)}
                  title="Mark as read"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
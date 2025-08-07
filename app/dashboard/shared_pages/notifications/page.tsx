'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Check, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead } from '@/lib/queries';
import { toast } from 'sonner';
import ErrorUI from '@/components/ErrorUI';
import { useRouter } from 'next/navigation';
import { SkeletonNotificationsPage } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [readNotifications, setReadNotifications] = useState(new Set());

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.notification_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           n.notification_message.toLowerCase().includes(searchTerm.toLowerCase());
      const isRead = readNotifications.has(n.notification_id);
      const matchesFilter = filter === 'all' || 
                           (filter === 'unread' && !isRead) ||
                           (filter === 'read' && isRead);
      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchTerm, filter, readNotifications]);

  const unreadCount = notifications.length - readNotifications.size;

  const router = useRouter();

  const handleMarkAsRead = async (notification_id: string) => {
    try {
      await markAsRead.mutateAsync({ notification_id });
      setReadNotifications(prev => new Set([...prev, notification_id]));
      toast.success('Notification marked as read');
      refetch();
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !readNotifications.has(n.notification_id))
      .map(n => n.notification_id);
    
    for (const id of unreadIds) {
      try {
        await markAsRead.mutateAsync({ notification_id: id });
        setReadNotifications(prev => new Set([...prev, id]));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    toast.success('All notifications marked as read');
    refetch();
  };

  const getNotificationType = (title: string) => {
    if (title.toLowerCase().includes('approved')) return { type: 'success', color: 'bg-green-100 text-green-700 border-green-200' };
    if (title.toLowerCase().includes('canceled')) return { type: 'error', color: 'bg-red-100 text-red-700 border-red-200' };
    if (title.toLowerCase().includes('reservation')) return { type: 'info', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { type: 'default', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <SkeletonNotificationsPage />
    );
  }

  if (isError) {
    return (
      <ErrorUI
        resource='notifications'
        onBack={() => router.back()}
        onRetry={() => {window.location.reload()}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-blue-600" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">{unreadCount} unread notifications</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </motion.button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No notifications found</h3>
              <p className="text-gray-400">You&apos;re all caught up!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const isRead = readNotifications.has(notification.notification_id);
                const notificationType = getNotificationType(notification.notification_title);
                
                return (
                  <motion.div
                    key={notification.notification_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-all duration-200 ${
                      isRead ? 'opacity-60' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${notificationType.color}`}>
                            {notification.notification_title}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {notification.notification_message}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isRead && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsRead(notification.notification_id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-5 h-5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                          className="p-2 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
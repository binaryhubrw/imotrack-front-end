'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Check, Trash2, Clock, CheckCircle, BellOff } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useDeleteNotification } from '@/lib/queries';
import ErrorUI from '@/components/ErrorUI';
import { useRouter } from 'next/navigation';
import { SkeletonNotificationsPage } from '@/components/ui/skeleton';

const formatTimeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1)    return 'Just now';
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const getTypeStyle = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('approved'))   return { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700',  border: 'border-l-green-500' };
  if (t.includes('cancel'))     return { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700',      border: 'border-l-red-500' };
  if (t.includes('reservation'))return { dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',    border: 'border-l-blue-500' };
  if (t.includes('reject'))     return { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700',border: 'border-l-orange-500' };
  return                               { dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600',    border: 'border-l-gray-300' };
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotif = useDeleteNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [readNotifications, setReadNotifications] = useState(new Set<string>());
  const router = useRouter();

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        const matchesSearch =
          n.notification_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.notification_message.toLowerCase().includes(searchTerm.toLowerCase());
        const isRead = readNotifications.has(n.notification_id);
        const matchesFilter = filter === 'all' || (filter === 'unread' && !isRead) || (filter === 'read' && isRead);
        return matchesSearch && matchesFilter;
      })
      // Sort newest first
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notifications, searchTerm, filter, readNotifications]);

  const unreadCount = notifications.length - readNotifications.size;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync({ notification_id: id });
      setReadNotifications(prev => new Set([...prev, id]));
      refetch();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotif.mutateAsync({ notification_id: id });
      refetch();
    } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !readNotifications.has(n.notification_id)).map(n => n.notification_id);
    for (const id of unreadIds) {
      try { await markAsRead.mutateAsync({ notification_id: id }); } catch { /* silent */ }
    }
    setReadNotifications(new Set(notifications.map(n => n.notification_id)));
    refetch();
  };

  if (isLoading) return <SkeletonNotificationsPage />;
  if (isError)   return <ErrorUI resource="notifications" onBack={() => router.back()} onRetry={() => window.location.reload()} />;

  return (
    <motion.div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <motion.div className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-[#0872b3] rounded-2xl shadow-lg">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
              <p className="text-gray-500 text-sm mt-0.5">{unreadCount} unread · {notifications.length} total</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0872b3] hover:bg-[#066399] text-white text-sm font-semibold rounded-xl shadow-md transition-colors">
              <CheckCircle className="w-4 h-4" /> Mark All Read
            </motion.button>
          )}
        </motion.div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',  value: notifications.length,                                    color: 'from-blue-500 to-indigo-600' },
            { label: 'Unread', value: unreadCount,                                             color: 'from-amber-500 to-orange-600' },
            { label: 'Read',   value: notifications.length - unreadCount,                      color: 'from-emerald-500 to-teal-600' },
          ].map((s) => (
            <div key={s.label} className={`relative rounded-xl shadow-lg p-4 overflow-hidden bg-gradient-to-br ${s.color}`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{s.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search notifications..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* List */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white/95 rounded-2xl border border-gray-200 shadow-lg">
              <div className="p-4 rounded-2xl bg-gray-100/80 mb-4">
                <BellOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No notifications</h3>
              <p className="text-gray-500 text-sm mt-1">You&apos;re all caught up!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const isRead = readNotifications.has(notification.notification_id);
                const style = getTypeStyle(notification.notification_title);
                return (
                  <motion.div key={notification.notification_id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80 }} transition={{ delay: index * 0.04 }}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${style.border} p-5 hover:shadow-md transition-all duration-200 ${isRead ? 'opacity-55' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Dot */}
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${isRead ? 'bg-gray-300' : style.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
                              {notification.notification_title}
                            </span>
                            {!isRead && <span className="text-xs text-blue-500 font-medium">New</span>}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{notification.notification_message}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                            <span>·</span>
                            <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!isRead && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsRead(notification.notification_id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark as read">
                            <Check className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(notification.notification_id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
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
    </motion.div>
  );
}

'use client';
import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/lib/queries';
import { toast } from 'sonner';

// Define the notification type based on the API response
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  read_at?: string;
}

export default function NotificationsPage() {
  // Use actual API hooks
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // API functions
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification.mutateAsync(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'read') {
      try {
        await markAllAsRead.mutateAsync();
        toast.success('Selected notifications marked as read');
      } catch (error) {
        console.error('Error marking selected notifications as read:', error);
        toast.error('Failed to mark selected notifications as read');
      }
    } else if (action === 'delete') {
      try {
        // Delete notifications one by one
        for (const id of selectedNotifications) {
          await deleteNotification.mutateAsync(id);
        }
        toast.success('Selected notifications deleted');
      } catch (error) {
        console.error('Error deleting selected notifications:', error);
        toast.error('Failed to delete selected notifications');
      }
    }
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconClass = `w-5 h-5 ${isRead ? 'text-gray-400' : ''}`;
    switch (type) {
      case 'success': return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning': return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error': return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'info': return <Info className={`${iconClass} text-blue-500`} />;
      default: return <Bell className={iconClass} />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.read_at) ||
                         (filterType === 'read' && notification.read_at) ||
                         notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read_at).length;
  const hasSelected = selectedNotifications.length > 0;

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load notifications</h3>
          <p className="text-gray-500 mb-4">Please try again later</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} • {notifications.length} total
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasSelected && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedNotifications.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('read')}
                    disabled={markAllAsRead.isPending}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {markAllAsRead.isPending ? 'Marking...' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={deleteNotification.isPending}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteNotification.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" />
                  {markAllAsRead.isPending ? 'Marking...' : 'Mark All Read'}
                </button>
              )}
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-all ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => refetch()}
                className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-32 mt-6' : 'max-h-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'success', label: 'Success' },
                  { key: 'warning', label: 'Alerts' },
                  { key: 'info', label: 'Info' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterType === filter.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'No matching notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'When you receive notifications, they\'ll appear here'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: Notification, index: number) => {
              const isUnread = !notification.read_at;
              const isSelected = selectedNotifications.includes(notification.id);
              
              return (
                <div
                  key={notification.id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                    isUnread 
                      ? 'border-blue-200 shadow-sm ring-1 ring-blue-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInUp 0.4s ease-out forwards'
                  }}
                >
                  {/* Selection Indicator */}
                  {isUnread && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  <div className="flex items-start gap-4 p-6 pl-8">
                    {/* Checkbox */}
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                        } else {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        }
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 hover:border-gray-400 group-hover:border-blue-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, !!notification.read_at)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base leading-snug ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1.5 leading-relaxed ${
                            isUnread ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsRead.isPending}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={deleteNotification.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{getTimeAgo(notification.created_at)}</span>
                        {notification.read_at && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="w-3 h-3" />
                            Read {getTimeAgo(notification.read_at)}
                          </span>
                        )}
                        <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
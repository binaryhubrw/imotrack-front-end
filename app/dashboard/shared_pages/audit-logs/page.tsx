'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, User, Clock, Monitor, Globe, Trash2, Eye } from 'lucide-react';
import { useAuditLogs } from '@/lib/queries';
import ErrorUI from '@/components/ErrorUI';
import NoPermissionUI from '@/components/NoPermissionUI';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonSystemLogsDashboard } from '@/components/ui/skeleton';

export default function SystemLogsDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // Permission check - only super admin can access audit logs
  const canView = !!user?.position?.position_access?.organizations?.view;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage] = useState(1);
  const [limit] = useState(20);

  const {
    data: logs = [],
    isLoading,
    isError,
  } = useAuditLogs({
    name: nameFilter,
    email: emailFilter,
    startDate,
    endDate,
    page: currentPage,
    limit,
  });

  // Move useMemo before early returns to fix React Hooks error
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = searchTerm === '' ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.first_name && log.user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.user?.last_name && log.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter.toLowerCase();
      
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  // Early returns for permission checks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!canView) {
    return <NoPermissionUI resource="audit logs" />;
  }

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete')) return 'bg-red-100 text-red-700 border-red-200';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (actionLower.includes('create') || actionLower.includes('add')) return 'bg-green-100 text-green-700 border-green-200';
    if (actionLower.includes('login')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (actionLower.includes('logout')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete')) return <Trash2 className="w-4 h-4" />;
    if (actionLower.includes('update') || actionLower.includes('edit')) return <Eye className="w-4 h-4" />;
    if (actionLower.includes('create') || actionLower.includes('add')) return <Activity className="w-4 h-4" />;
    if (actionLower.includes('login') || actionLower.includes('logout')) return <User className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
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

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (isLoading) {
    return (
      <SkeletonSystemLogsDashboard />
    );
  }

  if (isError && canView) {
    return (
      <ErrorUI
        resource='audit-logs'
        onBack={() => router.back()}
        onRetry={() => {window.location.reload()}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                <p className="text-gray-600">{filteredLogs.length} activity records found</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="Filter by name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Filter by email"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Logs List */}
        <AnimatePresence mode="popLayout">
          {filteredLogs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm"
            >
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No logs found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>

                      {/* Log Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            {log.action}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {log.user?.first_name} {log.user?.last_name}
                            </p>
                            <p className="text-gray-600">{log.user?.email}</p>
                            <p className="text-gray-500 text-xs">{log.user?.organization_name}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Table: {log.table_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{log.ip_address}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatTimeAgo(log.timestamp)}</span>
                            </div>
                            <p className="text-gray-500 text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {log.record_id && (
                          <div className="mt-2 text-xs text-gray-500">
                            Record ID: {log.record_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
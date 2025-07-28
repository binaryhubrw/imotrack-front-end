'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, Eye, Clock } from 'lucide-react';
import { useVehicleIssues } from '@/lib/queries';
import ErrorUI from '@/components/ErrorUI';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NoPermissionUI from '@/components/NoPermissionUI';
import Link from 'next/link';
import { SkeletonVehiclesTable } from '@/components/ui/skeleton';

export default function VehicleIssuesPage() {
  const { data: issues = [], isLoading, isError, error } = useVehicleIssues();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Debug logging
  console.log('VehicleIssuesPage Debug:', {
    issues,
    isLoading,
    isError,
    error: error?.message,
    issuesCount: issues.length
  });

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicleIssues?.view;
  // const canReport = !!user?.position?.position_access?.vehicleIssues?.report;

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.issue_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'open' && issue.issue_status === 'OPEN') ||
                           (filter === 'closed' && issue.issue_status === 'CLOSED');
      return matchesSearch && matchesFilter;
    });
  }, [issues, searchTerm, filter]);

  


  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="vehicle issues" />;
  }

  if (isLoading) {
    return (
      <SkeletonVehiclesTable />
    );
  }

  if (isError) {
    return (
      <ErrorUI
        resource='vehicle issues'
        onBack={() => router.back()}
        onRetry={() => {window.location.reload()}}
      />
    );
  }

  const openIssuesCount = issues.filter(issue => issue.issue_status === 'OPEN').length;
  const closedIssuesCount = issues.filter(issue => issue.issue_status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-white">
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
                <AlertTriangle className="w-8 h-8 text-blue-600" />
                {openIssuesCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                  >
                    {openIssuesCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vehicle Issues</h1>
                <p className="text-gray-600">{openIssuesCount} open issues, {closedIssuesCount} resolved</p>
              </div>
            </div>
            {/* {canReport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/shared_pages/vehicle-issues/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Report Issue
              </motion.button>
            )} */}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search issues..."
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
              <option value="all">All Issues</option>
              <option value="open">Open Issues</option>
              <option value="closed">Closed Issues</option>
            </select>
          </div>
        </motion.div>

        {/* Issues List */}
        <AnimatePresence mode="popLayout">
          {filteredIssues.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No issues found</h3>
              <p className="text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No vehicle issues have been reported yet'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue, index) => {
                return (
                  <motion.div
                    key={issue.issue_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-all duration-200 border-blue-500"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {issue.issue_title}
                        </h3>
                        <p className="text-gray-700 mb-3 leading-relaxed line-clamp-2">
                          {issue.issue_description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(issue.created_at)}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(issue.issue_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/shared_pages/vehicle-issues/${issue.issue_id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                        </Link>
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
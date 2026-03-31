'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, User, Clock, Globe, Trash2, Eye, Plus, LogIn, LogOut, Monitor, X, ChevronDown, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useAuditLogs } from '@/lib/queries';
import { exportToStyledExcel } from '@/lib/excel-export';
import ErrorUI from '@/components/ErrorUI';
import NoPermissionUI from '@/components/NoPermissionUI';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonSystemLogsDashboard } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const CardDecoration = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute top-1/2 -left-8 w-24 h-24 rounded-full bg-white/10" />
  </div>
);

const getActionStyle = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('delete'))  return { bg: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    icon: <Trash2 className="w-3 h-3" /> };
  if (a.includes('update') || a.includes('edit')) return { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: <Eye className="w-3 h-3" /> };
  if (a.includes('create') || a.includes('add'))  return { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: <Plus className="w-3 h-3" /> };
  if (a.includes('login'))   return { bg: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   icon: <LogIn className="w-3 h-3" /> };
  if (a.includes('logout'))  return { bg: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', icon: <LogOut className="w-3 h-3" /> };
  return { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: <Monitor className="w-3 h-3" /> };
};

const formatTimeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1)    return 'Just now';
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// Converts action + resource into a readable sentence
const buildSentence = (action: string, resource: string): string => {
  const a = action.toUpperCase();
  const r = resource || 'a record';
  const map: Record<string, string> = {
    LOGOUT:                          'logged out of the system',
    LOGIN:                           'logged into the system',
    CREATE_VEHICLE:                  `added a new vehicle`,
    UPDATE_VEHICLE:                  `updated a vehicle`,
    DELETE_VEHICLE:                  `deleted a vehicle`,
    CREATE_VEHICLE_MODEL:            `created a vehicle model`,
    UPDATE_VEHICLE_MODEL:            `updated a vehicle model`,
    DELETE_VEHICLE_MODEL:            `deleted a vehicle model`,
    CREATE_RESERVATION:              `submitted a new reservation request`,
    UPDATE_RESERVATION:              `updated a reservation`,
    DELETE_RESERVATION:              `deleted a reservation`,
    ACCEPT_RESERVATION:              `accepted a reservation`,
    APPROVE_RESERVATION:             `approved a reservation`,
    REJECT_RESERVATION:              `rejected a reservation`,
    CANCEL_RESERVATION:              `cancelled a reservation`,
    START_RESERVATION:               `started a reservation trip`,
    COMPLETE_RESERVATION:            `completed a reservation`,
    ASSIGN_VEHICLE_TO_RESERVATION:   `assigned a vehicle to a reservation`,
    CREATE_USER:                     `created a new user`,
    UPDATE_USER:                     `updated a user profile`,
    DELETE_USER:                     `deleted a user`,
    CREATE_ORGANIZATION:             `created a new organization`,
    UPDATE_ORGANIZATION:             `updated an organization`,
    DELETE_ORGANIZATION:             `deleted an organization`,
    CREATE_UNIT:                     `created a new unit`,
    UPDATE_UNIT:                     `updated a unit`,
    DELETE_UNIT:                     `deleted a unit`,
    CREATE_POSITION:                 `created a new position`,
    UPDATE_POSITION:                 `updated a position`,
    DELETE_POSITION:                 `deleted a position`,
    ASSIGN_USER_TO_POSITION:         `assigned a user to a position`,
    REPORT_VEHICLE_ISSUE:            `reported a vehicle issue`,
    UPDATE_VEHICLE_ISSUE:            `updated a vehicle issue`,
    DELETE_VEHICLE_ISSUE:            `deleted a vehicle issue`,
  };
  return map[a] ?? `performed action on ${r}`;
};

const exportLogsToExcel = async (logs: any[]) => {
  try {
    const data = logs.map(log => ({
      'User': `${log.user?.first_name ?? ''} ${log.user?.last_name ?? ''}`.trim() || 'Unknown',
      'Email': (log.user as any)?.auth?.email ?? log.user?.email ?? 'N/A',
      'Action': log.action,
      'Description': buildSentence(log.action, (log.table_name ?? '').replace('tbl_', '').replace(/_/g, ' ')),
      'Table': log.table_name ?? 'N/A',
      'IP Address': log.ip_address ?? 'N/A',
      'Record ID': log.record_id ?? 'N/A',
      'Timestamp': new Date(log.timestamp).toLocaleString(),
    }));
    const columns = Object.keys(data[0] || {});
    await exportToStyledExcel({
      title: 'ImoTrak - System Logs Export',
      sheetName: 'System Logs',
      columns,
      data,
      filename: 'system_logs_export',
      columnWidths: [20, 28, 22, 40, 20, 16, 28, 22],
    });
  } catch (err) {
    console.error('Export error:', err);
  }
};

export default function SystemLogsDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const canView = !!user?.position?.position_access?.organizations?.view;

  const [searchTerm, setSearchTerm]   = useState('');
  const [nameFilter, setNameFilter]   = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [pageIndex, setPageIndex]     = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const pageSize = 15;

  const { data: logs = [], isLoading, isError } = useAuditLogs({
    name: nameFilter, email: emailFilter, startDate, endDate, page: 1, limit: 200,
  });

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      log.action.toLowerCase().includes(q) ||
      log.user?.first_name?.toLowerCase().includes(q) ||
      log.user?.last_name?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q);
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesAction;
  }), [logs, searchTerm, actionFilter]);

  const pageCount = Math.ceil(filteredLogs.length / pageSize);
  const paginated = filteredLogs.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const hasFilters = searchTerm || nameFilter || emailFilter || startDate || endDate || actionFilter !== 'all';
  const clearFilters = () => { setSearchTerm(''); setNameFilter(''); setEmailFilter(''); setStartDate(''); setEndDate(''); setActionFilter('all'); };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  if (!canView)    return <NoPermissionUI resource="audit logs" />;
  if (isLoading)   return <SkeletonSystemLogsDashboard />;
  if (isError)     return <ErrorUI resource="audit-logs" onBack={() => router.back()} onRetry={() => window.location.reload()} />;

  const counts = {
    total:   filteredLogs.length,
    creates: filteredLogs.filter(l => l.action.toLowerCase().includes('create') || l.action.toLowerCase().includes('add')).length,
    updates: filteredLogs.filter(l => l.action.toLowerCase().includes('update') || l.action.toLowerCase().includes('edit')).length,
    deletes: filteredLogs.filter(l => l.action.toLowerCase().includes('delete')).length,
  };

  return (
    <motion.div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">System Logs</h1>
            <p className="text-gray-600 mt-1 text-sm">{filteredLogs.length} activity records found</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLogsToExcel(filteredLogs)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/95 shadow-md hover:shadow-lg hover:border-gray-300 transition-all font-medium text-gray-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-100 shadow-md">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants} initial="hidden" animate="visible">
          {[
            { label: 'Total Events',  value: counts.total,   color: 'from-blue-500 to-indigo-600',   icon: <Activity className="w-5 h-5 text-white" /> },
            { label: 'Created',       value: counts.creates, color: 'from-emerald-500 to-teal-600',  icon: <Plus className="w-5 h-5 text-white" /> },
            { label: 'Updated',       value: counts.updates, color: 'from-amber-500 to-orange-600',  icon: <Eye className="w-5 h-5 text-white" /> },
            { label: 'Deleted',       value: counts.deletes, color: 'from-rose-500 to-red-600',      icon: <Trash2 className="w-5 h-5 text-white" /> },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants}
              className={`relative rounded-xl shadow-lg p-5 overflow-hidden bg-gradient-to-br ${s.color}`}>
              <CardDecoration />
              <div className="relative flex items-start justify-between gap-2">
                <p className="text-white/90 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                <div className="p-1.5 rounded-lg bg-white/20">{s.icon}</div>
              </div>
              <p className="relative text-white text-3xl font-bold mt-2">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl overflow-visible relative z-30"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="px-4 py-3 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search logs..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-10 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
            </div>
            <input type="text" placeholder="Filter by name" value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-36" />
            <input type="text" placeholder="Filter by email" value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-44" />
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
              <option value="all">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-0.5">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-0.5">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Clear filters">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-gray-100 text-sm text-gray-600 bg-gray-50/30">
              <span>Active filters:</span>
              {searchTerm && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg text-xs font-medium">Search: &ldquo;{searchTerm}&rdquo;</span>}
              {nameFilter && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg text-xs font-medium">Name: {nameFilter}</span>}
              {emailFilter && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg text-xs font-medium">Email: {emailFilter}</span>}
              {actionFilter !== 'all' && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-lg text-xs font-medium">{actionFilter}</span>}
              {(startDate || endDate) && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-lg text-xs font-medium">Date: {startDate || '…'} → {endDate || '…'}</span>}
              <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline">Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Table */}
        {filteredLogs.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white/95 rounded-2xl border border-gray-200 shadow-lg">
            <div className="p-4 rounded-2xl bg-gray-100/80 mb-4">
              <Activity className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No logs found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="divide-y divide-gray-100">
              {paginated.map((log, idx) => {
                const style = getActionStyle(log.action);
                const isExpanded = expandedRow === log.id;
                const hasChanges = !!(log.old_value || log.new_value);
                const userName = `${log.user?.first_name ?? ''} ${log.user?.last_name ?? ''}`.trim() || 'Unknown user';
                const userEmail = (log.user as any)?.auth?.email ?? log.user?.email ?? '';
                const resource = (log.table_name ?? '').replace('tbl_', '').replace(/_/g, ' ');
                const sentence = buildSentence(log.action, resource);

                return (
                  <React.Fragment key={log.id}>
                    <div
                      className={`flex items-start gap-4 px-5 py-4 transition-colors ${hasChanges ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50'} ${isExpanded ? 'bg-indigo-50/40' : ''}`}
                      onClick={() => hasChanges && setExpandedRow(isExpanded ? null : log.id)}
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Sentence */}
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{userName}</span>
                          {' '}
                          <span className="text-gray-600">{sentence}</span>
                        </p>
                        {/* Sub-line: email · IP · record */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                          {userEmail && <span>{userEmail}</span>}
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{log.ip_address}</span>
                          {log.record_id && (
                            <span className="font-mono" title={log.record_id}>ID: {log.record_id.slice(0, 8)}…</span>
                          )}
                        </div>
                      </div>

                      {/* Right side: badge + time + expand */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg}`}>
                          {style.icon}
                          {log.action}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span title={new Date(log.timestamp).toLocaleString()}>{formatTimeAgo(log.timestamp)}</span>
                          <span className="text-gray-300">·</span>
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        {hasChanges && (
                          <span className="text-xs text-indigo-500 flex items-center gap-0.5">
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {isExpanded ? 'hide diff' : 'view diff'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expandable diff */}
                    {isExpanded && hasChanges && (
                      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {!!log.old_value && (
                            <div>
                              <p className="font-semibold text-red-600 mb-1.5 uppercase tracking-wide">Before</p>
                              <pre className="bg-red-50 border border-red-100 rounded-lg p-3 text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                {JSON.stringify(log.old_value as object, null, 2)}
                              </pre>
                            </div>
                          )}
                          {!!log.new_value && (
                            <div>
                              <p className="font-semibold text-green-600 mb-1.5 uppercase tracking-wide">After</p>
                              <pre className="bg-green-50 border border-green-100 rounded-lg p-3 text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                {JSON.stringify(log.new_value as object, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredLogs.length > pageSize && (
              <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[
                    { label: '«', action: () => setPageIndex(0), disabled: pageIndex === 0 },
                    { label: '‹', action: () => setPageIndex(p => Math.max(0, p - 1)), disabled: pageIndex === 0 },
                    { label: '›', action: () => setPageIndex(p => Math.min(pageCount - 1, p + 1)), disabled: pageIndex >= pageCount - 1 },
                    { label: '»', action: () => setPageIndex(pageCount - 1), disabled: pageIndex >= pageCount - 1 },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} disabled={btn.disabled}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      {btn.label}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  Page <strong>{pageIndex + 1}</strong> of <strong>{pageCount}</strong> · {filteredLogs.length} total
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

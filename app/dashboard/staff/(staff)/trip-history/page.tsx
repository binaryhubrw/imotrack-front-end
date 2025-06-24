'use client';
import React, { useState } from 'react';
import {Car, Download, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStaffRequests, useIssues } from '@/lib/queries';
import type { StaffRequestResponse, IssueDto } from '@/types/next-auth';

export default function TripHistoryPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('');
  const router = useRouter();

  const { data: requests = [], isLoading, isError } = useStaffRequests();
  const { data: issues = [] } = useIssues();

  // Filter requests by search and status
  const filtered = requests.filter((req: StaffRequestResponse) =>
    req.status === 'APPROVED' &&
    (req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.trip_purpose.toLowerCase().includes(search.toLowerCase()) ||
      req.end_location.toLowerCase().includes(search.toLowerCase()) ||
      req.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to get issues for a request
  function getRequestIssues(req: StaffRequestResponse) {
    return issues.filter((issue: IssueDto) =>
      issue.trip_purpose === req.trip_purpose &&
      issue.requester_full_name === req.full_name
    );
  }

  function statusBadge(status: string) {
    const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border';
    switch (status) {
      case 'COMPLETED':
        return <span className={base + ' bg-green-50 text-green-700 border-green-200'}>Completed</span>;
      case 'CANCELLED':
        return <span className={base + ' bg-gray-100 text-gray-500 border-gray-300'}>Cancelled</span>;
      case 'ACTIVE':
        return <span className={base + ' bg-blue-50 text-blue-700 border-blue-200'}>Active</span>;
      case 'APPROVED':
        return <span className={base + ' bg-yellow-50 text-yellow-700 border-yellow-200'}>Approved</span>;
      case 'PENDING':
        return <span className={base + ' bg-orange-50 text-orange-700 border-orange-200'}>Pending</span>;
      case 'REJECTED':
        return <span className={base + ' bg-red-50 text-red-700 border-red-200'}>Rejected</span>;
      default:
        return <span className={base + ' bg-gray-100 text-gray-700 border-gray-300'}>{status}</span>;
    }
  }

  function exportCSV(data: StaffRequestResponse[]) {
    const header = ['Request ID', 'Purpose', 'Destination', 'Status', 'Start Date', 'End Date', 'Full Name', 'Passengers', 'Issues'];
    const rows = data.map(req => [
      req.id,
      req.trip_purpose,
      req.end_location,
      req.status,
      req.start_date,
      req.end_date,
      req.full_name,
      req.passengers_number,
      getRequestIssues(req).length
    ]);
    const csv = [header, ...rows].map(row => row.map(String).map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleTripClick = (requestId: string) => {
    router.push(`/dashboard/staff/trip-history/${requestId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] px-1 py-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Car className="w-8 h-8 text-[#0872B3]" />
          <h1 className="text-3xl font-extrabold text-[#0872B3] tracking-tight">Trip History</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trips..."
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white w-full sm:w-64 shadow-sm"
            />
            <div className="relative w-full sm:w-44">
              <select
                className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ACTIVE">Active</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className="relative w-full sm:w-40">
              <select
                className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] transition"
                value={time}
                onChange={e => setTime(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0872B3] text-white font-semibold shadow hover:bg-blue-700 transition-colors text-base"
            onClick={() => exportCSV(filtered)}
            type="button"
          >
            <span className="inline-flex items-center justify-center bg-white/20 rounded-full p-1">
              <Download className="w-5 h-5" />
            </span>
            Export
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
  <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
    <table className="w-full text-[13px] min-w-[900px]">
      <thead className="sticky top-0 z-10 bg-[#0872B3] text-white">
                <tr className="bg-[#0872B3] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Request ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                  <th className="px-6 py-4 text-left font-semibold">Destination</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Start Date</th>
                  <th className="px-6 py-4 text-left font-semibold">End Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Full Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Passengers</th>
                  <th className="px-6 py-4 text-left font-semibold">Issues</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400 text-lg">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-red-500 text-lg">Failed to load trip history.</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400 text-lg">No trips found.</td>
                  </tr>
                ) : (
                  filtered.map((req, idx) => {
                    const reqIssues = getRequestIssues(req);
                    return (
                      <React.Fragment key={req.id}>
                        <tr
                          className={`
                            ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            hover:bg-blue-50/70
                            transition-colors
                            duration-150
                            rounded-lg
                            cursor-pointer
                          `}
                          style={{ height: "64px" }}
                          onClick={() => handleTripClick(req.id)}
                        >
                          <td className="px-6 py-4 font-mono">{req.id}</td>
                          <td className="px-6 py-4">{req.trip_purpose}</td>
                          <td className="px-6 py-4">{req.end_location}</td>
                          <td className="px-6 py-4">{statusBadge(req.status)}</td>
                          <td className="px-6 py-4">{new Date(req.start_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{new Date(req.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{req.full_name}</td>
                          <td className="px-6 py-4 text-center">{req.passengers_number}</td>
                          <td className="px-6 py-4">
                            {reqIssues.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                <AlertTriangle className="w-4 h-4" /> {reqIssues.length} Issue{reqIssues.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No Issues</span>
                            )}
                          </td>
                        </tr>
                        {reqIssues.length > 0 && reqIssues.map((issue: IssueDto, i: number) => (
                          <tr key={issue.description + i} className="bg-red-50">
                            <td colSpan={10} className="px-12 py-3 text-sm text-red-700">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-semibold">Issue:</span> {issue.description} <span className="ml-4 text-xs text-gray-400">({issue.type})</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

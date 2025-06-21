
'use client';
import React, { useState } from 'react';
import { Eye, Car, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Trip {
  id: string;
  date: string;
  purpose: string;
  destination: string;
  status: 'Completed' | 'Cancelled';
  driver: string;
  vehicle: string;
}

const TRIPS: Trip[] = [
  { id: 'TRIP-001', date: '2024-02-20', purpose: 'Field Trip', destination: 'Huye Campus', status: 'Completed', driver: 'John Doe', vehicle: 'UR-001' },
  { id: 'TRIP-002', date: '2024-02-18', purpose: 'Conference', destination: 'Kigali Convention Center', status: 'Completed', driver: 'Jane Smith', vehicle: 'UR-002' },
  { id: 'TRIP-003', date: '2024-02-15', purpose: 'Research Visit', destination: 'Kigali Heights', status: 'Cancelled', driver: 'Mike Johnson', vehicle: 'UR-003' },
  { id: 'TRIP-004', date: '2024-02-10', purpose: 'Workshop', destination: 'Rubavu Beach', status: 'Completed', driver: 'Alice Brown', vehicle: 'UR-004' },
  { id: 'TRIP-005', date: '2024-02-08', purpose: 'Team Building', destination: 'Nyungwe Forest', status: 'Completed', driver: 'Chris Green', vehicle: 'UR-005' },
  { id: 'TRIP-006', date: '2024-02-05', purpose: 'Inspection', destination: 'Bugesera', status: 'Cancelled', driver: 'Sarah Lee', vehicle: 'UR-006' },
];

function statusBadge(status: Trip['status']) {
  const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border';
  switch (status) {
    case 'Completed':
      return <span className={base + ' bg-green-50 text-green-700 border-green-200'}>Completed</span>;
    case 'Cancelled':
      return <span className={base + ' bg-gray-100 text-gray-500 border-gray-300'}>Cancelled</span>;
    default:
      return <span className={base + ' bg-gray-100 text-gray-700 border-gray-300'}>{status}</span>;
  }
}

function exportCSV(data: Trip[]) {
  const header = ['Trip ID', 'Date', 'Purpose', 'Destination', 'Status', 'Driver', 'Vehicle'];
  const rows = data.map(trip => [trip.id, trip.date, trip.purpose, trip.destination, trip.status, trip.driver, trip.vehicle]);
  const csv = [header, ...rows].map(row => row.map(String).map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trip-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function TripHistoryPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('');
  const router = useRouter();

  const filtered = TRIPS.filter(trip =>
    (trip.id.toLowerCase().includes(search.toLowerCase()) ||
      trip.purpose.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.driver.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(search.toLowerCase())) &&
    (status === '' || trip.status === status)
  );

  const handleTripClick = (tripId: string) => {
    router.push(`/dashboard/trip-history/${tripId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] px-4 py-10">
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
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-[#0872B3] text-white">
                <th className="px-6 py-4 text-left font-semibold">Trip ID</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                <th className="px-6 py-4 text-left font-semibold">Destination</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Driver</th>
                <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-lg">No trips found.</td>
                </tr>
              ) : (
                filtered.map((trip, idx) => (
                  <tr
                    key={trip.id}
                    className={`
                      ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      hover:bg-blue-50/70
                      transition-colors
                      duration-150
                      rounded-lg
                      cursor-pointer
                    `}
                    style={{ height: "64px" }}
                    onClick={() => handleTripClick(trip.id)}
                  >
                    <td className="px-6 py-4 font-mono">{trip.id}</td>
                    <td className="px-6 py-4">{trip.date}</td>
                    <td className="px-6 py-4">{trip.purpose}</td>
                    <td className="px-6 py-4">{trip.destination}</td>
                    <td className="px-6 py-4">{statusBadge(trip.status)}</td>
                    <td className="px-6 py-4">{trip.driver}</td>
                    <td className="px-6 py-4">{trip.vehicle}</td>
                    <td className="px-6 py-4">
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title="View Details"
                        aria-label="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTripClick(trip.id);
                        }}
                      >
                        <Eye className="w-5 h-5 text-[#0872B3]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

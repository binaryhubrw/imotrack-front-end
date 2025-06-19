'use client';

import React, { useState } from 'react';
import { Eye, X, Search } from 'lucide-react';

const TRIPS = [
  { id: 'TRIP-001', date: '2024-02-20', purpose: 'Field Trip', destination: 'Huye Campus', status: 'Completed', driver: 'John Doe', vehicle: 'UR-001' },
  { id: 'TRIP-002', date: '2024-02-18', purpose: 'Conference', destination: 'Kigali Convention Center', status: 'Completed', driver: 'Jane Smith', vehicle: 'UR-002' },
  { id: 'TRIP-003', date: '2024-02-15', purpose: 'Research Visit', destination: 'Kigali Heights', status: 'Cancelled', driver: 'Mike Johnson', vehicle: 'UR-003' },
  { id: 'TRIP-004', date: '2024-02-10', purpose: 'Workshop', destination: 'Rubavu Beach', status: 'Completed', driver: 'Alice Brown', vehicle: 'UR-004' },
  { id: 'TRIP-005', date: '2024-02-08', purpose: 'Team Building', destination: 'Nyungwe Forest', status: 'Completed', driver: 'Chris Green', vehicle: 'UR-005' },
  { id: 'TRIP-006', date: '2024-02-05', purpose: 'Inspection', destination: 'Bugesera', status: 'Cancelled', driver: 'Sarah Lee', vehicle: 'UR-006' },
];

function statusBadge(status: string) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1';
  switch (status) {
    case 'Completed':
      return <span className={`${base} bg-blue-100 text-blue-800`}>Completed</span>;
    case 'Cancelled':
      return <span className={`${base} bg-red-100 text-red-800`}>Cancelled</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
  }
}

function exportCSV(data: any[]) {
  const header = ['Trip ID', 'Date', 'Purpose', 'Destination', 'Status', 'Driver', 'Vehicle'];
  const rows = data.map(trip => [trip.id, trip.date, trip.purpose, trip.destination, trip.status, trip.driver, trip.vehicle]);
  const csv = [header, ...rows].map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
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
  const [viewTrip, setViewTrip] = useState<any | null>(null);

  const filtered = TRIPS.filter(trip =>
    (trip.id.toLowerCase().includes(search.toLowerCase()) ||
      trip.purpose.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.driver.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle.toLowerCase().includes(search.toLowerCase())) &&
    (status === '' || trip.status === status)
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Trip History</h1>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white w-full pl-9"
                />
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                value={time}
                onChange={e => setTime(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                className="ml-2 flex items-center gap-2 px-6 py-2 text-blue-700 border border-blue-700 rounded-lg shadow-none hover:bg-blue-50 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[120px] justify-center"
                onClick={() => exportCSV(filtered)}
              >
                Export
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-gray-600">
                  <th className="px-4 py-2 text-left font-semibold">Trip ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Purpose</th>
                  <th className="px-4 py-2 text-left font-semibold">Destination</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Driver</th>
                  <th className="px-4 py-2 text-left font-semibold">Vehicle</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">No trips found.</td>
                  </tr>
                ) : (
                  filtered.map((trip, idx) => (
                    <tr
                      key={trip.id}
                      className={
                        (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50') +
                        ' hover:bg-blue-50 transition-colors'
                      }
                    >
                      <td className="px-4 py-2 font-mono">{trip.id}</td>
                      <td className="px-4 py-2">{trip.date}</td>
                      <td className="px-4 py-2">{trip.purpose}</td>
                      <td className="px-4 py-2">{trip.destination}</td>
                      <td className="px-4 py-2">{statusBadge(trip.status)}</td>
                      <td className="px-4 py-2">{trip.driver}</td>
                      <td className="px-4 py-2">{trip.vehicle}</td>
                      <td className="px-4 py-2">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          title="View Details"
                          aria-label="View Details"
                          onClick={() => setViewTrip(trip)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal for Trip Details */}
          {viewTrip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
                  onClick={() => setViewTrip(null)}
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl font-bold mb-4 text-blue-800">Trip Details</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>ID:</strong> {viewTrip.id}</div>
                  <div><strong>Date:</strong> {viewTrip.date}</div>
                  <div><strong>Purpose:</strong> {viewTrip.purpose}</div>
                  <div><strong>Destination:</strong> {viewTrip.destination}</div>
                  <div><strong>Status:</strong> {viewTrip.status}</div>
                  <div><strong>Driver:</strong> {viewTrip.driver}</div>
                  <div><strong>Vehicle:</strong> {viewTrip.vehicle}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

'use client';
import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

const TRIPS = [
  { id: 'TRIP-001', date: '2024-02-20', purpose: 'Field Trip', destination: 'Huye Campus', status: 'Completed', driver: 'John Doe', vehicle: 'UR-001' },
  { id: 'TRIP-002', date: '2024-02-18', purpose: 'Conference', destination: 'Kigali Convention Center', status: 'Completed', driver: 'Jane Smith', vehicle: 'UR-002' },
  { id: 'TRIP-003', date: '2024-02-15', purpose: 'Research Visit', destination: 'Kigali Heights', status: 'Cancelled', driver: 'Mike Johnson', vehicle: 'UR-003' },
  { id: 'TRIP-004', date: '2024-02-10', purpose: 'Workshop', destination: 'Rubavu Beach', status: 'Completed', driver: 'Alice Brown', vehicle: 'UR-004' },
  { id: 'TRIP-005', date: '2024-02-08', purpose: 'Team Building', destination: 'Nyungwe Forest', status: 'Completed', driver: 'Chris Green', vehicle: 'UR-005' },
  { id: 'TRIP-006', date: '2024-02-05', purpose: 'Inspection', destination: 'Bugesera', status: 'Cancelled', driver: 'Sarah Lee', vehicle: 'UR-006' },
];

function statusBadge(status: string) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (status) {
    case 'Completed':
      return <span className={base + ' bg-[#e6f2fa] text-[#0872B3] border border-[#0872B3]'}>Completed</span>;
    case 'Cancelled':
      return <span className={base + ' bg-gray-100 text-gray-500 border border-gray-300'}>Cancelled</span>;
    default:
      return <span className={base + ' bg-gray-100 text-gray-700 border border-gray-300'}>{status}</span>;
  }
}

function exportCSV(data: any[]) {
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
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-8" style={{ color: '#0872B3' }}>Trip History</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trips..."
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white w-full md:w-64"
            />
            <select
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={time}
              onChange={e => setTime(e.target.value)}
            >
              <option value="">All Time</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button
            className="px-4 py-2 rounded bg-[#0872B3] text-white font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => exportCSV(filtered)}
            type="button"
          >
            Export
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0872B3] text-white">
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
                      ' hover:bg-[#e6f2fa] transition-colors'
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
                        className="p-1 rounded hover:bg-[#e6f2fa]"
                        title="View Details"
                        aria-label="View Details"
                        onClick={() => setViewTrip(trip)}
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
        {/* Modal for trip details */}
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
              <h2 className="text-xl font-bold mb-4" style={{ color: '#0872B3' }}>Trip Details</h2>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Trip ID:</span> {viewTrip.id}</div>
                <div><span className="font-semibold">Date:</span> {viewTrip.date}</div>
                <div><span className="font-semibold">Purpose:</span> {viewTrip.purpose}</div>
                <div><span className="font-semibold">Destination:</span> {viewTrip.destination}</div>
                <div><span className="font-semibold">Status:</span> {viewTrip.status}</div>
                <div><span className="font-semibold">Driver:</span> {viewTrip.driver}</div>
                <div><span className="font-semibold">Vehicle:</span> {viewTrip.vehicle}</div>
              </div>
            </div>
            <style jsx global>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(16px); }
                to { opacity: 1; transform: none; }
              }
              .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
            `}</style>
          </div>
        )}
      </div>
    </main>
  );
}
'use client';
import React, { useState } from 'react';

export default function CarRequestFormPage() {
  const [fullname, setFullname] = useState('');
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#e6f2fa' }}>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 md:p-10">
        <h1 className="text-2xl font-bold text-center mb-8" style={{ color: '#0872B3' }}>Car Request</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0872B3' }}>Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0872B3' }}>Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="Reason"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0872B3' }}>Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="Destination"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0872B3' }}>Passengers</label>
                <input
                  type="number"
                  min={1}
                  value={passengers}
                  onChange={e => setPassengers(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="Passengers"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0872B3' }}>Trip Dates</label>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-2 rounded font-bold text-white text-base"
            style={{ background: '#0872B3' }}
          >
            Submit
          </button>
          {submitted && (
            <div className="text-center text-green-600 font-semibold mt-2">Car request submitted successfully!</div>
          )}
        </form>
      </div>
    </main>
  );
}
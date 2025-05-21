'use client';

import { useState } from 'react';
import Link from 'next/link';

const SAMPLE = {
  requestsMade: 12,
  requestsApproved: 8,
  requestsPending: 4,
  vehiclesUsed: 3,
};

export default function StaffDashboard() {
  const [data] = useState(SAMPLE);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Staff Dashboard</h1>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 32 }}>
        <Stat label="Requests Made" value={data.requestsMade} />
        <Stat label="Approved" value={data.requestsApproved} />
        <Stat label="Pending" value={data.requestsPending} />
        <Stat label="Vehicles Used" value={data.vehiclesUsed} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <DashLink href="/requests/new" label="Make New Request" />
        <DashLink href="/requests" label="View My Requests" />
      </div>
      <div style={{ marginTop: 36, color: '#888', fontSize: 14 }}>
        Submit and track your vehicle requests here.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      minWidth: 120,
      padding: 16,
      background: '#f7f7fa',
      borderRadius: 10,
      boxShadow: '0 1px 4px #eee',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 14, color: '#666' }}>{label}</div>
    </div>
  );
}

function DashLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <button style={{
        padding: '9px 18px',
        background: '#2d6cdf',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 500
      }}>
        {label}
      </button>
    </Link>
  );
}

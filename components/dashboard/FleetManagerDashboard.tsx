'use client';

import { useState } from 'react';
import Link from 'next/link';

const SAMPLE = {
  vehicles: 15,
  drivers: 10,
  activeRequests: 5,
  maintenanceDue: 2,
};

export default function FleetManagerDashboard() {
  const [data] = useState(SAMPLE);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Fleet Manager Dashboard</h1>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 32 }}>
        <Stat label="Vehicles" value={data.vehicles} />
        <Stat label="Drivers" value={data.drivers} />
        <Stat label="Active Requests" value={data.activeRequests} />
        <Stat label="Maintenance Due" value={data.maintenanceDue} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <DashLink href="/vehicles" label="Manage Vehicles" />
        <DashLink href="/drivers" label="Manage Drivers" />
        <DashLink href="/requests" label="View Requests" />
      </div>
      <div style={{ marginTop: 36, color: '#888', fontSize: 14 }}>
        Oversee your company’s fleet, drivers, and requests.
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

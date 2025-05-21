'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SAMPLE = {
  organizations: 4,
  users: 50,
  staff: 15,
  drivers: 20,
  vehicles: 12,
  requests: 30,
};

export default function SuperAdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState(SAMPLE);

  useEffect(() => {
    // Simulate API call if needed
    // setData(SAMPLE);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Super Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <Stat label="Organizations" value={data.organizations} />
        <Stat label="Users" value={data.users} />
        <Stat label="Staff" value={data.staff} />
        <Stat label="Drivers" value={data.drivers} />
        <Stat label="Vehicles" value={data.vehicles} />
        <Stat label="Requests" value={data.requests} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <DashLink href="/organizations" label="Manage Organizations" />
        <DashLink href="/users" label="Manage Users" />
        <DashLink href="/vehicles" label="Manage Vehicles" />
        <DashLink href="/requests" label="View Requests" />
      </div>
      <div style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
        Welcome, Super Admin! Here you can oversee all organizations, users, and resources.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      minWidth: 140,
      padding: 18,
      background: '#f7f7fa',
      borderRadius: 10,
      boxShadow: '0 1px 4px #eee',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 15, color: '#666' }}>{label}</div>
    </div>
  );
}

function DashLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <button style={{
        padding: '10px 20px',
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

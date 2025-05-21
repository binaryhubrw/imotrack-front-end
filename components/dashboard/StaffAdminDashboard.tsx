'use client';

import { useState } from 'react';
import Link from 'next/link';

const SAMPLE = {
  usersCreated: 28,
  activeUsers: 24,
  pendingInvites: 4,
};

export default function StaffAdminDashboard() {
  const [data] = useState(SAMPLE);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Staff Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 32 }}>
        <Stat label="Users Created" value={data.usersCreated} />
        <Stat label="Active Users" value={data.activeUsers} />
        <Stat label="Pending Invites" value={data.pendingInvites} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <DashLink href="/users/create" label="Create New User" />
        <DashLink href="/users" label="Manage Users" />
      </div>
      <div style={{ marginTop: 36, color: '#888', fontSize: 14 }}>
        Create and manage staff and drivers for your organization.
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

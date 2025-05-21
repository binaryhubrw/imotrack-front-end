'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import FleetManagerDashboard from '@/components/dashboard/FleetManagerDashboard';
import StaffAdminDashboard from '@/components/dashboard/StaffAdminDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!user || !user.role) {
    return null;
  }

  //admin,fleet-manager,staff,staff-admin
  switch (user.role.toLowerCase()) {
    case 'super-admin':
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'fleet-manager':
    case 'fleet-manager':
      return <FleetManagerDashboard />;
    case 'staff-admin':
      return <StaffAdminDashboard />;
    default:
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Access Denied</h1>
            <p style={{ color: '#666', marginTop: 8 }}>You don&apos;t have permission to access this dashboard.</p>
          </div>
        </div>
      );
  }
}

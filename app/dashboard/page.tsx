'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  faUsers,
  faCar,
  faClipboardList,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'fleetmanager':
          router.push('/dashboard/fleetmanager');
          break;
        case 'hr':
          router.push('/dashboard/hr');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
        default:
          router.push('/dashboard/staff');
      }
    }
  }, [user, router]);

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          stats: [
            { label: 'Total Users', value: '150', icon: faUsers },
            { label: 'Active Vehicles', value: '45', icon: faCar },
            { label: 'Pending Requests', value: '12', icon: faClipboardList },
            { label: 'System Health', value: '98%', icon: faChartLine },
          ],
        };
      case 'fleetmanager':
        return {
          title: 'Fleet Manager Dashboard',
          stats: [
            { label: 'Available Vehicles', value: '25', icon: faCar },
            { label: 'Active Trips', value: '8', icon: faClipboardList },
            { label: 'Maintenance Due', value: '5', icon: faCar },
            { label: 'Fuel Usage', value: '1,200L', icon: faChartLine },
          ],
        };
      case 'hr':
        return {
          title: 'HR Dashboard',
          stats: [
            { label: 'Total Staff', value: '75', icon: faUsers },
            { label: 'Active Staff', value: '68', icon: faUsers },
            { label: 'Leave Requests', value: '15', icon: faClipboardList },
            { label: 'Training Programs', value: '4', icon: faChartLine },
          ],
        };
      case 'staff':
        return {
          title: 'Staff Dashboard',
          stats: [
            { label: 'My Requests', value: '3', icon: faClipboardList },
            { label: 'Available Vehicles', value: '12', icon: faCar },
            { label: 'Upcoming Trips', value: '2', icon: faClipboardList },
            { label: 'Recent Activities', value: '5', icon: faChartLine },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          stats: [],
        };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, stats } = getRoleSpecificContent();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SummaryCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
}

const SummaryCard = ({ title, count, icon, color }: SummaryCardProps) => {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 flex items-center justify-between">
      <div>
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <p className="text-xl font-bold mt-1">{count}</p>
      </div>
      <div className={`w-10 h-10 ${color} rounded-md flex items-center justify-center text-white`}>
        {icon}
      </div>
    </div>
  );
};

// Super Admin Dashboard Component
const SuperAdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          title="Organizations" 
          count={8} 
          icon="🏢" 
          color="bg-blue-500"
        />
        <SummaryCard 
          title="Active Users" 
          count={124} 
          icon="👥" 
          color="bg-[#0872b3]"
        />
        <SummaryCard 
          title="Pending Requests" 
          count={3} 
          icon="⏱️" 
          color="bg-yellow-500"
        />
        <SummaryCard 
          title="Issues" 
          count={2} 
          icon="⚠️" 
          color="bg-red-500"
        />
      </div>
      
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="border-b border-gray-100 pb-3">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Activity {item}</div>
                  <div className="text-sm text-gray-500">A few moments ago</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Staff Dashboard Component
const StaffDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          title="Pending Requests" 
          count={3} 
          icon="🚗" 
          color="bg-blue-500"
        />
        <SummaryCard 
          title="Approved Requests" 
          count={12} 
          icon="✓" 
          color="bg-[#0872b3]"
        />
        <SummaryCard 
          title="Completed Trips" 
          count={8} 
          icon="!" 
          color="bg-yellow-500"
        />
        <SummaryCard 
          title="Rejected Requests" 
          count={2} 
          icon="❌" 
          color="bg-red-500"
        />
      </div>
      
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Recent Requests</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border-b border-gray-100 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Request #{item}</div>
                  <div className="text-sm text-gray-500">Submitted on May 19, 2025</div>
                </div>
                <div className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                  Pending
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Fleet Manager Dashboard Component
const FleetManagerDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Fleet Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          title="Total Vehicles" 
          count={26} 
          icon="🚗" 
          color="bg-blue-500"
        />
        <SummaryCard 
          title="Active Trips" 
          count={12} 
          icon="🗺️" 
          color="bg-[#0872b3]"
        />
        <SummaryCard 
          title="Vehicle Issues" 
          count={3} 
          icon="⚠️" 
          color="bg-yellow-500"
        />
        <SummaryCard 
          title="Pending Requests" 
          count={8} 
          icon="⏱️" 
          color="bg-red-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Vehicle Status</h2>
          <div className="space-y-4">
            {['Available', 'In Use', 'Maintenance', 'Out of Service'].map((status, idx) => (
              <div key={status} className="flex justify-between items-center">
                <span>{status}</span>
                <div className="w-1/2 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#0872b3]" style={{ width: `${[70, 20, 5, 5][idx]}%` }}></div>
                </div>
                <span className="text-sm text-gray-500">{[70, 20, 5, 5][idx]}%</span>
              </div>  
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border-b border-gray-100 pb-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-100 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Activity {item}</div>
                    <div className="text-sm text-gray-500">A few moments ago</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Staff Admin Dashboard Component
const StaffAdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          title="Assigned Vehicles" 
          count={3} 
          icon="🚗" 
          color="bg-blue-500"
        />
        <SummaryCard 
          title="Completed Trips" 
          count={42} 
          icon="✓" 
          color="bg-[#0872b3]"
        />
        <SummaryCard 
          title="Upcoming Trips" 
          count={2} 
          icon="🗓️" 
          color="bg-yellow-500"
        />
        <SummaryCard 
          title="Issues Reported" 
          count={5} 
          icon="⚠️" 
          color="bg-red-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">My Vehicles</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center">
                      🚗
                    </div>
                    <div>
                      <div className="font-medium">Vehicle #{item}</div>
                      <div className="text-sm text-gray-500">Toyota Corolla</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    Available
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Upcoming Trips</h2>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="border-b border-gray-100 pb-3">
                <div className="font-medium">Trip #{item}</div>
                <div className="text-sm text-gray-500">May {20 + item}, 2025</div>
                <div className="text-sm mt-2">Location: Office to Client Site</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user || !user.role) {
    return null;
  }

  //admin,fleet-manager,staff,staff-admin
  switch (user.role.toLowerCase()) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'fleet-manager':
      return <FleetManagerDashboard />;
    case 'staff-admin':
      return <StaffAdminDashboard />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don&apos;t have permission to access this dashboard.</p>
          </div>
        </div>
      );
  }
}
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Invalid user data in localStorage');
      console.log(error)
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const adminItems = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/organizations', label: 'Organizations' },
      { href: '/users', label: 'Users' },
      { href: '/settings', label: 'Settings' },
    ];

    const fleetManagerItems = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/vehicles', label: 'Vehicles' },
      { href: '/drivers', label: 'Drivers' },
      { href: '/requests', label: 'Requests' },
      { href: '/maintenance', label: 'Maintenance' },
    ];

    const staffItems = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/requests', label: 'My Requests' },
      { href: '/profile', label: 'Profile' },
    ];

    const staffAdminItems = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/my-vehicles', label: 'My Vehicles' },
      { href: '/trips', label: 'My Trips' },
      { href: '/profile', label: 'Profile' },
    ];

    const role = user?.role?.toLowerCase();
    if (role === 'super-admin') return adminItems;
    if (role === 'fleet-manager') return fleetManagerItems;
    if (role === 'staff') return staffItems;
    if (role === 'staff-admin') return staffAdminItems;
    return [];
  };

  const navItems = getNavItems();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f5' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: sidebarOpen ? 'fixed' : 'relative',
          width: '250px',
          height: '100%',
          background: 'white',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          transform: sidebarOpen ? 'translateX(0)' : '',
          transition: 'transform 0.3s',
          zIndex: 30,
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Fleet Admin</span>
          <button onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'block' : 'none' }}>✕</button>
        </div>

        <nav style={{ padding: '20px 0' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  background: isActive ? '#f0f0f0' : 'transparent',
                  color: isActive ? '#2563eb' : '#333',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Top header */}
        <header style={{ background: 'white', padding: '15px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ☰
            </button>
            <div>
              <span style={{ marginRight: '10px' }}>{user?.name}</span>
              <button 
                onClick={handleLogout}
                style={{ padding: '5px 10px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

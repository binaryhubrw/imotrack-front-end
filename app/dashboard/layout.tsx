'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
  submenu?: NavItem[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
    const adminItems: NavItem[] = [
      { href: '/dashboard/super-admin', label: 'Dashboard', icon: '□' },
      { 
        href: '#', 
        label: 'Organizations', 
        icon: '□',
        submenu: [
          { href: '/dashboard/organizations', label: 'Organizations' },
          { href: '/dashboard/users', label: 'Users' }
        ]
      },
      { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    ];

    const fleetManagerItems: NavItem[] = [
      { href: '/dashboard/fleet-manager', label: 'Dashboard', icon: '□' },
      { href: '/dashboard/vehicles', label: 'Vehicles', icon: '🚗' },
      { href: '/dashboard/drivers', label: 'Drivers', icon: '👤' },
      { href: '/dashboard/requests', label: 'Requests', icon: '📝' },
      { href: '/dashboard/maintenance', label: 'Maintenance', icon: '🔧' },
    ];

    const staffItems: NavItem[] = [
      { href: '/dashboard/staff', label: 'Dashboard', icon: '□' },
      { href: '/dashboard/requests', label: 'My Requests', icon: '📝' },
      { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    ];

    const staffAdminItems: NavItem[] = [
      { href: '/dashboard/staff-admin', label: 'Dashboard', icon: '□' },
      { href: '/dashboard/my-vehicles', label: 'My Vehicles', icon: '🚗' },
      { href: '/dashboard/trips', label: 'My Trips', icon: '🗺️' },
      { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-full w-56 transform bg-[#003366] text-white transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between border-b border-blue-900 p-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-[#0872b3]"></div>
            <span className="text-lg font-bold">System Admin</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-white md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation items */}
        <div className="overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.submenu ? (
                <div>
                  <button 
                    onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-900 transition-colors duration-200"
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                  {openSubmenu === item.label && (
                    <div className="bg-blue-900/30">
                      {item.submenu.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block pl-12 pr-4 py-2 hover:bg-blue-900/50 transition-colors duration-200 ${
                            pathname === sub.href ? 'bg-blue-900/50' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-900 transition-colors duration-200 ${
                    pathname === item.href ? 'bg-blue-900/50' : ''
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section with logout */}
        <div className="mt-auto border-t border-blue-900">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-900 transition-colors duration-200"
          >
            <span className="w-5 text-center">⇨</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
            >
              ☰
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative mr-4">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="sr-only">Notifications</span>
                2
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              <span className="text-gray-700">{user?.name || 'Staff Name'}</span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
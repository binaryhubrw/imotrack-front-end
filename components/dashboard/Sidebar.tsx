'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  icon?: string;
  submenu?: NavItem[];
  roles?: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user?.role || '');
  }, []);

  //admin,fleet-manager,staff,staff-admin
  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: '□', roles: ['super-admin', 'fleet-manager', 'staff', 'staff-admin'] },
    { 
      title: 'Organizations', 
      href: '#',
      icon: '□',
      roles: ['super-admin'],
      submenu: [
        { title: 'Organizations', href: '/organizations' },
        { title: 'Users', href: '/organizations/users' }
      ]
    },
    { 
      title: 'Vehicles', 
      href: '/vehicles', 
      icon: '🚗',
      roles: ['fleet-manager', 'staff-admin'],
      submenu: [
        { title: 'Maintenance', href: '/vehicles/maintenance', roles: ['fleet-manager'] },
        { title: 'Assignments', href: '/vehicles/assignments' }
      ]
    },
    { title: 'Requests', href: '/requests', icon: '📝', roles: ['staff', 'fleet-manager'] },
    { title: 'Profile', href: '/profile', icon: '👤', roles: ['*'] }
  ];

  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole) || item.roles.includes('*')
  );

  return (
    <aside className="w-56 bg-[#003366] text-white h-screen flex flex-col">
      {/* Header with logo */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-900">
        <div className="w-6 h-6 bg-[#0872b3] rounded"></div>
        <span className="font-bold text-lg">System Admin</span>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <div key={item.title}>
            {item.submenu ? (
              <div>
                <button 
                  onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-900 transition-colors duration-200"
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.title}</span>
                </button>
                {openSubmenu === item.title && (
                  <div className="bg-blue-900/30">
                    {item.submenu.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block pl-12 pr-4 py-2 hover:bg-blue-900/50 transition-colors duration-200 ${
                          pathname === sub.href ? 'bg-blue-900/50' : ''
                        }`}
                      >
                        {sub.title}
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
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Bottom section with profile and logout */}
      <div className="mt-auto border-t border-blue-900">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-900 transition-colors duration-200">
          <span className="w-5 text-center">👤</span>
          <span>Profile</span>
        </Link>
        <Link href="/logout" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-900 transition-colors duration-200">
          <span className="w-5 text-center">⇨</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
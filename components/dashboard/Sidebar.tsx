'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
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
    { title: 'Dashboard', href: '/dashboard', roles: ['super-admin', 'fleet-manager', 'staff', 'staff-admin'] },
    { 
      title: 'Organizations', 
      href: '#',
      roles: ['super-admin'],
      submenu: [
        { title: 'Manage', href: '/organizations' },
        { title: 'Create', href: '/organizations/create' }
      ]
    },
    { 
      title: 'Vehicles', 
      href: '/vehicles', 
      roles: ['fleet-manager', 'staff-admin'],
      submenu: [
        { title: 'Maintenance', href: '/vehicles/maintenance', roles: ['fleet-manager'] },
        { title: 'Assignments', href: '/vehicles/assignments' }
      ]
    },
    { title: 'Requests', href: '/requests', roles: ['staff', 'fleet-manager'] },
    { title: 'Profile', href: '/profile', roles: ['*'] }
  ];

  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole) || item.roles.includes('*')
  );

  return (
    <aside className="w-64 bg-gray-50 p-4 h-screen">
      {filteredItems.map((item) => (
        <div key={item.title}>
          {item.submenu ? (
            <div>
              <button 
                onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                className="w-full p-2 text-left hover:bg-gray-200 rounded"
              >
                {item.title}
              </button>
              {openSubmenu === item.title && item.submenu.map(sub => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`block p-2 pl-6 ${pathname === sub.href ? 'bg-blue-100' : ''}`}
                >
                  {sub.title}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href={item.href}
              className={`block p-2 hover:bg-gray-200 rounded ${pathname === item.href ? 'bg-blue-100' : ''}`}
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </aside>
  );
}

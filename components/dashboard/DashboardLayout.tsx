'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = {
  admin: [
    { href: '/dashboard', label: 'Admin Dashboard' },
    { href: '/organizations', label: 'Organizations' }
  ],
  'fleet-manager': [
    { href: '/dashboard', label: 'Fleet Dashboard' },
    { href: '/vehicles', label: 'Vehicles' }
  ],
  staff: [
    { href: '/dashboard', label: 'Staff Dashboard' },
    { href: '/requests', label: 'Requests' }
  ],
  driver: [
    { href: '/dashboard', label: 'Driver Dashboard' },
    { href: '/my-vehicles', label: 'My Vehicles' }
  ]
};

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    if (!stored.role) router.push('/login');
    setUser(stored);
  }, [router]);

  if (!user) return null;
  const links = NAV[user.role] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 200, background: '#f4f4f4', padding: 16 }}>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'block',
              margin: '8px 0',
              fontWeight: pathname === link.href ? 'bold' : 'normal'
            }}
          >
            {link.label}
          </Link>
        ))}
        <button onClick={() => { localStorage.removeItem('user'); router.push('/login'); }}>
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}

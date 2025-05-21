'use client';

import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  onMenuButtonClick: () => void;
}

export default function DashboardHeader({ onMenuButtonClick }: DashboardHeaderProps) {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onMenuButtonClick} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>☰</button>
        <span style={{ fontWeight: 'bold', fontSize: 20 }}>KFLS Admin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && <span>Hi, {user.name || 'User'}</span>}
        <button onClick={handleLogout} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  );
}

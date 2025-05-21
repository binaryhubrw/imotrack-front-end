'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(stored);
    if (!user.role) {
      router.push('/login');
      return;
    }
    if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      setIsAllowed(true);
    } else {
      router.push('/dashboard');
    }
    setIsChecking(false);
  }, [allowedRoles, router]);

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Verifying access...</div>
      </div>
    );
  }

  return isAllowed ? <>{children}</> : null;
}

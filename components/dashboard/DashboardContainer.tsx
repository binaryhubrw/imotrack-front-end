'use client';

import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardContainer({ 
  children, 
  className = '' 
}: DashboardContainerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedPositions?: string[];
  requiredAccess?: {
    organizations?: boolean;
    units?: boolean;
    positions?: boolean;
    users?: boolean;
  };
}

export default function ProtectedRoute({
  children,
  allowedPositions,
  requiredAccess,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user has the required position
    if (allowedPositions && allowedPositions.length > 0) {
      const userPosition = user.position.position_name;
      if (!allowedPositions.includes(userPosition)) {
        router.push("/dashboard");
        return;
      }
    }

    // Check if user has required access permissions
    if (requiredAccess && user.position.position_access) {
      const userAccess = user.position.position_access;
      
      if (requiredAccess.organizations && !userAccess.organizations.view) {
        router.push("/dashboard");
        return;
      }
      
      if (requiredAccess.units && !userAccess.units.view) {
        router.push("/dashboard");
        return;
      }
      
      if (requiredAccess.positions && !userAccess.positions.view) {
        router.push("/dashboard");
        return;
      }
      
      if (requiredAccess.users && !userAccess.users.view) {
        router.push("/dashboard");
        return;
      }
    }

    setIsAllowed(true);
    setIsChecking(false);
  }, [isAuthenticated, user, isLoading, allowedPositions, requiredAccess, router]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return isAllowed ? <>{children}</> : null;
}

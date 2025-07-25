"use client";

import { useState, createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import Link from "next/link";
import {
  faBuilding,
  faCar,
  faUser,
  faUsers,
  faBell,
  faDashboard,
  faCog,
  faSignOutAlt,
  faMapPin,
  faCarRear,
  faCalendarCheck,
  faFileAlt,
  faUserTie,
  faBug,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardProvider } from "@/hooks/DashboardContext";
import { ArrowLeft, Home, Mail, RefreshCw, ShieldX } from "lucide-react";
import { NoPermissionUIProps } from "@/types/next-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Define all possible modules/pages and their nav info
const MODULE_NAV = [
  {
    key: "organizations",
    label: "Organizations",
    href: "/dashboard/shared_pages/organizations",
    icon: <FontAwesomeIcon icon={faBuilding} />,
  },
  {
    key: "units",
    label: "Units",
    href: "/dashboard/shared_pages/units",
    icon: <FontAwesomeIcon icon={faMapPin} />,
  },
  {
    key: "positions",
    label: "Positions",
    href: "/dashboard/shared_pages/positions",
    icon: <FontAwesomeIcon icon={faUserTie} />,
  },
  {
    key: "users",
    label: "Users",
    href: "/dashboard/shared_pages/users",
    icon: <FontAwesomeIcon icon={faUsers} />,
  },
  {
    key: "vehicleModels",
    label: "VehicleModels",
    href: "/dashboard/shared_pages/vehicle-model",
    icon: <FontAwesomeIcon icon={faCarRear} />,
  },
  {
    key: "vehicles",
    label: "Vehicles",
    href: "/dashboard/shared_pages/vehicles",
    icon: <FontAwesomeIcon icon={faCar} />,
  },
  {
    key: "reservations",
    label: "Reservations",
    href: "/dashboard/shared_pages/reservations",
    icon: <FontAwesomeIcon icon={faCalendarCheck} />,
  },
  {
    key: "vehicleIssues",
    label: "Vehicle Issues",
    href: "/dashboard/shared_pages/vehicle-issues",
    icon: <FontAwesomeIcon icon={faBug} />,
  },
  {
    key: "history",
    label: "Audit Logs",
    href: "/dashboard/shared_pages/audit-logs",
    icon: <FontAwesomeIcon icon={faFileAlt} />,
    superAdminOnly: true, // Only SuperAdmin can see this
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/dashboard/shared_pages/notifications",
    icon: <FontAwesomeIcon icon={faBell} />,
    public: true, // Everyone can access this
  },
  {
    key: "profile",
    label: "Profile",
    href: "/dashboard/shared_pages/profile",
    icon: <FontAwesomeIcon icon={faUser} />,
    public: true, // Everyone can access this
  },
];

// Dashboard Access Context
interface DashboardAccessContextType {
  isSuperAdmin: boolean;
  hasAnyAccess: (resource: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  access: Record<string, Record<string, boolean>>;
}

const DashboardAccessContext = createContext<DashboardAccessContextType>({
  isSuperAdmin: false,
  hasAnyAccess: () => false,
  hasPermission: () => false,
  access: {},
});

export function useDashboardAccess() {
  return useContext(DashboardAccessContext);
}

function NoPermissionUI({ 
  resource = 'this resource',
  onGoBack = () => window.history.back(),
  onGoHome = () => window.location.href = '/dashboard',
  onContactSupport,
  showRefresh = true
}: NoPermissionUIProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 py-8 relative overflow-hidden">
      {/* Enhanced Background Animation */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-0 left-0 w-full h-full opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, #06b6d4 0%, transparent 50%)`
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.22, 1, 0.36, 1],
          staggerChildren: 0.1
        }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-0 shadow-2xl shadow-black/10 bg-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                 }} />
          </div>
          
          <CardContent className="p-8 text-center relative z-10">
            {/* Enhanced Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="relative mx-auto mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 via-orange-100 to-red-50 rounded-3xl flex items-center justify-center mx-auto relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/5 animate-pulse" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <ShieldX className="w-12 h-12 text-red-600 relative z-10 drop-shadow-lg" />
                </motion.div>
              </div>
              
              {/* Enhanced Decorative elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-3 -right-3 w-8 h-8 border-2 border-red-200 rounded-full bg-red-50"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                  scale: [1, 0.8, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -left-2 w-6 h-6 border-2 border-orange-200 rounded-full bg-orange-50"
              />
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-1/2 w-3 h-3 bg-blue-200 rounded-full"
              />
            </motion.div>

            {/* Enhanced Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-gray-700 bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Access Denied
              </motion.h1>
              
              <motion.p 
                className="text-gray-600 text-lg mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You don&apos;t have the required permissions to access{" "}
                <span className="font-semibold text-gray-800 capitalize px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300 shadow-sm">
                  {resource}
                </span>
              </motion.p>

              {/* Enhanced Info Alert */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Alert className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 text-left shadow-sm">
                  <AlertDescription className="text-sm text-blue-800 leading-relaxed">
                    <strong>Need help?</strong> If you believe this is an error, please contact your system administrator or try refreshing the page. You can also go back to the previous page or return to the dashboard.
                  </AlertDescription>
                </Alert>
              </motion.div>
            </motion.div>

                    {/* Enhanced Action Buttons */}
                    <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={onGoBack}
                  className="group hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300 shadow-sm cursor-pointer px-8 py-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                  Go Back
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onGoHome}
                  className="group bg-[#0872b3] hover:bg-[#0661a0] transition-all duration-200 shadow-lg hover:shadow-xl text-white font-medium cursor-pointer px-8 py-5"
                >
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Dashboard
                </Button>
              </motion.div>

              {showRefresh && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleRefresh}
                    className="group hover:bg-green-50 hover:text-green-700 transition-all duration-200 border border-transparent hover:border-green-200 cursor-pointer px-8 py-5"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Refresh
                  </Button>
                </motion.div>
              )}
            </motion.div>


            {/* Enhanced Contact Support */}
            {onContactSupport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-100"
              >
                <Button
                  variant="link"
                  onClick={onContactSupport}
                  className="group text-gray-500 hover:text-blue-600 transition-colors p-0 h-auto font-normal hover:underline"
                >
                  <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Contact Support
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Decorative Background Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 left-10 w-40 h-40 bg-blue-200/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-xl -z-10"
        />
        <motion.div
          animate={{ 
            x: [0, 15, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 left-20 w-20 h-20 bg-purple-200/20 rounded-full blur-lg -z-10"
        />
      </motion.div>
    </div>
  );
}

// Helper function to get resource from pathname
function getResourceFromPathname(pathname: string): string | null {
  const pathSegments = pathname.split('/');
  const sharedPagesIndex = pathSegments.findIndex(segment => segment === 'shared_pages');
  
  if (sharedPagesIndex !== -1 && pathSegments[sharedPagesIndex + 1]) {
    const resource = pathSegments[sharedPagesIndex + 1];
    // Map URL paths to resource keys
    const resourceMap: Record<string, string> = {
      'vehicle-model': 'vehicleModels',
      'vehicle-issues': 'vehicleIssues',
      'audit-logs': 'history',
    };
    return resourceMap[resource] || resource;
  }
  
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Permission logic
  const permissionData = useMemo(() => {
    if (!user?.position?.position_access) {
      return {
        isSuperAdmin: false,
        access: {},
        hasAnyAccess: () => false,
        hasPermission: () => false,
      };
    }

    const access = user.position.position_access as Record<string, Record<string, boolean>>;
    const isSuperAdmin = !!access.organizations;

    const hasAnyAccess = (resource: string): boolean => {
      // SuperAdmin follows same rules as other users
      const resourceAccess = access[resource];
      if (!resourceAccess) return false;
      return Object.values(resourceAccess).some(Boolean);
    };

    const hasPermission = (resource: string, action: string): boolean => {
      // SuperAdmin follows same rules as other users
      const resourceAccess = access[resource];
      if (!resourceAccess) return false;
      return !!resourceAccess[action];
    };

    return {
      isSuperAdmin,
      access,
      hasAnyAccess,
      hasPermission,
    };
  }, [user?.position?.position_access]);

  const getNavItems = () => {
    if (!user) return [];
    
    return [
      {
        href: `/dashboard`,
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
      ...MODULE_NAV.filter((mod) => {
        if (mod.public) return true; // Always show public pages
        if (mod.superAdminOnly) return permissionData.isSuperAdmin; // SuperAdmin-only pages
        return permissionData.hasAnyAccess(mod.key);
      }),
    ];
  };

  // Check if current page requires permission
  const currentResource = getResourceFromPathname(pathname);
  const currentNavItem = MODULE_NAV.find(mod => mod.key === currentResource);
  
  const hasPageAccess = !currentResource || 
    currentNavItem?.public || // Public pages are always accessible
    (currentNavItem?.superAdminOnly && permissionData.isSuperAdmin) || // SuperAdmin-only pages
    permissionData.hasAnyAccess(currentResource); // Regular permission check

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Skeleton */}
        <aside className="fixed z-40 h-full w-64 bg-[#0872B3] text-white">
          <div className="flex items-center justify-between border-b border-[#0872B3] p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-sm bg-white/20" />
              <Skeleton className="h-6 w-32 bg-white/20" />
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-2 py-3 rounded-lg"
              >
                <Skeleton className="w-5 h-5 bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/20" />
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-blue-900/20">
            <Skeleton className="w-full h-10 bg-white/20" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-h-0">
          <header className="sticky top-0 z-20 flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
            <Skeleton className="h-8 w-8 md:hidden" />
            <Skeleton className="h-6 w-48 hidden md:block" />
            <div className="flex items-center gap-4 ml-auto">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="hidden md:block">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto w-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = getNavItems();

  return (
    <DashboardAccessContext.Provider value={permissionData}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-transparent bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed z-40 h-full w-64 transform bg-[#0872B3] text-white transition-transform duration-300 md:relative md:translate-x-0 md:z-10
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#0872B3] p-4">
            <div className="flex items-center gap-3">
              <Image
                src={(() => {
                  const logo = user.organization?.organization_logo?.trim();
                  if (!logo) return "/logo/logo.png";

                  try {
                    // Test if it's a valid URL or starts with / for local paths
                    if (
                      logo.startsWith("/") ||
                      logo.startsWith("./") ||
                      logo.startsWith("../")
                    ) {
                      return logo;
                    }
                    new URL(logo); // This will throw if invalid URL
                    return logo;
                  } catch {
                    return "/logo/logo.png";
                  }
                })()}
                width={40}
                height={40}
                alt="Organization Logo"
                className="rounded-full object-cover shadow-lg ring-4 ring-white"
              />
              <span className="text-lg font-bold capitalize">
                {user.organization.organization_name}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white md:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2 py-3 rounded-lg transition-colors duration-200 text-sm
                  ${
                    pathname === item.href
                      ? "bg-blue-900/50 text-white"
                      : "text-blue-100 hover:bg-blue-900/30 hover:text-white"
                  }
                `}
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-blue-900/20">
            <button
              onClick={logout}
              className="w-full py-2 rounded-lg bg-blue-900/70 hover:bg-blue-900/90 text-white font-semibold text-base transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Topbar for mobile and desktop */}
          <header className="sticky top-0 z-20 flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#0872B3] text-2xl focus:outline-none md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-[#0872B3] hidden md:block">
              {user.position.position_name} Dashboard
            </h1>
            <div className="flex items-center gap-4 ml-auto">
              <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg"
                >
                  {user.user.avatar ? (
                    <Image
                      width={24}
                      height={24}
                      src={user.user.avatar}
                      alt={`${user.user.first_name} ${user.user.last_name}`}
                      className="rounded-full object-cover shadow-lg ring-4 ring-white"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 font-bold text-base shadow-lg ring-4 ring-white"
                      aria-label={`${user.user.first_name} ${user.user.last_name}`}
                    >
                      {`${user.user.first_name?.[0] || ""}${
                        user.user.last_name?.[0] || ""
                      }`.toUpperCase()}
                    </div>
                  )}

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {user.user.first_name} {user.user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.position.position_name}
                    </p>
                  </div>
                </button>
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        router.push("/dashboard/shared_pages/profile");
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main content scrollable area */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto w-full">
              {hasPageAccess ? (
                <DashboardProvider>{children}</DashboardProvider>
              ) : (
                <NoPermissionUI resource={currentResource || 'unknown'} />
              )}
            </div>
          </main>
        </div>
      </div>
    </DashboardAccessContext.Provider>
  );
}

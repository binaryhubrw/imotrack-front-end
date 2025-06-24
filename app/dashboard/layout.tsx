"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  faBuilding,
  faCar,
  faUser,
  faUsers,
  faClipboardQuestion,
  faBell,
  faDashboard,
  faPeopleGroup,
  faCodePullRequest,
  faCog,
  faSignOutAlt,
  faQuestion,
  faPersonArrowUpFromLine,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect to role-specific dashboard if on main dashboard
    if (pathname === '/dashboard') {
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'fleetmanager':
          router.push('/dashboard/fleetmanager');
          break;
        case 'hr':
          router.push('/dashboard/hr');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
      }
    }

    setIsLoading(false);
  }, [user, router, pathname]);

  const getNavItems = (): NavItem[] => {
    const baseItems = [
      {
        href: `/dashboard/${user?.role}`,
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
    ];

    const roleSpecificItems = {
      admin: [
        {
          href: "/dashboard/admin/organizations",
          label: "Organizations",
          icon: <FontAwesomeIcon icon={faBuilding} />,
        },
        {
          href: "/dashboard/admin/users",
          label: "Users",
          icon: <FontAwesomeIcon icon={faUsers} />,
        },
      ],
      hr: [
        {
          href: "/dashboard/hr/staff-management",
          label: "Staff Management",
          icon: <FontAwesomeIcon icon={faPeopleGroup} />,
        },
        {
          href: "/dashboard/hr/vehicle-requests",
          label: "Vehicle Requests",
          icon: <FontAwesomeIcon icon={faCar} />,
        },
      ],
      fleetmanager: [
        {
          href: "/dashboard/fleet-manager/vehicles-info",
          label: "Vehicles",
          icon: <FontAwesomeIcon icon={faCar} />,
        },
        {
          href: "/dashboard/fleet-manager/issue-management",
          label: "Issues",
          icon: <FontAwesomeIcon icon={faClipboardQuestion} />,
        },
        {
          href: "/dashboard/fleet-manager/request-overview",
          label: "Request Management",
          icon: <FontAwesomeIcon icon={faCodePullRequest} />,
        },
      ],
      staff: [
        {
          href: "/dashboard/staff/vehicle-request",
          label: "Request Vehicle",
          icon: <FontAwesomeIcon icon={faCar} />,
        },
        {
          href: "/dashboard/staff/trip-history",
          label: "Trip History",
          icon: <FontAwesomeIcon icon={faUser} />,
        },
        {
          href: "/dashboard/staff/issue-management",
          label: "Issue Management",
          icon: <FontAwesomeIcon icon={faQuestion} />,
        },
        {
          href: "/dashboard/staff/notifications",
          label: "Notifications",
          icon: <FontAwesomeIcon icon={faBell} />,
        },
      ],
    };

    const userRole = user?.role as keyof typeof roleSpecificItems;
    return [...baseItems, ...(roleSpecificItems[userRole] || []), {
      href: `/dashboard/profile`,
      label: "Profile",
      icon: <FontAwesomeIcon icon={faPersonArrowUpFromLine} />,
    }];
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = getNavItems();

  return (
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
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0872B3] p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo.png"
              width={40}
              height={40}
              alt="logo"
              className="rounded-sm"
            />
            <span className="text-lg font-bold capitalize">
              {user?.role} Panel
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
                ${pathname === item.href
                  ? 'bg-blue-900/50 text-white'
                  : 'text-blue-100 hover:bg-blue-900/30 hover:text-white'}
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
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-[#0872B3] hidden md:block">
            {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Dashboard'}
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "Staff"}
                  </p>
                </div>
              </button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      router.push('/dashboard/profile');
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
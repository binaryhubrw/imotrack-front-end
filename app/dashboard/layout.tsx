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
          router.push('/dashboard/fleet-manager');
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
          href: "/dashboard/fleet-manager/vehicles",
          label: "Vehicles",
          icon: <FontAwesomeIcon icon={faCar} />,
        },
        {
          href: "/dashboard/fleet-manager/issue-management",
          label: "Issues",
          icon: <FontAwesomeIcon icon={faClipboardQuestion} />,
        },
        {
          href: "/dashboard/fleet-manager/requests",
          label: "Requests",
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
          href: "/dashboard/staff/notifications",
          label: "Notifications",
          icon: <FontAwesomeIcon icon={faBell} />,
        },
      ],
    };

    const userRole = user?.role as keyof typeof roleSpecificItems;
    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-full w-64 transform bg-[#0872B3] text-white transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                pathname === item.href
                  ? "bg-blue-900/50 text-white"
                  : "text-blue-100 hover:bg-blue-900/30 hover:text-white"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-[#0872B3] space-y-2">
          {/* <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              pathname === "/dashboard/profile"
                ? "bg-blue-900/50 text-white"
                : "text-blue-100 hover:bg-blue-900/30 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faPerson} className="w-5" />
            <span>Profile</span>
          </Link> */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-blue-100 hover:bg-red-600/30 hover:text-white w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* The header content will now be handled by the (dashboard)/layout.tsx */}
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
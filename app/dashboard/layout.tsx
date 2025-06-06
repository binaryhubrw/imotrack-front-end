"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  faBuilding,
  faCar,
  faUser,
  faPerson,
  faTowerCell,
  faUsers,
  faClipboardQuestion,
  faPieChart,
  faQuestionCircle,
  faBell,
  faDashboard,
  faPeopleGroup,
  faCodePullRequest,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  submenu?: NavItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check authentication from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error("Invalid user data in localStorage");
      console.log(error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const adminItems: NavItem[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
      {
        href: "#",
        label: "Organizations",
        icon: <FontAwesomeIcon icon={faBuilding} />,
        submenu: [
          {
            href: "/dashboard/organizations",
            label: "Organizations",
            icon: <FontAwesomeIcon icon={faTowerCell} />,
          },
          {
            href: "/dashboard/users",
            label: "Organization Users",
            icon: <FontAwesomeIcon icon={faUsers} />,
          },
        ],
      },
    ];

    const fleetManagerItems: NavItem[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
      {
        href: "/dashboard/vehicles-info",
        label: "Vehicles",
        icon: <FontAwesomeIcon icon={faCar} />,
      },
      {
        href: "/dashboard/issue-management",
        label: "Issue Management",
        icon: <FontAwesomeIcon icon={faClipboardQuestion} />,
      },
      {
        href: "/dashboard/request-overview",
        label: "Request Overview",
        icon: <FontAwesomeIcon icon={faPieChart} />,
      },
           {
        href: "/dashboard/request-management",
        label: "Request Management",
        icon: <FontAwesomeIcon icon={faCodePullRequest} />,
      }
    ];

    const staffItems: NavItem[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
      {
        href: "/dashboard/vehicle-request",
        label: "Vehicle Request",
        icon: <FontAwesomeIcon icon={faCar} />,
      },
      {
        href: "/dashboard/issue-reports",
        label: "Issue Reports",
        icon: <FontAwesomeIcon icon={faQuestionCircle} />,
      },
      {
        href: "/dashboard/trip-history",
        label: "Trip History",
        icon: <FontAwesomeIcon icon={faUser} />,
      },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: <FontAwesomeIcon icon={faBell} />,
      },
    ];

    const staffAdminItems: NavItem[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <FontAwesomeIcon icon={faDashboard} />,
      },
      {
        href: "/dashboard/staff-management",
        label: "Staff Management",
        icon: <FontAwesomeIcon icon={faPeopleGroup} />,
      },
      {
        href: "/dashboard/vehicle-requests",
        label: "Vehicle Requests",
        icon: <FontAwesomeIcon icon={faCar} />,
      },
    ];

    switch (user?.role) {
      case "super-admin":
        return adminItems;
      case "fleet-manager":
        return fleetManagerItems;
      case "staff":
        return staffItems;
      case "staff-admin":
        return staffAdminItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-full w-56 transform bg-[#0872B3] text-white transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between border-b border-blue-900 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo/logo.png"}
              width={50}
              height={50}
              alt="imotrack-logo"
              className=" rounded-sm"
            />
            <span className="text-lg font-bold">
              {user?.role
                ? `${user.role.charAt(0).toUpperCase()}${user.role
                    .slice(1)
                    .toLowerCase()} Dashboard`
                : "Dashboard"}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation items - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() =>
                      setOpenSubmenu(
                        openSubmenu === item.label ? null : item.label
                      )
                    }
                    className="flex w-full items-center gap-3 px-6 py-3 text-left hover:bg-blue-900 transition-colors duration-200"
                  >
                    <span className="w-6 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                  {openSubmenu === item.label && (
                    <div className="bg-blue-900/30">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block pl-14 pr-4 py-2 hover:bg-blue-900/50 transition-colors duration-200 ${
                            pathname === sub.href ? "bg-blue-900/50" : ""
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3  transition-colors duration-200 ${
                    pathname === item.href ? "bg-blue-900/50" : ""
                  }`}
                >
                  <span className="w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section with Profile and Logout - Always at bottom */}
        <div className="border-t border-blue-900 mt-auto flex-shrink-0">
          {/* Profile Link */}
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-900 transition-colors duration-200 ${
              pathname === "/dashboard/profile" ? "bg-blue-900/50" : ""
            }`}
          >
            <span className="w-5 text-center">
              <FontAwesomeIcon icon={faPerson} />
            </span>
            <span>Profile</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 w-full px-4 py-3 text-left hover:bg-blue-900 transition-colors duration-200"
          >
            <span className="w-5 text-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 md:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Notifications
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Sample notifications */}
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Vehicle Request Approved
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Your request for Toyota Camry has been approved
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Trip Completed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Your trip to downtown has been completed
                            successfully
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            Maintenance Alert
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Vehicle ABC-123 requires scheduled maintenance
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            3 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || "User Name"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace("-", " ") || "Staff"}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user?.name || "User Name"}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {user?.role?.replace("-", " ") || "Staff"}
                        </p>
                        <p className="text-xs text-gray-400">
                          user@company.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Settings</span>
                    </Link>

                    <Link
                      href="/dashboard/help"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Help & Support
                      </span>
                    </Link>
                  </div>

                  {/* Logout Section */}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 w-full"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Click outside to close modals */}
          {(showNotifications || showUserMenu) && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
            />
          )}
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

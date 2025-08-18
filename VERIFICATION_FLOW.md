# Email Verification and Password Setting Flow

This document explains the new email verification and password setting flow implemented in the FMS frontend.

## Overview

The new flow allows users to verify their email and set their password when they receive an invitation link. This replaces the previous password reset functionality for new user invitations.

## Flow Steps

### 1. User Receives Invitation Email
- User is created by an administrator
- System sends an invitation email with a verification link
- Link format: `https://your-domain.com/set-password?token=JWT_TOKEN`

### 2. User Clicks Verification Link
- User clicks the link in their email
- Frontend navigates to `/verify` page with the token as a query parameter
- Page automatically verifies the email using the token
- After successful verification, user is redirected to `/set-password` page

### 3. Email Verification
- Frontend calls `GET /v2/auth/verify?token=JWT_TOKEN`
- If successful:
  - Email is verified
  - New access token is received and stored in `localStorage` as `verification_token`
  - User is redirected to `/set-password` page
- If already verified:
  - Shows "already verified" message
  - Redirects to login
- If invalid/expired:
  - Shows error message
  - User needs new invitation

### 4. Password Setting
- After successful verification, user sees password form
- User enters and confirms new password
- Frontend calls `POST /v2/auth/set-password-and-verify` with:
  - Authorization header with the verification token (stored in localStorage)
  - Request body: `{ "password": "StrongPassword123!" }`
- Verification token is cleared after successful password setting

### 5. Account Activation
- If successful:
  - Account is fully verified and activated
  - Password is set
  - User is redirected to login page
- User can now login with their email and new password

## API Endpoints

### Verify Email
```
GET /v2/auth/verify?token=JWT_TOKEN
```

**Response:**
```json
{
  "message": "User verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Set Password and Verify
```
POST /v2/auth/set-password-and-verify
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "message": "Account verified and password set successfully",
  "data": {
    "auth_id": "1a2b3c4d-5e6f-7890-abcd-1234567890ef",
    "email": "user@example.com",
    "updated_at": "2025-08-06T12:00:00.000Z",
    "user_status": "ACTIVE"
  }
}
```

## Frontend Implementation

### New Types Added
- `VerifyEmailRequest`
- `VerifyEmailResponse`
- `SetPasswordAndVerifyRequest`
- `SetPasswordAndVerifyResponse`

### New Queries Added
- `useVerifyEmail()` - Verifies email with token
- `useSetPasswordAndVerify()` - Sets password and completes verification

### Updated Components
- `/app/(auth)/verify/page.tsx` - New page for email verification
- `/app/(auth)/set-password/page.tsx` - Updated to handle password setting only
- `services/auth.ts` - Added verification methods
- `lib/queries.ts` - Added new API queries

## Error Handling

### Email Verification Errors
- **409 Conflict**: Email already verified
- **400/401**: Invalid or expired token
- **500**: Server error

### Password Setting Errors
- **409 Conflict**: Account already verified
- **401**: Missing or invalid access token
- **400**: Invalid password format
- **500**: Server error

## Security Considerations

1. **Token Storage**: Verification token is stored in localStorage as `verification_token` after email verification
2. **Token Validation**: All API calls validate token presence and format
3. **Password Requirements**: Frontend enforces minimum 8 characters
4. **Error Messages**: Generic error messages to prevent information leakage
5. **Token Cleanup**: Verification token is cleared after successful password setting or on errors

## Testing

To test the flow:

1. Create a user through the admin interface
2. Check the invitation email for the verification link
3. Click the link to navigate to the set-password page
4. Verify the email verification step works
5. Set a password and verify the account activation
6. Test login with the new credentials

## Migration Notes

- The old password reset functionality remains intact for existing users
- New users will use this verification flow
- The `/verify` route handles email verification
- The `/set-password` route now handles password setting only
- Backward compatibility is maintained for existing password reset links 




________________________________________________________________
"use client";

import { useState, useRef, useEffect, createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardProvider } from "@/hooks/DashboardContext";
import NoPermissionUI from "@/components/NoPermissionUI";
import { useNotifications } from "@/lib/queries";

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
    label: "History",
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

// Helper function to get resource from pathname
function getResourceFromPathname(pathname: string): string | null {
  const pathSegments = pathname.split("/");
  const sharedPagesIndex = pathSegments.findIndex(
    (segment) => segment === "shared_pages"
  );

  if (sharedPagesIndex !== -1 && pathSegments[sharedPagesIndex + 1]) {
    const resource = pathSegments[sharedPagesIndex + 1];
    // Map URL paths to resource keys
    const resourceMap: Record<string, string> = {
      "vehicle-model": "vehicleModels",
      "vehicle-issues": "vehicleIssues",
      "audit-logs": "history",
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
  // --- Click-away logic for user menu ---
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    if (!showSettings) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { data: notifications = [] } = useNotifications();

  // Scroll to top functionality
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const scrollTop = mainRef.current.scrollTop;
        console.log('Scroll position:', scrollTop);
        console.log(showScrollToTop) // Debug log
        setShowScrollToTop(scrollTop > 100); // Lowered threshold to 100px
      }
    };

    // Use a timeout to ensure the ref is attached
    const timeoutId = setTimeout(() => {
      const mainElement = mainRef.current;
      if (mainElement) {
        mainElement.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => mainElement.removeEventListener('scroll', handleScroll);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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

    const access = user.position.position_access as Record<
      string,
      Record<string, boolean>
    >;
    // Super admin should have organizations view permission specifically
    const isSuperAdmin = !!access.organizations?.view;

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
  const currentNavItem = MODULE_NAV.find((mod) => mod.key === currentResource);

  const hasPageAccess =
    !currentResource ||
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
            className="fixed inset-0 z-30 bg-[#0872B3]/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed z-35 h-full w-64 transform bg-gradient-to-b from-[#0872B3] to-[#065a8a] text-white transition-transform duration-300 md:relative md:translate-x-0 md:z-10 flex flex-col
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      overflow-y-auto custom-blue-scrollbar
    `}
        >
          {/* Custom scrollbar styles for blue sidebar */}
          <style jsx global>{`
            .custom-blue-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-blue-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.18);
              border-radius: 8px;
            }
            .custom-blue-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-blue-scrollbar {
              scrollbar-color: rgba(255,255,255,0.18) transparent;
              scrollbar-width: thin;
            }
          `}</style>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 p-6">
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
                className="rounded-full object-cover shadow-lg ring-2 ring-white/30"
              />
              <span className="text-lg font-bold capitalize">
                {user.organization.organization_name}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/80 hover:text-white md:hidden p-1 cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation - Flex-grow to take available space */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group
            ${
              pathname === item.href
                ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
            }
          `}
              >
                <span className="w-5 text-center transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={logout}
              className="w-full py-3 px-4 cursor-pointer rounded-xl bg-white/10 hover:bg-red-500/80 text-white font-semibold text-sm transition-all duration-200 backdrop-blur-sm hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2" />
              <span className="transition-transform group-hover:translate-x-1">
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Topbar for mobile and desktop */}
          <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 backdrop-blur-sm shadow-sm px-4 py-3 md:px-6 md:py-4 border-b border-gray-200/80">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#0872B3] text-2xl cursor-pointer focus:outline-none md:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
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
              <button
                onClick={() =>
                  router.push("/dashboard/shared_pages/notifications")
                }
                className="relative p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {notifications.length > 99 ? "99+" : notifications.length}
                  </span>
                )}
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className="flex cursor-pointer items-center gap-3 hover:bg-gray-100/80 p-3 rounded-xl transition-all duration-200"
                >
                  {user.user.avatar ? (
                    <Image
                      width={32}
                      height={32}
                      src={user.user.avatar}
                      alt={`${user.user.first_name} ${user.user.last_name}`}
                      className="rounded-full object-cover shadow-lg ring-2 ring-gray-200"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-sm shadow-lg"
                      aria-label={`${user.user.first_name} ${user.user.last_name}`}
                    >
                      {`${user.user.first_name?.[0] || ""}${
                        user.user.last_name?.[0] || ""
                      }`.toUpperCase()}
                    </div>
                  )}

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.user.first_name} {user.user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.position.position_name}
                    </p>
                  </div>
                </button>
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl py-2 z-50 border border-gray-200/50">
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        router.push("/dashboard/shared_pages/profile");
                      }}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100/80 w-full text-left transition-colors rounded-lg mx-1"
                    >
                      <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 w-full text-left transition-colors rounded-lg mx-1"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="w-4 h-4"
                      />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main content scrollable area */}
          <main 
            ref={mainRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-gray-50 to-blue-50/30"
          >
            <div className="max-w-7xl mx-auto w-full">
              {hasPageAccess ? (
                <DashboardProvider>{children}</DashboardProvider>
              ) : (
                <NoPermissionUI resource={currentResource || "unknown"} />
              )}
            </div>
          </main>

          {/* Dashboard Footer */}
          <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-4 py-2 md:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-evenly gap-2">
              {/* Center - Copyright */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Image
                    width={16}
                    height={16}
                    src="/logo/logo.png"
                    alt="Imotarak Logo"
                    className="rounded-sm"
                  />
                  <p className="text-xs text-gray-500">
                    © {new Date().getFullYear()} Imotarak System
                  </p>
                </div>
              </div>
            

              {/* Right side - Powered by */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Powered by</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-[#0872B3]">
                    Binary Hub
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Scroll to Top Button - Only on main content area */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-0 left-4 right-4 md:left-64 md:right-4 z-50 h-12 bg-[#0872B3] hover:bg-[#065a8a] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border-t border-[#065a8a]/20 rounded-t-lg"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon 
            icon={faArrowUp} 
            className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-0.5" 
          />
          <span className="font-medium text-sm">Back to top</span>
        </button>
      </div>
    </DashboardAccessContext.Provider>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useOrganizations,
  useOrganizationUnits,
  useUsers,
  useVehicles,
  useVehicleModels,
  useReservations,
  useVehicleIssues, // Add this import
} from "@/lib/queries";
import { position_accesses } from "@/types/next-auth";
import type { UserWithPositions, Organization } from '@/types/next-auth';

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalUnits: number;
  totalPositions: number;
  totalVehicles: number;
  totalReservations: number;
  totalVehicleModels: number;
  totalVehicleIssues: number; // Added
  activeVehicles: number;
  inactiveVehicles: number;
  pendingRequests: number;
}

// Recent activity interface
export interface RecentActivity {
  id: string;
  type:
    | "user_created"
    | "vehicle_added"
    | "organization_updated"
    | "position_assigned"
    | "unit_created";
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// Quick actions interface
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  permission: keyof position_accesses;
  action: "create" | "view" | "update" | "delete";
}

// Dashboard context interface
export interface DashboardContextType {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Default context value
const defaultContext: DashboardContextType = {
  stats: {
    totalUsers: 0,
    totalOrganizations: 0,
    totalUnits: 0,
    totalPositions: 0,
    totalReservations: 0,
    totalVehicles: 0,
    totalVehicleModels: 0,
    totalVehicleIssues: 0, // Added
    activeVehicles: 0,
    inactiveVehicles: 0,
    pendingRequests: 0,
  },
  recentActivity: [],
  quickActions: [],
  isLoading: false,
  error: null,
  refetch: () => {},
};

// Create context
const DashboardContext = createContext<DashboardContextType>(defaultContext);

// Dashboard provider component
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permission checks - only check if user exists
  const canViewOrganizations = !!user?.position?.position_access?.organizations?.view;
  const canViewUnits = !!user?.position?.position_access?.units?.view;
  const canViewUsers = !!user?.position?.position_access?.users?.view;
  const canViewVehicles = !!user?.position?.position_access?.vehicles?.view;
  const canViewVehicleModels = !!user?.position?.position_access?.vehicleModels?.view;
  const canViewReservations = !!user?.position?.position_access?.reservations?.view;
  const canViewVehicleIssues = !!user && !!user.position?.position_access?.vehicleIssues?.view;

  // Always call all hooks to maintain consistent order
  const orgsHook = useOrganizations(1, 100);
  const unitsHook = useOrganizationUnits();
  const usersHook = useUsers();
  const vehiclesHook = useVehicles();
  const vehicleModelsHook = useVehicleModels();
  const reservationsHook = useReservations();
  const vehicleIssuesHook = useVehicleIssues();

  // Get data and loading states based on permissions
  const organizations = canViewOrganizations ? orgsHook.data : undefined;
  const orgsLoading = canViewOrganizations ? orgsHook.isLoading : false;
  const orgsError = canViewOrganizations ? orgsHook.error : null;
  const refetchOrgs = canViewOrganizations ? orgsHook.refetch : () => {};

  const units = canViewUnits ? unitsHook.data : undefined;
  const unitsLoading = canViewUnits ? unitsHook.isLoading : false;
  const unitsError = canViewUnits ? unitsHook.error : null;
  const refetchUnits = canViewUnits ? unitsHook.refetch : () => {};

  const users = canViewUsers ? usersHook.data : undefined;
  const usersLoading = canViewUsers ? usersHook.isLoading : false;
  const usersError = canViewUsers ? usersHook.error : null;
  const refetchUsers = canViewUsers ? usersHook.refetch : () => {};

  const vehicles = canViewVehicles ? vehiclesHook.data : undefined;
  const vehiclesLoading = canViewVehicles ? vehiclesHook.isLoading : false;
  const vehiclesError = canViewVehicles ? vehiclesHook.error : null;
  const refetchVehicles = canViewVehicles ? vehiclesHook.refetch : () => {};

  const vehicleModels = canViewVehicleModels ? vehicleModelsHook.data : undefined;
  const vehicleModelsLoading = canViewVehicleModels ? vehicleModelsHook.isLoading : false;
  const vehicleModelsError = canViewVehicleModels ? vehicleModelsHook.error : null;
  const refetchVehicleModels = canViewVehicleModels ? vehicleModelsHook.refetch : () => {};

  const reservations = canViewReservations ? reservationsHook.data : undefined;
  const reservationsLoading = canViewReservations ? reservationsHook.isLoading : false;
  const reservationsError = canViewReservations ? reservationsHook.error : null;
  const refetchReservations = canViewReservations ? reservationsHook.refetch : () => {};

  const vehicleIssues = canViewVehicleIssues ? vehicleIssuesHook.data : undefined;
  const vehicleIssuesLoading = canViewVehicleIssues ? vehicleIssuesHook.isLoading : false;
  const vehicleIssuesError = canViewVehicleIssues ? vehicleIssuesHook.error : null;
  const refetchVehicleIssues = canViewVehicleIssues ? vehicleIssuesHook.refetch : () => {};

  // Calculate dashboard stats (robust to data shape)
  const calculateStats = (): DashboardStats => {
    // Organizations: can be { organizations: Organization[], ... } or Organization[]
    type Organization = { organization_id: string };
    let orgArr: Organization[] = [];
    if (Array.isArray(organizations)) {
      orgArr = organizations as Organization[];
    } else if (
      organizations &&
      typeof organizations === 'object' &&
      Array.isArray((organizations as { organizations?: unknown }).organizations)
    ) {
      orgArr = (organizations as { organizations: Organization[] }).organizations;
    }
    const totalOrganizations = canViewOrganizations ? orgArr.length : 0;

    // Units: should be array
    const unitArr = Array.isArray(units) ? units : [];
    const totalUnits = canViewUnits ? unitArr.length : 0;

    // Users: flat array
    const totalUsers = canViewUsers && Array.isArray(users) ? users.length : 0;

    // Positions: sum all positions in all users
    let totalPositions = 0;
    if (canViewUsers && Array.isArray(users)) {
      totalPositions = (users as unknown as UserWithPositions[]).reduce((total, user) => {
        if (Array.isArray(user.positions)) {
          return total + user.positions.length;
        }
        return total;
      }, 0);
    }
  

    // Vehicles: should be array
    const vehicleArr = Array.isArray(vehicles) ? vehicles : [];
    const totalVehicles = canViewVehicles ? vehicleArr.length : 0;
    const activeVehicles = canViewVehicles ? vehicleArr.filter((v) => v.vehicle_status === "ACTIVE").length : 0;
    const inactiveVehicles = canViewVehicles ? vehicleArr.filter((v) => v.vehicle_status === "INACTIVE").length : 0;

    // Vehicle Models: should be array
    const vehicleModelArr = Array.isArray(vehicleModels) ? vehicleModels : [];
    const totalVehicleModels = canViewVehicleModels ? vehicleModelArr.length : 0;

    // Reservations: should be array
    const reservationArr = Array.isArray(reservations) ? reservations : [];
    const totalReservations = canViewReservations ? reservationArr.length : 0;

    // Vehicle Issues: should be array
    const vehicleIssuesArr = Array.isArray(vehicleIssues) ? vehicleIssues : [];
    const totalVehicleIssues = canViewVehicleIssues ? vehicleIssuesArr.length : 0;

    return {
      totalUsers,
      totalOrganizations,
      totalUnits,
      totalPositions,
      totalVehicles,
      totalVehicleModels,
      totalVehicleIssues, // Added
      activeVehicles,
      totalReservations,
      inactiveVehicles,
      pendingRequests: 0, // This would need to come from a reservations/requests API
    };
  };

  // Generate recent activity based on permissions
  const generateRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent users (last 5) - only if user has permission
    if (canViewUsers && Array.isArray(users)) {
      (users as unknown as UserWithPositions[]).slice(-5).forEach((user) => {
        activities.push({
          id: `user_${user.user_id}`,
          type: "user_created",
          message: `New user ${user.first_name} ${user.last_name} added`,
          timestamp: new Date().toISOString(), // In real app, this would come from API
          userId: user.user_id,
          userName: `${user.first_name} ${user.last_name}`,
        });
      });
    }

    // Add recent vehicles (last 3) - only if user has permission
    if (canViewVehicles && Array.isArray(vehicles)) {
      vehicles.slice(-3).forEach((vehicle) => {
        activities.push({
          id: `vehicle_${vehicle.vehicle_id}`,
          type: "vehicle_added",
          message: `Vehicle ${vehicle.plate_number} (${vehicle.vehicle_type}) added to fleet`,
          timestamp: vehicle.created_at,
        });
      });
    }

    // Add recent units (last 2) - only if user has permission
    if (canViewUnits && Array.isArray(units)) {
      units.slice(-2).forEach((unit) => {
        activities.push({
          id: `unit_${unit.unit_id}`,
          type: "unit_created",
          message: `New unit "${unit.unit_name}" created`,
          timestamp: unit.created_at,
        });
      });
    }

    // Add recent organizations (last 2) - only if user has permission
    if (canViewOrganizations) {
      const orgArr = Array.isArray(organizations) ? organizations : 
        (organizations && typeof organizations === 'object' && Array.isArray((organizations as { organizations?: unknown }).organizations)) 
          ? (organizations as { organizations: Organization[] }).organizations : [];
      
      orgArr.slice(-2).forEach((org) => {
        activities.push({
          id: `org_${org.organization_id}`,
          type: "organization_updated",
          message: `Organization "${org.organization_name}" updated`,
          timestamp: org.updated_at || new Date().toISOString(),
        });
      });
    }

    // Add recent vehicle issues (last 2) if user has permission
    if (canViewVehicleIssues && Array.isArray(vehicleIssues)) {
      vehicleIssues.slice(-2).forEach((issue: any) => {
        activities.push({
          id: `vehicle_issue_${issue.issue_id || issue.id}`,
          type: "vehicle_issue_reported" as any,
          message: `Vehicle issue reported: ${issue.issue_title || issue.title || issue.issue_id || issue.id}`,
          timestamp: issue.created_at || new Date().toISOString(),
        });
      });
    }

    // Sort by timestamp (most recent first) and limit to 10
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  };

  // Generate quick actions based on user permissions
  const generateQuickActions = (): QuickAction[] => {
    if (!user?.position?.position_access) return [];

    const actions: QuickAction[] = [];
    const permissions = user.position.position_access;

    // Organizations
    if (permissions.organizations?.create) {
      actions.push({
        id: "create_organization",
        title: "Add Organization",
        description: "Create a new organization",
        icon: "Building",
        href: "/dashboard/shared_pages/organizations",
        color: "bg-blue-100 text-blue-800",
        permission: "organizations",
        action: "create",
      });
    }

    // Units
    if (permissions.units?.create) {
      actions.push({
        id: "create_unit",
        title: "Add Unit",
        description: "Create a new unit",
        icon: "MapPin",
        href: "/dashboard/shared_pages/units",
        color: "bg-green-100 text-green-800",
        permission: "units",
        action: "create",
      });
    }

    // Users
    if (permissions.users?.create) {
      actions.push({
        id: "create_user",
        title: "Add User",
        description: "Create a new user account",
        icon: "Users",
        href: "/dashboard/shared_pages/users",
        color: "bg-purple-100 text-purple-800",
        permission: "users",
        action: "create",
      });
    }

    // Positions
    if (permissions.positions?.create) {
      actions.push({
        id: "create_position",
        title: "Add Position",
        description: "Create a new position",
        icon: "Shield",
        href: "/dashboard/shared_pages/positions",
        color: "bg-orange-100 text-orange-800",
        permission: "positions",
        action: "create",
      });
    }

    // Vehicles
    if (permissions.vehicles?.create) {
      actions.push({
        id: "create_vehicle",
        title: "Add Vehicle",
        description: "Add a new vehicle to fleet",
        icon: "Car",
        href: "/dashboard/shared_pages/vehicles",
        color: "bg-indigo-100 text-indigo-800",
        permission: "vehicles",
        action: "create",
      });
    }

    // Vehicle Models
    if (permissions.vehicleModels?.create) {
      actions.push({
        id: "create_vehicle_model",
        title: "Add Vehicle Model",
        description: "Add a new vehicle model",
        icon: "Settings",
        href: "/dashboard/shared_pages/vehicle-models",
        color: "bg-teal-100 text-teal-800",
        permission: "vehicleModels",
        action: "create",
      });
    }

    // Reservations
    if (permissions.reservations?.create) {
      actions.push({
        id: "create_reservation",
        title: "Create Reservation",
        description: "Create a new reservation",
        icon: "FileText",
        href: "/dashboard/shared_pages/reservations",
        color: "bg-pink-100 text-pink-800",
        permission: "reservations",
        action: "create",
      });
    }

    // View actions for modules user can access but can't create
    if (permissions.organizations?.view && !permissions.organizations?.create) {
      actions.push({
        id: "view_organizations",
        title: "View Organizations",
        description: "Browse organizations",
        icon: "Building",
        href: "/dashboard/shared_pages/organizations",
        color: "bg-gray-100 text-gray-800",
        permission: "organizations",
        action: "view",
      });
    }

    if (permissions.units?.view && !permissions.units?.create) {
      actions.push({
        id: "view_units",
        title: "View Units",
        description: "Browse organizational units",
        icon: "MapPin",
        href: "/dashboard/shared_pages/units",
        color: "bg-gray-100 text-gray-800",
        permission: "units",
        action: "view",
      });
    }

    if (permissions.users?.view && !permissions.users?.create) {
      actions.push({
        id: "view_users",
        title: "View Users",
        description: "Browse user accounts",
        icon: "Users",
        href: "/dashboard/shared_pages/users",
        color: "bg-gray-100 text-gray-800",
        permission: "users",
        action: "view",
      });
    }

    if (permissions.vehicles?.view && !permissions.vehicles?.create) {
      actions.push({
        id: "view_vehicles",
        title: "View Fleet",
        description: "Browse vehicle fleet",
        icon: "Car",
        href: "/dashboard/shared_pages/vehicles",
        color: "bg-gray-100 text-gray-800",
        permission: "vehicles",
        action: "view",
      });
    }

    if (permissions.vehicleModels?.view && !permissions.vehicleModels?.create) {
      actions.push({
        id: "view_vehicle_models",
        title: "View Vehicle Models",
        description: "Browse vehicle models",
        icon: "Settings",
        href: "/dashboard/shared_pages/vehicle-models",
        color: "bg-gray-100 text-gray-800",
        permission: "vehicleModels",
        action: "view",
      });
    }

    if (permissions.reservations?.view && !permissions.reservations?.create) {
      actions.push({
        id: "view_reservations",
        title: "View Reservations",
        description: "Browse reservations",
        icon: "FileText",
        href: "/dashboard/shared_pages/reservations",
        color: "bg-gray-100 text-gray-800",
        permission: "reservations",
        action: "view",
      });
    }

    // Add quick action for vehicle issues
    if (permissions.vehicleIssues?.report) {
      actions.push({
        id: "report_vehicle_issue",
        title: "Report Vehicle Issue",
        description: "Report a new vehicle issue",
        icon: "AlertCircle",
        href: "/dashboard/shared_pages/vehicle-issues",
        color: "bg-red-100 text-red-800",
        permission: "vehicleIssues",
        action: "create",
      });
    }

    // View actions for vehicle issues (if user can view but not report)
    if (permissions.vehicleIssues?.view && !permissions.vehicleIssues?.report) {
      actions.push({
        id: "view_vehicle_issues",
        title: "View Vehicle Issues",
        description: "Browse vehicle issues",
        icon: "AlertCircle",
        href: "/dashboard/shared_pages/vehicle-issues",
        color: "bg-gray-100 text-gray-800",
        permission: "vehicleIssues",
        action: "view",
      });
    }

    return actions.slice(0, 8); // Limit to 8 actions
  };

  // Refetch all data based on permissions
  const refetch = () => {
    if (canViewOrganizations) refetchOrgs();
    if (canViewUnits) refetchUnits();
    if (canViewUsers) refetchUsers();
    if (canViewVehicles) refetchVehicles();
    if (canViewVehicleModels) refetchVehicleModels();
    if (canViewReservations) refetchReservations();
    if (canViewVehicleIssues) refetchVehicleIssues();
  };

  // Update loading state - only consider loading for permissions user has
  useEffect(() => {
    const loading =
      authLoading ||
      (canViewOrganizations && orgsLoading) ||
      (canViewUnits && unitsLoading) ||
      (canViewUsers && usersLoading) ||
      (canViewReservations && reservationsLoading) ||
      (canViewVehicles && vehiclesLoading) ||
      (canViewVehicleModels && vehicleModelsLoading) ||
      (canViewVehicleIssues && vehicleIssuesLoading);
    setIsLoading(loading);
  }, [
    authLoading,
    canViewOrganizations,
    orgsLoading,
    canViewUnits,
    unitsLoading,
    canViewUsers,
    usersLoading,
    canViewReservations,
    reservationsLoading,
    canViewVehicles,
    vehiclesLoading,
    canViewVehicleModels,
    vehicleModelsLoading,
    canViewVehicleIssues,
    vehicleIssuesLoading,
  ]);

  // Update error state - only consider errors for permissions user has
  useEffect(() => {
    // Only show errors that are not 403/404 (forbidden/not found)
    const filter403 = (err: unknown) => {
      if (!err) return false;
      if (typeof err === 'object' && err !== null) {
        const e = err as { response?: { status?: number }, message?: string };
        if (e.response && (e.response.status === 403 || e.response.status === 404)) return false;
        if ('status' in e && (e.status === 403 || e.status === 404)) return false;
        if (e.message === 'No data') return false;
      }
      if (typeof err === 'string' && (err.includes('403') || err.includes('404') || err === 'No data')) return false;
      return true;
    };
    
    const errors = [
      canViewOrganizations ? orgsError : null,
      canViewUnits ? unitsError : null,
      canViewUsers ? usersError : null,
      canViewVehicles ? vehiclesError : null,
      canViewReservations ? reservationsError : null,
      canViewVehicleModels ? vehicleModelsError : null,
      canViewVehicleIssues ? vehicleIssuesError : null,
    ]
      .filter(filter403)
      .map((err) => err?.message || 'Unknown error');
    
    // Only set error if there are non-403/404 errors
    setError(errors.length > 0 ? errors.join(', ') : null);
  }, [
    canViewOrganizations,
    orgsError,
    canViewUnits,
    unitsError,
    canViewUsers,
    usersError,
    canViewVehicles,
    vehiclesError,
    canViewReservations,
    reservationsError,
    canViewVehicleModels,
    vehicleModelsError,
    canViewVehicleIssues,
    vehicleIssuesError,
  ]);

  // Context value
  const contextValue: DashboardContextType = {
    stats: calculateStats(),
    recentActivity: generateRecentActivity(),
    quickActions: generateQuickActions(),
    isLoading,
    error,
    refetch,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

// Export context for testing purposes
export { DashboardContext };

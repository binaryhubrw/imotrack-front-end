"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useOrganizations,
  useOrganizationUnits,
  useUsers,
  useVehicles,
  useVehicleModels,
} from "@/lib/queries";
import { position_accesses } from "@/types/next-auth";

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalUnits: number;
  totalPositions: number;
  totalVehicles: number;
  totalVehicleModels: number;
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
    totalVehicles: 0,
    totalVehicleModels: 0,
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

  // Fetch data based on user permissions
  const {
    data: organizations,
    isLoading: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs,
  } = useOrganizations(1, 100);

  const {
    data: units,
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits,
  } = useOrganizationUnits();

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers();

  const {
    data: vehicles,
    isLoading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehicles();

  const {
    data: vehicleModels,
    isLoading: vehicleModelsLoading,
    error: vehicleModelsError,
    refetch: refetchVehicleModels,
  } = useVehicleModels();

  // Debug logs for API data
  useEffect(() => {
    console.log("[DashboardContext] organizations:", organizations);
    console.log("[DashboardContext] units:", units);
    console.log("[DashboardContext] users:", users);
    console.log("[DashboardContext] vehicles:", vehicles);
    console.log("[DashboardContext] vehicleModels:", vehicleModels);
  }, [organizations, units, users, vehicles, vehicleModels]);

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
    const totalOrganizations = orgArr.length;
    console.log('[DashboardContext] totalOrganizations:', totalOrganizations, orgArr);

    // Units: should be array
    const unitArr = Array.isArray(units) ? units : [];
    const totalUnits = unitArr.length;
    console.log('[DashboardContext] totalUnits:', totalUnits, unitArr);

    // Users: can be array of units with .users[]
    let totalUsers = 0;
    if (Array.isArray(users)) {
      totalUsers = users.reduce((total, unit) => {
        if (Array.isArray(unit.users)) {
          return total + unit.users.length;
        }
        return total;
      }, 0);
    }
    console.log('[DashboardContext] totalUsers:', totalUsers, users);

    // Positions: sum all positions in all units
    let totalPositions = 0;
    if (Array.isArray(units)) {
      totalPositions = units.reduce((total, unit) => {
        if (Array.isArray(unit.positions)) {
          return total + unit.positions.length;
        }
        return total;
      }, 0);
    }
    console.log('[DashboardContext] totalPositions:', totalPositions, units);

    // Vehicles: should be array
    const vehicleArr = Array.isArray(vehicles) ? vehicles : [];
    const totalVehicles = vehicleArr.length;
    const activeVehicles = vehicleArr.filter((v) => v.vehicle_status === "ACTIVE").length;
    const inactiveVehicles = vehicleArr.filter((v) => v.vehicle_status === "INACTIVE").length;
    console.log('[DashboardContext] totalVehicles:', totalVehicles, vehicleArr);
    console.log('[DashboardContext] activeVehicles:', activeVehicles);
    console.log('[DashboardContext] inactiveVehicles:', inactiveVehicles);

    // Vehicle Models: should be array
    const vehicleModelArr = Array.isArray(vehicleModels) ? vehicleModels : [];
    const totalVehicleModels = vehicleModelArr.length;
    console.log('[DashboardContext] totalVehicleModels:', totalVehicleModels, vehicleModelArr);

    return {
      totalUsers,
      totalOrganizations,
      totalUnits,
      totalPositions,
      totalVehicles,
      totalVehicleModels,
      activeVehicles,
      inactiveVehicles,
      pendingRequests: 0, // This would need to come from a reservations/requests API
    };
  };

  // Generate recent activity
  const generateRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent users (last 5)
    if (users) {
      users.forEach((unit) => {
        unit.users.slice(-3).forEach((user) => {
          activities.push({
            id: `user_${user.user_id}`,
            type: "user_created",
            message: `New user ${user.first_name} ${user.last_name} added to ${unit.unit_name}`,
            timestamp: new Date().toISOString(), // In real app, this would come from API
            userId: user.user_id,
            userName: `${user.first_name} ${user.last_name}`,
          });
        });
      });
    }

    // Add recent vehicles (last 3)
    if (vehicles) {
      vehicles.slice(-3).forEach((vehicle) => {
        activities.push({
          id: `vehicle_${vehicle.vehicle_id}`,
          type: "vehicle_added",
          message: `Vehicle ${vehicle.plate_number} (${vehicle.vehicle_type}) added to fleet`,
          timestamp: vehicle.created_at,
        });
      });
    }

    // Add recent units (last 2)
    if (units) {
      units.slice(-2).forEach((unit) => {
        activities.push({
          id: `unit_${unit.unit_id}`,
          type: "unit_created",
          message: `New unit "${unit.unit_name}" created`,
          timestamp: unit.created_at,
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

    // View actions for modules user can access
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

    return actions.slice(0, 6); // Limit to 6 actions
  };

  // Refetch all data
  const refetch = () => {
    refetchOrgs();
    refetchUnits();
    refetchUsers();
    refetchVehicles();
    refetchVehicleModels();
  };

  // Update loading state
  useEffect(() => {
    const loading =
      authLoading ||
      orgsLoading ||
      unitsLoading ||
      usersLoading ||
      vehiclesLoading ||
      vehicleModelsLoading;
    setIsLoading(loading);
  }, [
    authLoading,
    orgsLoading,
    unitsLoading,
    usersLoading,
    vehiclesLoading,
    vehicleModelsLoading,
  ]);

  // Update error state
  useEffect(() => {
    const errors = [
      orgsError,
      unitsError,
      usersError,
      vehiclesError,
      vehicleModelsError,
    ]
      .filter(Boolean)
      .map((err) => err?.message || "Unknown error");

    setError(errors.length > 0 ? errors.join(", ") : null);
  }, [orgsError, unitsError, usersError, vehiclesError, vehicleModelsError]);

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

"use client";
import React, { useState, useEffect } from "react";
import { Plus, Info, } from "lucide-react";
import {
  useUnitPositions,
  useCreatePosition,
  useOrganizations,
  useOrganizationUnitsByOrgId,
  useOrganizationUnits,
  usePositions,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SkeletonPositionsCards } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import type { position_accesses, Unit } from "@/types/next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { CreatePositionModal } from "./CreatePositionModal";
interface Position {
  position_id: string;
  position_name: string;
  position_description?: string;
  position_status: "ACTIVE" | "INACTIVE";
  position_access: position_accesses;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    auth?: {
      email: string;
    };
  };
  unit_id?: string;
  unit?: {
    unit_id: string;
    unit_name: string;
    created_at: string;
    organization_id: string;
    status: string;
    organization?: {
      organization_id: string;
      organization_name: string;
      street_address: string;
      organization_phone: string;
      organization_email: string;
      organization_logo: string;
      created_at: string;
      organization_customId: string;
      organization_status: string;
    };
  };
}

interface PositionWithUnitOrg extends Position {
  unit?: {
    unit_id: string;
    unit_name: string;
    created_at: string;
    organization_id: string;
    status: string;
    organization?: {
      organization_id: string;
      organization_name: string;
      street_address: string;
      organization_phone: string;
      organization_email: string;
      organization_logo: string;
      created_at: string;
      organization_customId: string;
      organization_status: string;
    };
  };
}

export default function PositionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  // Call all hooks unconditionally at the top
  const { data: orgData, isLoading: orgsLoading } = useOrganizations(1, 100);
  const {
    data: allPositions,
    isLoading: allPositionsLoading,
    error: allPositionsError,
  } = usePositions();
  const orgUnitsByOrgIdHook = useOrganizationUnitsByOrgId(selectedOrgId || "");
  const allUnitsHook = useOrganizationUnits();
  const unitPositionsHook = useUnitPositions(selectedUnitId);
  const createPosition = useCreatePosition();

  // Permission checks
  const canView = !!user?.position?.position_access?.positions?.view;
  const canCreate = !!user?.position?.position_access?.positions?.create;
  const canViewOrganizations =
    !!user?.position?.position_access?.organizations?.view;

  // Fetch all organizations (for dropdown) but only use if canViewOrganizations
  const allOrganizations = orgData?.organizations || [];

  // Determine which org to use
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const organizations = canViewOrganizations
    ? allOrganizations
    : user?.organization
    ? [user.organization]
    : [];

  // Set default org if only one (for org dropdown)
  useEffect(() => {
    if (canViewOrganizations && organizations.length === 1 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].organization_id);
    }
  }, [canViewOrganizations, organizations, selectedOrgId]);

  // Always call both unit hooks
  let orgUnits: Unit[] = [];
  let unitsLoading = false;
  if (canViewOrganizations) {
    orgUnits = (orgUnitsByOrgIdHook.data || []).map((unit) => ({
      ...unit,
      status: unit.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    }));
    unitsLoading = orgUnitsByOrgIdHook.isLoading;
  } else {
    orgUnits = (allUnitsHook.data || [])
      .filter(
        (unit) =>
          user && unit.organization_id === user.organization.organization_id
      )
      .map((unit) => ({
        ...unit,
        status: unit.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      }));
    unitsLoading = allUnitsHook.isLoading;
  }

  // Set default unit if only one (for org dropdown)
  // Do not auto-select the first unit; keep as '' until user selects

  // Always call the hook at the top
  let positions: Position[] = [];
  let positionsLoading = false;
  let positionsError = false;
  // If no org/unit selected, show all positions from new API
  if (!selectedOrgId && !selectedUnitId) {
    positions = (allPositions || []).map((pos) => ({
      ...pos,
      position_description: pos.position_description || "",
      unit_id: pos.unit_id || "",
      position_status: pos.position_status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      position_access: pos.position_access || {},
      created_at: pos.created_at || "",
    }));
    positionsLoading = allPositionsLoading;
    positionsError = !!allPositionsError;
  } else if (selectedOrgId && !selectedUnitId) {
    // If org selected but no unit, show all positions for that org
    positions = ((allPositions as PositionWithUnitOrg[]) || [])
      .filter(
        (pos) => pos.unit?.organization?.organization_id === selectedOrgId
      )
      .map((pos) => ({
        ...pos,
        position_description: pos.position_description || "",
        unit_id: pos.unit_id || "",
        position_status:
          pos.position_status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
        position_access: pos.position_access || {},
        created_at: pos.created_at || "",
      }));
    positionsLoading = allPositionsLoading;
    positionsError = !!allPositionsError;
  } else if (canViewOrganizations) {
    positions = (unitPositionsHook.data || []).map((pos) => ({
      ...pos,
      position_description: pos.position_description || "",
      position_status: pos.position_status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      position_access: pos.position_access || {},
      created_at: pos.created_at || "",
    }));
    positionsLoading = unitPositionsHook.isLoading;
    positionsError = unitPositionsHook.isError;
  } else {
    const selectedUnit = orgUnits.find(
      (unit) => unit.unit_id === selectedUnitId
    );
    positions =
      selectedUnit && Array.isArray(selectedUnit.positions)
        ? selectedUnit.positions.map((pos) => ({
            ...pos,
            position_description: pos.position_description || "",
            position_status:
              pos.position_status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
            position_access: pos.position_access || {},
            created_at: pos.created_at || "",
          }))
        : [];
    positionsLoading = false;
    positionsError = false;
  }

  // Early returns for loading and permission checks
  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canCreate;
  if (!hasAnyPermission) {
    return <NoPermissionUI resource="positions" />;
  }

  // Guard: if user has no organization, show error
  const showOrgError = !user?.organization?.organization_id;
  if (showOrgError) {
    return (
      <div className="p-4 text-red-500">
        Your organization is not set. Please contact your administrator.
      </div>
    );
  }

  const handleCreatePosition = async (positionData: {
    position_name: string;
    position_description: string;
    unit_id: string;
    position_access: position_accesses;
    user_ids: string[];
  }) => {
    await createPosition.mutateAsync(positionData);
  };

  // Show loading state
  if (orgsLoading || unitsLoading || positionsLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SkeletonPositionsCards />
        </div>
      </div>
    );
  }

  const selectedUnit = orgUnits?.find(
    (unit) => unit.unit_id === selectedUnitId
  );
  const isSelectedUnitActive = selectedUnit?.status === "ACTIVE";

  // Determine if user is super admin (can view all units/positions)
  const isSuperAdmin = !!user?.position?.position_access?.units?.create;

  // If not super admin, only show positions for user's own unit
  let filteredPositions = positions;
  if (!isSuperAdmin && user?.unit?.unit_id) {
    filteredPositions = positions.filter(
      (pos: Position) => (pos.unit_id || "") === user.unit.unit_id
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Org & Unit Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
        {canViewOrganizations && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Organization:
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setSelectedUnitId("");
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organization_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Always show unit dropdown for all units in org */}
        {orgUnits && orgUnits.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Unit:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Units</option>
              {orgUnits.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {canCreate && selectedUnitId && isSelectedUnitActive && (
          <Button
            onClick={() => setShowCreate(true)}
            disabled={!selectedUnitId || !isSelectedUnitActive}
            className="ml-auto flex items-center gap-2 bg-[#0872b3] hover:bg-[#065a8f] text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create Position
          </Button>
        )}
        {selectedUnitId && !isSelectedUnitActive && (
          <Alert className="ml-4 max-w-md border border-blue-200 bg-blue-50 text-blue-800">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">
              Action not allowed
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              You cannot create a position for an inactive unit.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content - Only show if user can view */}
      {canView ? (
        <div className="flex-1 overflow-auto p-4">
          {positionsError ? (
            <div className="p-8 text-center text-red-500">
              Failed to load positions. Please try again.
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-100 shadow-md">
              <svg
                className="w-16 h-16 text-blue-200 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Positions Found
              </h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                There are no positions in this{" "}
                {selectedUnitId
                  ? "unit"
                  : selectedOrgId
                  ? "organization"
                  : "context"}
                . Try selecting a different organization or unit, or create a
                new position if you have permission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPositions.map((pos) => (
                <div
                  key={pos.position_id}
                  className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        {pos.position_name}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {pos.position_description}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <Link
                        href={`/dashboard/shared_pages/positions/${pos.position_id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors border border-blue-100"
                        aria-label="View position"
                      >
                        View
                      </Link>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col lg:flex-row lg:items-center lg:justify-between text-xs text-gray-500 gap-2">
                    <div>
                      Created:{" "}
                      {pos.created_at
                        ? new Date(pos.created_at).toLocaleString()
                        : "N/A"}
                    </div>
                    <span
                      className={`inline-block mt-1 lg:mt-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        pos.position_status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {pos.position_status}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="font-semibold text-gray-700">
                      Assigned User:{" "}
                    </span>
                    {pos.user ? (
                      <span className="text-gray-800">
                        {pos.user.first_name} {pos.user.last_name}
                        <span className="text-gray-500">
                          {" "}
                          ({pos.user.auth?.email ?? "N/A"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Show message when user can't view but has other permissions
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Access to View Positions
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You don&apos;t have permission to view existing positions, but
                you can create new ones if you have the appropriate permissions.
              </p>
              {canCreate && (
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-5 h-5" />
                  Create New Position
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Position Modal */}
      {canCreate && (
        <CreatePositionModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreatePosition}
          unitId={selectedUnitId}
        />
      )}
    </div>
  );
}

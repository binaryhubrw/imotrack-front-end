"use client";
import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, Info, X } from "lucide-react";
import {
  useUnitPositions,
  useCreatePosition,
  useOrganizations,
  useOrganizationUnitsByOrgId,
  useOrganizationUnits,
  usePositions,
  useUsers,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonPositionsCards } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { position_accesses, Unit } from "@/types/next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
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

// Define defaultPermissions at the top of the file
const defaultPermissions: position_accesses = {
  organizations: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  units: { create: false, view: false, update: false, delete: false },
  positions: { create: false, view: false, update: false, delete: false },
  users: { create: false, view: false, update: false, delete: false },
  vehicleModels: {
    create: false,
    view: false,
    viewSingle: false,
    update: false,
    delete: false,
  },
  vehicles: {
    create: false,
    view: false,
    viewSingle: false,
    update: false,
    delete: false,
  },
  reservations: {
    create: false,
    view: false,
    update: false,
    delete: false,
    cancel: false,
    approve: false,
    assignVehicle: false,
    odometerFuel: false,
    start: false,
    complete: false,
    viewOwn: false,
  },
  vehicleIssues: { report: false, view: false, update: false, delete: false },
};


export function CreatePositionModal({
  open,
  onClose,
  onCreate,
  unitId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    position_name: string;
    position_description: string;
    unit_id: string;
    position_access: position_accesses;
    user_ids: string[];
  }) => Promise<void>;
  unitId: string;
}) {
  const [form, setForm] = useState({
    position_name: "",
    position_description: "",
    position_access: { ...defaultPermissions },
    user_ids: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: users = [] } = useUsers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, multiple } = e.target;
    if (name === 'user_ids' && multiple) {
      const options = (e.target as HTMLSelectElement).options;
      const selected = Array.from(options).filter((o) => (o as HTMLOptionElement).selected).map((o) => (o as HTMLOptionElement).value);
      // If 'ALL' is selected, select all user_ids
      if (selected.includes('ALL')) {
        setForm((f) => ({ ...f, user_ids: users.map(u => u.user_id) }));
      } else {
        setForm((f) => ({ ...f, user_ids: selected }));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Update handleAccessChange to use string for module and index with as keyof position_accesses
  const handleAccessChange = (module: string, perm: string) => {
    setForm((prev) => {
      const perms = {
        ...(prev.position_access as Record<string, Record<string, boolean>>)[
          module
        ],
      };
      perms[perm] = !perms[perm];
      return {
        ...prev,
        position_access: {
          ...prev.position_access,
          [module]: perms,
        },
      };
    });
  };

  // Add function to handle selecting/deselecting all permissions for a module
  const handleSelectAllPermissions = (module: string) => {
    setForm((prev) => {
      const currentPerms = (prev.position_access as Record<string, Record<string, boolean>>)[module];
      const allSelected = Object.values(currentPerms).every(Boolean);
      
      // If all are selected, deselect all. Otherwise, select all.
      const newPerms = Object.keys(currentPerms).reduce((acc, perm) => {
        acc[perm] = !allSelected;
        return acc;
      }, {} as Record<string, boolean>);

      return {
        ...prev,
        position_access: {
          ...prev.position_access,
          [module]: newPerms,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const positionData = {
        position_name: form.position_name,
        position_description: form.position_description,
        unit_id: unitId,
        position_access: form.position_access,
        user_ids: form.user_ids,
      };

      await onCreate(positionData);

      // Reset form
      setForm({
        position_name: "",
        position_description: "",
        position_access: { ...defaultPermissions },
        user_ids: [],
      });
      onClose();
    } catch (error) {
      console.error("Error creating position:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      position_name: "",
      position_description: "",
      position_access: { ...defaultPermissions },
      user_ids: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 p-6 rounded-t-xl relative z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#0872b3] pr-10">
            Create Position
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Define a new position with specific permissions
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Position Name
                </label>
                <Input
                  name="position_name"
                  placeholder="Enter position name"
                  value={form.position_name}
                  onChange={handleChange}
                  required
                  className="border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Description
                </label>
                <textarea
                  name="position_description"
                  placeholder="Enter position description"
                  value={form.position_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      position_description: e.target.value,
                    }))
                  }
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 resize-none"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                Permissions
              </h3>

              <div className="space-y-4">
                {Object.entries(form.position_access)
                  .filter(([module]) => module !== 'organizations')
                  .map(([module, permissions]) => {
                    const perms = permissions as Record<string, boolean>;
                    const allSelected = Object.values(perms).every(Boolean);
                    const someSelected = Object.values(perms).some(Boolean);
                    
                    return (
                      <div
                        key={String(module)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold capitalize text-[#0872b3] flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#0872b3] rounded-full"></div>
                            {String(module)}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleSelectAllPermissions(module)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                              allSelected
                                ? 'bg-[#0872b3] text-white hover:bg-[#065a8f]'
                                : someSelected
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(perms).map(
                            ([perm, isChecked]: [string, boolean]) => (
                              <label
                                key={perm}
                                className="flex items-center space-x-3 text-sm cursor-pointer group"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={!!isChecked}
                                    onChange={() =>
                                      handleAccessChange(module, perm)
                                    }
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                      isChecked
                                        ? "bg-[#0872b3] border-[#0872b3]"
                                        : "border-gray-300 group-hover:border-[#0872b3]"
                                    }`}
                                  >
                                    {isChecked && (
                                      <svg
                                        className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`capitalize transition-colors duration-200 ${
                                    isChecked
                                      ? "text-[#0872b3] font-medium"
                                      : "text-gray-700 group-hover:text-[#0872b3]"
                                  }`}
                                >
                                  {perm}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6 rounded-b-xl relative z-10">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[140px] bg-[#0872b3] hover:bg-[#065a8f] text-white transition-colors duration-200"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  "Create Position"
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

// Access denied component
function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Access Denied
      </h3>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}

export default function PositionsPage() {
  const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  // Permission flags
  const canViewOrganizations =
    !!user?.position?.position_access?.organizations?.view;
  const canViewPositions = !!user?.position?.position_access?.positions?.view;
  const canCreatePositions =
    !!user?.position?.position_access?.positions?.create;

  // Fetch all organizations (for dropdown) but only use if canViewOrganizations
  const { data: orgData, isLoading: orgsLoading } = useOrganizations(1, 100);
  const allOrganizations = orgData?.organizations || [];

  // Fetch all positions (new API)
  const { data: allPositions, isLoading: allPositionsLoading, error: allPositionsError } = usePositions();

  // Determine which org to use
  const orgId = canViewOrganizations
    ? selectedOrgId
    : user?.organization?.organization_id;
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
  const orgUnitsByOrgIdHook = useOrganizationUnitsByOrgId(orgId || "");
  const allUnitsHook = useOrganizationUnits();
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
  const unitPositionsHook = useUnitPositions(selectedUnitId);

  let positions: Position[] = [];
  let positionsLoading = false;
  let positionsError = false;
  // If no org/unit selected, show all positions from new API
  if (!selectedOrgId && !selectedUnitId) {
    positions = (allPositions || []).map(pos => ({
      ...pos,
      position_description: pos.position_description || '',
      unit_id: pos.unit_id || '',
      position_status: pos.position_status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      position_access: pos.position_access || {},
      created_at: pos.created_at || '',
    }));
    positionsLoading = allPositionsLoading;
    positionsError = !!allPositionsError;
  } else if (selectedOrgId && !selectedUnitId) {
    // If org selected but no unit, show all positions for that org
    positions = (allPositions as PositionWithUnitOrg[] || []).filter(pos => pos.unit?.organization?.organization_id === selectedOrgId)
      .map(pos => ({
        ...pos,
        position_description: pos.position_description || '',
        unit_id: pos.unit_id || '',
        position_status: pos.position_status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        position_access: pos.position_access || {},
        created_at: pos.created_at || '',
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
  const createPosition = useCreatePosition();

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

  // Check if user has access to view positions
  if (!canViewPositions) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Positions</h1>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <AccessDenied message="You don't have permission to view positions. Please contact your administrator." />
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
    filteredPositions = positions.filter((pos: Position) => (pos.unit_id || '') === user.unit.unit_id);
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
        {canCreatePositions && selectedUnitId && isSelectedUnitActive && (
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {positionsError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load positions. Please try again.
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-100 shadow-md">
            <svg className="w-16 h-16 text-blue-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Positions Found</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">There are no positions in this {selectedUnitId ? 'unit' : selectedOrgId ? 'organization' : 'context'}. Try selecting a different organization or unit, or create a new position if you have permission.</p>
            
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
                    Created: {" "}
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
                    Assigned User: {" "}
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
            {/* Remove 'No Positions Found' message entirely */}
          </div>
        )}
      </div>

      {/* Create Position Modal */}
      {canCreatePositions && (
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

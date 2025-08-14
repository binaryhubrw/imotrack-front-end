"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plus, Info, UserPlus, Search, ChevronDown, X } from "lucide-react";
import {
  useUnitPositions,
  useCreatePosition,
  useOrganizations,
  useOrganizationUnitsByOrgId,
  useOrganizationUnits,
  usePositions,
  useAssignPositionToUser,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SkeletonUnitsTable } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import type { position_accesses, Unit } from "@/types/next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { CreatePositionModal } from "./CreatePositionModal";
import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Searchable Dropdown Component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: Array<{ [key: string]: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the display field name (organization_name or unit_name)
  const displayField =
    options.length > 0
      ? Object.keys(options[0]).find((key) => key.includes("name")) ||
        Object.keys(options[0])[0]
      : "";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option[displayField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option name
  const selectedOption = options.find((option) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    return option[idField] === value;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { [key: string]: string }) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    onChange(option[idField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption[displayField] : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm
                  ? `No ${placeholder.toLowerCase()} found`
                  : `No ${placeholder.toLowerCase()} available`}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const idField =
                  Object.keys(option).find((key) => key.includes("id")) ||
                  Object.keys(option)[0];
                return (
                  <div
                    key={option[idField] || index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                      option[idField] === value
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option[displayField]}
                  </div>
                );
              })
            )}
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredOptions.length} of {options.length}{" "}
              {placeholder.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Assign User Modal Component
function AssignUserModal({
  open,
  onClose,
  positionName,
  onAssign,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  positionName: string;
  onAssign: (email: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onAssign(email);
      setEmail("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  const handleClose = () => {
    setEmail("");
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Assign User to Position
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Assign a user to the position:{" "}
            <span className="font-medium text-gray-900">{positionName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="Enter user's email address"
              className={`w-full ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-[#0872B3] text-white rounded-lg hover:bg-[#065d8f] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Assigning..." : "Assign User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Move pagination state to the top (before any early returns)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
  const assignPositionToUser = useAssignPositionToUser();
  const router = useRouter();

  // Permission checks
  const canView = !!user?.position?.position_access?.positions?.view;
  const canCreate = !!user?.position?.position_access?.positions?.create;
  const canViewOrganizations =
    !!user?.position?.position_access?.organizations?.view;
  const canAssignUser =
    !!user?.position?.position_access?.positions?.assignUser;

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

  const handleAssignUser = async (email: string) => {
    if (!selectedPosition || !canAssignUser) {
      // toast.error("You do not have permission to assign users to positions");
      return;
    }

    try {
      await assignPositionToUser.mutateAsync({
        position_id: selectedPosition.id,
        email: email,
      });
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error assigning user:", error);
      // toast.error("Failed to assign user to position");
    }
  };

  const openAssignModal = (positionId: string, positionName: string) => {
    if (!canAssignUser) {
      // toast.error("You do not have permission to assign users to positions");
      return;
    }
    setSelectedPosition({ id: positionId, name: positionName });
    setShowAssignModal(true);
  };

  // Show loading state
  if (orgsLoading || unitsLoading || positionsLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SkeletonUnitsTable />
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

  // Pagination state
  const pageCount = Math.ceil(filteredPositions.length / pageSize);
  const paginatedPositions = filteredPositions.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Org & Unit Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
        {canViewOrganizations && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Organization:
            </label>
            <SearchableDropdown
              options={organizations.map((org) => ({
                organization_id: org.organization_id,
                organization_name: org.organization_name,
              }))}
              value={selectedOrgId}
              onChange={(value) => {
                setSelectedOrgId(value);
                setSelectedUnitId("");
              }}
              placeholder="All Organizations"
              className="w-64"
            />
          </div>
        )}
        {/* Always show unit dropdown for all units in org */}
        {orgUnits && orgUnits.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Unit:</label>
            <SearchableDropdown
              options={orgUnits.map((unit) => ({
                unit_id: unit.unit_id,
                unit_name: unit.unit_name,
              }))}
              value={selectedUnitId}
              onChange={setSelectedUnitId}
              placeholder="All Units"
              className="w-64"
            />
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900 px-3 py-4">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-3 py-4">
                      Position Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-3 py-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-3 py-4">
                      Assigned User
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-3 py-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPositions.map((pos, idx) => (
                    <TableRow
                      key={pos.position_id}
                      className="hover:bg-blue-50 border-b border-gray-100 cursor-pointer group"
                      onClick={() =>
                        router.push(
                          `/dashboard/shared_pages/positions/${pos.position_id}`
                        )
                      }
                    >
                      <TableCell className="font-mono text-gray-500 px-3">
                        {pageIndex * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-blue-800 px-3">
                        {pos.position_name}
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          variant={
                            pos.position_status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            pos.position_status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {pos.position_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        {pos.user ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {pos.user.first_name} {pos.user.last_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {pos.user.auth?.email || "No email"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right px-3 !cursor-default group-hover:bg-transparent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/shared_pages/positions/${pos.position_id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold"
                            title="View position"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Link>
                          {!pos.user && canAssignUser && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAssignModal(
                                  pos.position_id,
                                  pos.position_name
                                );
                              }}
                              size="sm"
                              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              title="Assign user"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          )}
                          {pos.user && (
                            <span className="text-green-600 text-sm font-medium">
                              ✓ Assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              {filteredPositions.length > pageSize && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(0)}
                      disabled={pageIndex === 0}
                    >
                      {"<<"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                      }
                      disabled={pageIndex >= pageCount - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(pageCount - 1)}
                      disabled={pageIndex >= pageCount - 1}
                    >
                      {">>"}
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageCount}
                    </strong>
                  </span>
                  <span className="text-sm text-gray-600">
                    Go to page:{" "}
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={pageIndex + 1}
                      onChange={(e) => {
                        const page = e.target.value
                          ? Number(e.target.value) - 1
                          : 0;
                        setPageIndex(
                          Math.max(0, Math.min(page, pageCount - 1))
                        );
                      }}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                  </span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(0);
                    }}
                  >
                    {[10, 20, 30, 40, 50].map((size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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

      {/* Assign User Modal */}
      {showAssignModal && selectedPosition && (
        <AssignUserModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          positionName={selectedPosition.name}
          onAssign={handleAssignUser}
          isLoading={assignPositionToUser.isPending}
        />
      )}
    </div>
  );
}

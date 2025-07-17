"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  useUnitPositions,
  useCreatePosition,
  useDeletePosition,
  useOrganizationUnits,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SkeletonPositionsCards } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { position_accesses } from "@/types/next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Default permissions structure
const defaultPermissions: position_accesses = {
  organizations: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  units: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  positions: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  users: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
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
  },
};

interface Position {
  position_id: string;
  position_name: string;
  position_description: string;
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
}

interface Unit {
  unit_id: string;
  unit_name: string;
  organization_id: string;
  status: string; // Fix: match backend/type definition
}

// Create Position Modal
function CreatePositionModal({
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
  }) => Promise<void>;
  unitId: string;
}) {
  const [form, setForm] = useState({
    position_name: "",
    position_description: "",
    position_access: { ...defaultPermissions },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccessChange = (module: string, perm: string) => {
    setForm((prev) => ({
      ...prev,
      position_access: {
        ...prev.position_access,
        [module]: {
          ...prev.position_access[module as keyof position_accesses],
          [perm]:
            !prev.position_access[module as keyof position_accesses]?.[
              perm as keyof typeof prev.position_access.organizations
            ],
        },
      },
    }));
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
      };

      await onCreate(positionData);

      // Reset form
      setForm({
        position_name: "",
        position_description: "",
        position_access: { ...defaultPermissions },
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
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
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

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={e => setForm(f => ({ ...f, position_description: e.target.value }))}
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
                {Object.entries(form.position_access).map(
                  ([module, permissions]) => (
                    <div
                      key={module}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                    >
                      <h4 className="font-semibold mb-3 capitalize text-[#0872b3] flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0872b3] rounded-full"></div>
                        {module}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(permissions).map(
                          ([perm, isChecked]) => (
                            <label
                              key={perm}
                              className="flex items-center space-x-3 text-sm cursor-pointer group"
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
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
                  )
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-xl">
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
      </div>
    </div>
  );
}

function AccessSummary({ access }: { access: position_accesses }) {
  if (!access) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      {Object.entries(access).map(([module, perms]) => {
        const activePerms = Object.entries(perms).filter(([, val]) => val);
        if (activePerms.length === 0) return null;

        return (
          <div
            key={module}
            className="bg-gray-50 rounded p-2 border border-gray-100"
          >
            <div className="font-semibold text-gray-700 mb-1 capitalize">
              {module}
            </div>
            <div className="flex flex-wrap gap-1">
              {activePerms.map(([perm]) => (
                <span
                  key={perm}
                  className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        );
      })}
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
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  // Fetch organization units
  const { data: organizationUnits, isLoading: unitsLoading } =
    useOrganizationUnits();

  // Fetch positions for selected unit
  const {
    data: positions,
    isLoading: positionsLoading,
    isError,
  } = useUnitPositions(selectedUnitId);

  const createPosition = useCreatePosition();
  const deletePosition = useDeletePosition();

  // Check if user has access to view positions
  const canViewPositions =
    user?.position?.position_access?.positions?.view || false;
  const canCreatePositions =
    user?.position?.position_access?.positions?.create || false;
  const canDeletePositions =
    user?.position?.position_access?.positions?.delete || false;

  // Set available units and default selection
  useEffect(() => {
    if (organizationUnits && organizationUnits.length > 0) {
      setAvailableUnits(organizationUnits);
      // Only set default if not already selected (do not override user choice)
      if (!selectedUnitId) {
        // Prefer user's unit, else first unit
        const userUnit = organizationUnits.find(
          (unit) => unit.unit_id === user?.unit?.unit_id
        );
        setSelectedUnitId((userUnit || organizationUnits[0]).unit_id);
      }
    }
    // Only run this effect when organizationUnits or user.unit.unit_id changes
    // Do NOT depend on selectedUnitId, so we don't override user selection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationUnits, user?.unit?.unit_id]);

  const handleCreatePosition = async (positionData: {
    position_name: string;
    position_description: string;
    unit_id: string;
    position_access: position_accesses;
  }) => {
    await createPosition.mutateAsync(positionData);
  };

  // Delete modal logic
  const openDeleteModal = (position: Position) => {
    setPositionToDelete(position);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPositionToDelete(null);
    setDeleteLoading(false);
  };
  const confirmDelete = async () => {
    if (!positionToDelete) return;
    setDeleteLoading(true);
    try {
      await deletePosition.mutateAsync({
        positionId: positionToDelete.position_id,
        unit_id: selectedUnitId,
      });
      closeDeleteModal();
    } catch {
      setDeleteLoading(false);
    }
  };

  // Show loading state
  if (unitsLoading || positionsLoading) {
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

  // Show error if no units available
  if (!availableUnits || availableUnits.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Positions</h1>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <AccessDenied message="No units available in your organization. Please contact your administrator." />
        </div>
      </div>
    );
  }

  const selectedUnit = availableUnits.find(
    (unit) => unit.unit_id === selectedUnitId
  );
  const isSelectedUnitActive = selectedUnit?.status === "ACTIVE";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Unit Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Organization:
          </span>
          <span className="text-sm text-gray-900">
            {user?.organization?.organization_name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Unit:</label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a unit</option>
            {availableUnits.map((unit) => (
              <option key={unit.unit_id} value={unit.unit_id}>
                {unit.unit_name}
              </option>
            ))}
          </select>
        </div>

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
        {!selectedUnitId ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Unit
              </h3>
              <p className="text-gray-600">
                Please select a unit to view its positions.
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load positions. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((positions as Position[]) || []).map((pos) => (
              <div
                key={pos.position_id}
                className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                      {pos.position_name}
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          pos.position_status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pos.position_status}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {pos.position_description}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("Edit functionality coming soon");
                      }}
                      aria-label="Edit position"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {canDeletePositions && (
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        onClick={() => openDeleteModal(pos)}
                        aria-label="Delete position"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Created:{" "}
                  {pos.created_at
                    ? new Date(pos.created_at).toLocaleString()
                    : "N/A"}
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

                <AccessSummary
                  access={pos.position_access ?? defaultPermissions}
                />
              </div>
            ))}

            {positions && positions.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-32 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Positions Found
                  </h3>
                  <p className="text-gray-600">
                    {canCreatePositions
                      ? "Create your first position to get started."
                      : "No positions available in this unit."}
                  </p>
                </div>
              </div>
            )}
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
      <Dialog
  open={deleteModalOpen}
  onOpenChange={(open) => {
    if (!open) closeDeleteModal();
  }}
>
  <DialogContent className="bg-white border border-gray-200 shadow-2xl rounded-xl max-w-md w-full px-6 py-8">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-red-600">
        <AlertTriangle className="w-5 h-5" />
        Delete Position
      </DialogTitle>
      <DialogDescription className="mt-2 text-gray-600 text-sm leading-relaxed">
        Are you sure you want to delete the position{" "}
        <span className="font-semibold text-gray-900">
          {positionToDelete?.position_name}
        </span>
        ? This action <span className="font-medium">cannot be undone.</span>
      </DialogDescription>
    </DialogHeader>

    <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={closeDeleteModal}
        disabled={deleteLoading}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
      >
        Cancel
      </Button>

      <Button
        type="button"
        onClick={confirmDelete}
        disabled={deleteLoading}
        className="bg-red-600 hover:bg-red-700 text-white min-w-[120px] flex items-center gap-2 justify-center font-medium transition duration-200"
      >
        {deleteLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete
          </>
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}

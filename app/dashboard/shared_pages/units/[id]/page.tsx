"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  useOrganizationDeleteUnit,
  useOrganizationUnit,
  useUpdateOrganizationUnit,
} from "@/lib/queries";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { Ban, Building2 } from "lucide-react";
import { CreatePositionModal } from "../../positions/page";
import { useCreatePosition } from '@/lib/queries';
import type { position_accesses } from '@/types/next-auth';
import { useAuth } from '@/hooks/useAuth';
import NoPermissionUI from "@/components/NoPermissionUI";

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  
  // Call all hooks unconditionally at the top
  const { data: unit, isLoading, isError, refetch } = useOrganizationUnit(id);
  const updateUnit = useUpdateOrganizationUnit();
  const DisActivateUnit = useOrganizationDeleteUnit();
  const createPosition = useCreatePosition();

  const [showEdit, setShowEdit] = useState(false);
  const [showDisActivateConfirm, setShowDisActivateConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    unit_name: "",
    status: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [DisActivateError, setDisActivateError] = useState<string | null>(null);
  const [showCreatePosition, setShowCreatePosition] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Permission checks
  const canView = !!user?.position?.position_access?.units?.view;
  const canUpdate = !!user?.position?.position_access?.units?.update;
  const canCreatePosition = !!user?.position?.position_access?.positions?.create;
  const canDisActivate = !!user?.position?.position_access?.positions?.delete;

  // Helper: is super admin if has organizations access
  const isSuperAdmin = !!user?.position?.position_access?.organizations;

  const filteredPositions = unit ? (
    statusFilter
      ? unit.positions.filter((pos) => pos.position_status === statusFilter)
      : unit.positions
  ) : [];

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!unit) return;
    setEditForm({
      unit_name: unit.unit_name || "",
      status: unit.status || "",
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUnit.mutateAsync({
        unit_id: id,
        updates: {
          unit_name: editForm.unit_name,
          status: editForm.status,
        },
      });
      setShowEdit(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  // DisActivate handler
  const handleDisActivate = async () => {
    if (!id) return;
    setDeleting(true);
    setDisActivateError(null);
    try {
      await DisActivateUnit.mutateAsync({ unit_id: id });
      setShowDisActivateConfirm(false);
      router.back();
    } catch (error: unknown) {
      let message = "Failed to DisActivate unit.";
      if (typeof error === "object" && error && "message" in error) {
        message = (error as { message?: string }).message || message;
      }
      setDisActivateError(message);
      setDeleting(false);
    }
  };

  const handleCreatePosition = async (data: {
    position_name: string;
    position_description: string;
    unit_id?: string;
    position_access: position_accesses;
    user_ids: string[];
  }) => {
    let position_access = data.position_access;
    // If not super admin, restrict permissions
    if (!isSuperAdmin) {
      // Only allow creating positions in own unit, and restrict permissions
      position_access = {
        organizations: { create: false, view: false, update: false, delete: false },
        reservations: {
          create: false,
          view: false,
          updateReason: false,
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
        positions: { create: true, view: false, update: false, delete: false },
        units: { create: false, view: false, update: false, delete: false },
        users: { create: false, view: false, update: false, delete: false },
        vehicleModels: { create: false, view: false, viewSingle: false, update: false, delete: false },
        vehicles: { create: false, view: false, viewSingle: false, update: false, delete: false },
        vehicleIssues: { report: false, view: false, update: false, delete: false },
      };
    } 
    await createPosition.mutateAsync({
      position_name: data.position_name,
      position_description: data.position_description,
      unit_id: id, // always use id from params
      position_access
      // user_ids removed
    });
    setShowCreatePosition(false);
    router.push('/dashboard/shared_pages/positions');
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!canView) {
    return <NoPermissionUI resource="units" />;
  }
  if (isLoading) {
    return <SkeletonEntityDetails />;
  }
  if (isError || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading unit details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-[#0872b3] hover:text-[#065d8f]"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                className="bg-[#0872b3] text-white hover:bg-[#065d8f]"
                onClick={handleEdit}
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Unit
              </Button>
            )}
            {canDisActivate && (
            <Button
              className="bg-cyan-900 text-white hover:bg-red-700"
              onClick={() => setShowDisActivateConfirm(true)}
            >
              <Ban className="mr-2" />
              DisActivate
            </Button>
            )}
          </div>
        </div>
        {/* Create Position Modal */}
        {showCreatePosition && canCreatePosition && (
          <CreatePositionModal
            open={showCreatePosition}
            onClose={() => setShowCreatePosition(false)}
            onCreate={handleCreatePosition}
            unitId={id}
          />
        )}
        {/* DisActivate Confirmation Modal */}
        {showDisActivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    DisActivate Unit
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to DisActivate{" "}
                  <strong>{unit.unit_name}</strong>? This action cannot be
                  undone.
                </p>
                {DisActivateError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {DisActivateError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisActivateConfirm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisActivate}
                    className="flex-1 py-2 px-4 bg-cyan-900 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                        Deleting...
                      </>
                    ) : (
                      "DisActivate"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {showEdit && canUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold mb-2">Edit Unit</h2>
              <label className="text-sm font-medium">
                Unit Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.unit_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, unit_name: e.target.value }))
                  }
                  required
                />
              </label>
              {/* Remove user selector: not supported by Unit type */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEdit(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#0872b3] text-white rounded hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Unit Details</h1>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {unit.status}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Unit Name</div>
                <div className="font-medium text-gray-900">
                  {unit.unit_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="font-medium text-gray-900">{unit.status}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Created At
                </div>
                <div className="font-medium text-gray-900">
                  {unit.created_at
                    ? new Date(unit.created_at).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
          {/* Organizations List for this Unit */}
          <div className="mt-10 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                Positions in this Unit
              </h2>
              {canCreatePosition && (
                <Button
                  className="bg-[#0872b3] text-white hover:bg-[#065a8f]"
                  onClick={() => setShowCreatePosition(true)}
                >
                  New Position
                </Button>
              )}
            </div>
            {/* Filter dropdown */}
            <div className="mb-4">
              <label className="mr-2 font-medium text-sm">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISACTIVATED">Disactivated</option>
              </select>
            </div>
            {filteredPositions && filteredPositions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPositions.map((pos) => {
                  // determine color classes based on status
                  let cardColor = "bg-gray-50 border-gray-200";
                  if (pos.position_status === "ACTIVE") {
                    cardColor = "bg-green-50 border-green-300";
                  } else if (pos.position_status === "DISACTIVATED") {
                    cardColor = "bg-yellow-50 border-yellow-300";
                  } else if (pos.position_status === "INACTIVE") {
                    cardColor = "bg-red-50 border-red-300";
                  }

                  return (
                    <div
                      key={pos.position_id}
                      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${cardColor}`}
                      onClick={() => router.push(`/dashboard/shared_pages/positions/${pos.position_id}`)}
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {pos.position_name}
                      </h3>
                      <p className="mt-2 text-sm">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            pos.position_status === "ACTIVE"
                              ? "text-green-700"
                              : pos.position_status === "INACTIVE"
                              ? "text-yellow-700"
                              : "text-red-700"
                          }`}
                        >
                          {pos.position_status}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">
                No positions found for this unit.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

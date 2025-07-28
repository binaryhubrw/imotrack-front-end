"use client";

import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { usePosition, useUpdatePosition, useUsers } from "@/lib/queries";
import { useDeletePosition } from "@/lib/queries";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";

// Helper type guard
function isUserWithAuth(
  user: unknown
): user is { first_name: string; last_name: string; auth: { email?: string } } {
  return (
    typeof user === "object" &&
    user !== null &&
    "auth" in user &&
    typeof (user as { auth?: unknown }).auth === "object" &&
    (user as { auth?: unknown }).auth !== null
  );
}

const defaultPermissions = {
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

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  // Call all hooks unconditionally at the top
  const { data: position, isLoading, isError, refetch } = usePosition(id);
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();
  const { data: users = [] } = useUsers();

  // Permission checks
  const canView = !!user?.position?.position_access?.positions?.view;
  const canUpdate = !!user?.position?.position_access?.positions?.update;
  const canDelete = !!user?.position?.position_access?.positions?.delete;

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    position_name: "",
    position_description: "",
    position_status: "",
    position_access: { ...defaultPermissions },
    user_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDisActivateConfirm, setShowDisActivateConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [disActivateError, setDisActivateError] = useState<string | null>(null);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!position) return;
    setEditForm({
      position_name: position.position_name || "",
      position_description: position.position_description || "",
      position_status: position.position_status || "",
      position_access: position.position_access || { ...defaultPermissions },
      user_id: position.user_id || "",
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePosition.mutateAsync({
        position_id: id,
        updates: {
          position_name: editForm.position_name,
          position_description: editForm.position_description,
          position_status: editForm.position_status,
          position_access: editForm.position_access,
          user_id: editForm.user_id,
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
    if (!position) return;
    setDeleting(true);
    setDisActivateError(null);
    try {
      await deletePosition.mutateAsync({
        positionId: position.position_id,
        unit_id: position.unit_id || "",
      });
      setShowDisActivateConfirm(false);
      router.back();
    } catch (error: unknown) {
      let message = "Failed to DisActivate position.";
      if (typeof error === "object" && error && "message" in error) {
        message = (error as { message?: string }).message || message;
      }
      setDisActivateError(message);
      setDeleting(false);
    }
  };

  // Early returns for loading and permission checks
  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="positions" />;
  }

  if (isLoading) {
    return <SkeletonEntityDetails />;
  }
  if (isError || !position) {
    return (
    
    <ErrorUI
            resource={`position ${position?.position_name}`}
            onRetry={() => {
              // re-fetch your data
              router.refresh();
            }}
            onBack={() => {
              router.back();
            }}
          />
    )
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
                Edit Position
              </Button>
            )}
            {canDelete && (
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setShowDisActivateConfirm(true)}
              >
                DisActivate
              </Button>
            )}
          </div>
        </div>
        {/* Edit Modal */}
        {showEdit && canUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-2xl p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col gap-6 relative"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowEdit(false)}
                tabIndex={-1}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-2 text-[#0872b3]">
                Edit Position
              </h2>
              <label className="text-sm font-medium">
                Position Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.position_name}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      position_name: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Description
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.position_description}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      position_description: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              {/* Single-user selector */}
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-2">
                  Assign User
                </label>
                <select
                  name="user_id"
                  value={editForm.user_id}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, user_id: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              {/* Permissions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">
                  Permissions
                </h3>
                <div className="space-y-4">
                  {Object.entries({
                    ...defaultPermissions,
                    ...editForm.position_access,
                  })
                    .filter(([module]) => module !== "organizations")
                    .map(([module]) => {
                      // Merge default perms for this module with current perms
                      const defaultPerms: Record<string, boolean> =
                        (
                          defaultPermissions as Record<
                            string,
                            Record<string, boolean>
                          >
                        )[module] || {};
                      const currentPerms: Record<string, boolean> =
                        (
                          editForm.position_access as Record<
                            string,
                            Record<string, boolean>
                          >
                        )[module] || {};
                      const mergedPerms = { ...defaultPerms, ...currentPerms };
                      const allSelected =
                        Object.values(mergedPerms).every(Boolean);
                      const someSelected =
                        Object.values(mergedPerms).some(Boolean);
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
                              onClick={() => {
                                setEditForm((prev) => {
                                  const prevModulePerms = { ...mergedPerms };
                                  const all =
                                    Object.values(prevModulePerms).every(
                                      Boolean
                                    );
                                  const newPerms = Object.keys(
                                    prevModulePerms
                                  ).reduce((acc, perm) => {
                                    acc[perm] = !all;
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
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                allSelected
                                  ? "bg-[#0872b3] text-white hover:bg-[#065a8f]"
                                  : someSelected
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                              }`}
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(mergedPerms).map(
                              ([perm, isChecked]: [string, boolean]) => (
                                <label
                                  key={perm}
                                  className="flex items-center space-x-3 text-sm cursor-pointer group"
                                >
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={!!isChecked}
                                      onChange={() => {
                                        setEditForm((prev) => {
                                          const prevModulePerms = {
                                            ...(
                                              prev.position_access as Record<
                                                string,
                                                Record<string, boolean>
                                              >
                                            )[module],
                                          };
                                          prevModulePerms[perm] =
                                            !prevModulePerms[perm];
                                          return {
                                            ...prev,
                                            position_access: {
                                              ...prev.position_access,
                                              [module]: prevModulePerms,
                                            },
                                          };
                                        });
                                      }}
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
        {/* DisActivate Confirmation Modal */}
        {showDisActivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="w-6 h-6 text-red-600"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    DisActivate Position
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to DisActivate{" "}
                  <strong>{position.position_name}</strong>? This action cannot
                  be undone.
                </p>
                {disActivateError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {disActivateError}
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
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                        DisActivating...
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
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Position Details</h1>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {position.position_status}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Position Name
                </div>
                <div className="font-medium text-gray-900">
                  {position.position_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Description
                </div>
                <div className="font-medium text-gray-900">
                  {position.position_description}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="font-medium text-gray-900">
                  {position.position_status}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Created At
                </div>
                <div className="font-medium text-gray-900">
                  {position.created_at
                    ? new Date(position.created_at).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">
                  Assigned User
                </div>
                <div className="font-medium text-gray-900">
                  {position.user ? (
                    <>
                      {position.user.first_name} {position.user.last_name}
                      {isUserWithAuth(position.user) &&
                      position.user.auth.email ? (
                        <span className="text-gray-500">
                          {" "}
                          ({position.user.auth.email})
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
            {/* Permissions List */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">Permissions</h2>
              {position.position_access &&
                typeof position.position_access === "object" && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(
                      position.position_access as Record<
                        string,
                        Record<string, boolean>
                      >
                    ).map(([module, perms]) => {
                      const activePerms = Object.entries(perms).filter(
                        ([, val]) => val
                      );
                      if (activePerms.length === 0) return null;
                      return (
                        <div
                          key={module}
                          className="bg-blue-50 rounded p-2 border border-blue-100"
                        >
                          <div className="font-semibold text-blue-700 mb-1 capitalize">
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
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useVehicleModel,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { TransmissionMode } from "@/types/enums";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";
import { Ban } from "lucide-react";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Move all data fetching hooks to the top
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id);
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const { data: vehicleModel } = useVehicleModel(
    vehicle?.vehicle_model_id || ""
  );

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Remove vehicle_type and vehicle_capacity from editForm and edit modal
  const [editForm, setEditForm] = useState({
    plate_number: "",
    transmission_mode: "",
    vehicle_model_id: "",
    vehicle_year: 2020,
    energy_type: "",
    organization_id: "",
    vehicle_photo: undefined as File | undefined,
  });

  React.useEffect(() => {
    if (vehicle) {
      setEditForm({
        plate_number: vehicle.plate_number || "",
        transmission_mode: vehicle.transmission_mode || "",
        vehicle_model_id: vehicle.vehicle_model_id || "",
        vehicle_year: vehicle.vehicle_year || 2020,
        energy_type: vehicle.energy_type || "",
        organization_id: vehicle.organization_id || "",
        vehicle_photo: undefined,
      });
    }
  }, [vehicle]);

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicles?.view;
  const canViewSingle = !!user?.position?.position_access?.vehicles?.viewSingle;
  const canUpdate = !!user?.position?.position_access?.vehicles?.update;
  const canDelete = !!user?.position?.position_access?.vehicles?.delete;

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canViewSingle || canUpdate || canDelete;

  // Early returns
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!hasAnyPermission) {
    return <NoPermissionUI resource="vehicles" />;
  }

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!canUpdate) {
      // toast.error("You do not have permission to update vehicles");
      return;
    }

    if (!vehicle) return;
    setEditForm({
      plate_number: vehicle.plate_number || "",
      transmission_mode: vehicle.transmission_mode || "",
      vehicle_model_id: vehicle.vehicle_model_id || "",
      vehicle_year: vehicle.vehicle_year || 2020,
      energy_type: vehicle.energy_type || "",
      organization_id: vehicle.organization_id || "",
      vehicle_photo: undefined,
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      // toast.error("You do not have permission to update vehicles");
      return;
    }

    setSubmitting(true);
    try {
      await updateVehicle.mutateAsync({
        id,
        updates: {
          ...editForm,
          transmission_mode: editForm.transmission_mode as TransmissionMode,
        },
      });
      // toast.success("Vehicle updated!");
      setShowEdit(false);
      refetch();
    } catch {
      // Error handled by mutation
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      // toast.error("You do not have permission to delete vehicles");
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!canDelete) return;

    try {
      await deleteVehicle.mutateAsync({ id });
      // toast.success("Vehicle deleted!");
      setShowDeleteDialog(false);
      router.push("/dashboard/shared_pages/vehicles");
    } catch {
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-200 p-6 h-24"></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-lg p-4 h-16"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (isError || !vehicle) {
    return (
      <ErrorUI
        resource={`vehicle ${vehicle?.plate_number}`}
        onRetry={() => {
          // re-fetch your data
          router.refresh();
        }}
        onBack={() => {
          router.back();
        }}
      />
    );
  }
  // Main return
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
            {/* Only show Edit if user has update permission */}
            {canUpdate && (
              <Button
                className="bg-[#0872b3] text-white hover:bg-[#065d8f]"
                onClick={handleEdit}
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Vehicle
              </Button>
            )}
            {/* Only show Delete if user has delete permission */}
            {canDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="bg-red-400 hover:bg-red-500"
              >
                <Ban className="w-4 h-4 mr-2" />
                DisActivate Vehicle
              </Button>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && canUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold mb-2">Edit Vehicle</h2>

              <label className="text-sm font-medium">
                Plate Number
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={editForm.plate_number}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, plate_number: e.target.value }))
                  }
                  required
                />
              </label>

              <label className="text-sm font-medium">
                Transmission Mode
                <select
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent bg-white"
                  value={editForm.transmission_mode}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      transmission_mode: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select transmission mode</option>
                  {Object.values(TransmissionMode).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Manufacturer
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={vehicleModel?.vehicle_model_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, plate_number: e.target.value }))
                  }
                  required
                />
              </label>

              {/* Show vehicle_status as a badge or text */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${vehicle?.vehicle_status === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : vehicle?.vehicle_status === "OCCUPIED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {vehicle?.vehicle_status}
                </span>
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
                  className="flex-1 py-2 px-4 bg-[#0872b3] text-white rounded hover:bg-[#065d8f]"
                  disabled={submitting || !canUpdate}
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
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCar} className="text-2xl" />
                <h1 className="text-2xl font-bold">Vehicle Details</h1>
              </div>
              {/* Show vehicle_status as a badge or text */}
              <div
                className={`text-sm px-3 py-1 rounded-full ${vehicle.vehicle_status === "AVAILABLE"
                    ? "bg-green-100 text-green-700"
                    : vehicle.vehicle_status === "OCCUPIED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {vehicle.vehicle_status}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plate Number */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Plate Number
                </div>
                <div className="font-medium text-gray-900">
                  {vehicle.plate_number}
                </div>
              </div>
              {/* Transmission Mode */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Transmission Mode
                </div>
                <div className="font-medium text-gray-900">
                  {vehicle.transmission_mode}
                </div>
              </div>
              {/* Vehicle Year */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Year
                </div>
                <div className="font-medium text-gray-900">
                  {vehicle.vehicle_year}
                </div>
              </div>

              {/* Energy Type */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Energy Type
                </div>
                <div className="font-medium text-gray-900">
                  {vehicle.energy_type}
                </div>
              </div>
              {/* Last Service Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Last Service Date
                </div>
                <div className="font-medium text-gray-900">
                  {vehicle.last_service_date
                    ? new Date(vehicle.last_service_date).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              {/* Vehicle Photo */}
              {vehicle.vehicle_photo &&
                typeof vehicle.vehicle_photo === "string" &&
                vehicle.vehicle_photo.trim() !== "" ? (
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Photo
                  </div>
                  {/* Only render Image if src is a valid URL or path */}
                  {(() => {
                    try {
                      // Try to construct a URL to check validity
                      // Accepts both absolute and relative URLs
                      const src = vehicle.vehicle_photo.startsWith("http")
                        ? vehicle.vehicle_photo
                        : `/uploads/${vehicle.vehicle_photo}`;
                      // Throws if invalid
                      new URL(
                        src,
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost"
                      );
                      return (
                        <Image
                          width={500}
                          height={500}
                          src={src}
                          alt="Vehicle"
                          className="rounded shadow object-cover border"
                        />
                      );
                    } catch {
                      return (
                        <div className="text-gray-400 text-xs">
                          Invalid image URL
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Photo
                  </div>
                  <div className="text-gray-400 text-xs">
                    No photo available
                  </div>
                </div>
              )}
              {/* Organization Name */}
              {vehicle.organization && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Organization
                  </div>
                  <div className="font-medium text-gray-900">
                    {vehicle.organization.organization_name}
                  </div>
                </div>
              )}
              {/* Capacity Name */}
              {vehicle.vehicle_model?.vehicle_capacity && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Capacity
                  </div>
                  <div className="font-medium text-gray-900">
                    {vehicle.vehicle_model.vehicle_capacity}
                  </div>
                </div>
              )}
              {/* Model Name and Manufacturer */}
              {vehicle.vehicle_model && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Model
                  </div>
                  <div className="font-medium text-gray-900">
                    {vehicle.vehicle_model.manufacturer_name}{" "}
                    {vehicle.vehicle_model.vehicle_model_name}
                  </div>
                </div>
              )}
              {/* Status (already shown above, but keep for completeness) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div
                  className={`font-medium text-gray-900 inline-block px-2 py-1 rounded-full text-xs ${vehicle.vehicle_status === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : vehicle.vehicle_status === "OCCUPIED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {vehicle.vehicle_status}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {/* <button
                  onClick={() =>
                    router.push(`/dashboard/shared_pages/vehicles/${vehicle.vehicle_id}/tracking`)
                  }
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-colors duration-300"
                >
                  Track The Car
                </button> */}

                <button
                  onClick={() =>
                    router.push(`/dashboard/shared_pages/vehicles/${vehicle.vehicle_id}/locations`)
                  }
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-colors duration-300"
                >
                  Locate The Car
                </button>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900">
                Model Information
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faCar}
                    className="text-blue-600 mt-1"
                  />
                  <div>
                    <div className="font-semibold text-blue-900">
                      {vehicleModel?.manufacturer_name}{" "}
                      {vehicleModel?.vehicle_model_name}
                    </div>
                    <div className="text-blue-700 text-sm">
                      This Car was manufactured by{" "}
                      {vehicleModel?.manufacturer_name}.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>DisActivate Vehicle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to Disactivate the vehicle with plate number
                &quot;{vehicle?.plate_number}&quot;? This action cannot be
                undone and may affect related records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                DisActivate Vehicle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

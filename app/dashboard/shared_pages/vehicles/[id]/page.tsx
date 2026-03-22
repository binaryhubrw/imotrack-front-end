"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  faArrowLeft,
  faEdit,
  faCar,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO, startOfDay, addDays } from "date-fns";
import {
  useVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  useVehicleModel,
  useReservations,
} from "@/lib/queries";
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
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Only fetch reservations when user can view them (for calendar dots)
  const canViewReservations = !!user?.position?.position_access?.reservations?.view;
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id);
  const { data: allReservations } = useReservations({ enabled: canViewReservations });
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const { data: vehicleModel } = useVehicleModel(
    vehicle?.vehicle_model_id || ""
  );

  const reservedDates = React.useMemo(() => {
    if (!allReservations || !id) return [];
    
    return allReservations
      .filter((res: any) => 
        res.reservation_status !== "CANCELLED" && 
        res.reservation_status !== "REJECTED" && 
        res.reserved_vehicles?.some((rv: any) => rv.vehicle?.vehicle_id === id)
      )
      .flatMap((res: any) => {
        const start = parseISO(res.departure_date);
        const end = parseISO(res.expected_returning_date);
        const dates = [];
        let current = startOfDay(start);
        const last = startOfDay(end);
        
        while (current <= last) {
          dates.push(new Date(current));
          current = addDays(current, 1);
        }
        return dates;
      });
  }, [allReservations, id]);

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
      <div className="max-w-6xl mx-auto px-4">
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
              <p className="text-xs text-amber-700 mb-2">
                <span className="text-red-500 font-semibold">*</span> Required field
              </p>

              <label className="text-sm font-medium">
                Plate Number <span className="text-red-500">*</span>
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
                Transmission Mode <span className="text-red-500">*</span>
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

              {/* Vehicle Photo Upload */}
              <label className="text-sm font-medium">
                Vehicle Photo
                <div className="mt-1 flex flex-col gap-2">
                  {/* Preview: new file or existing photo */}
                  {editForm.vehicle_photo ? (
                    <div className="relative w-full h-36 rounded overflow-hidden border">
                      <Image
                        src={URL.createObjectURL(editForm.vehicle_photo)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm((f) => ({ ...f, vehicle_photo: undefined }))}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ) : vehicle?.vehicle_photo ? (
                    <div className="relative w-full h-36 rounded overflow-hidden border">
                      <Image
                        src={vehicle.vehicle_photo.startsWith("http") ? vehicle.vehicle_photo : `/uploads/${vehicle.vehicle_photo}`}
                        alt="Current photo"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">Current</span>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#0872b3] file:text-white hover:file:bg-[#065d8f] cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditForm((f) => ({ ...f, vehicle_photo: file }));
                    }}
                  />
                </div>
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
              <div
                className={`text-sm px-3 py-1 rounded-full font-semibold ${
                  vehicle.vehicle_status === "AVAILABLE"
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
            {/* Two-column layout: photo left, details right */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left — Vehicle Photo */}
              <div className="lg:w-72 shrink-0">
                <div className="bg-gray-50 rounded-xl border overflow-hidden h-64 lg:h-full min-h-[16rem] flex flex-col">
                  <div className="text-xs text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2 font-medium">
                    Photo
                  </div>
                  <div className="flex-1 relative">
                    {vehicle.vehicle_photo &&
                    typeof vehicle.vehicle_photo === "string" &&
                    vehicle.vehicle_photo.trim() !== "" ? (
                      (() => {
                        try {
                          const src = vehicle.vehicle_photo.startsWith("http")
                            ? vehicle.vehicle_photo
                            : `/uploads/${vehicle.vehicle_photo}`;
                          new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");
                          return (
                            <Image
                              src={src}
                              alt="Vehicle"
                              fill
                              className="object-cover"
                            />
                          );
                        } catch {
                          return <div className="flex items-center justify-center h-full text-gray-400 text-xs">Invalid image</div>;
                        }
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300">
                        <FontAwesomeIcon icon={faCar} className="text-5xl" />
                        <span className="text-xs text-gray-400">No photo available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — Details grid */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Plate Number</div>
                    <div className="font-semibold text-gray-900 mt-1">{vehicle.plate_number}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Transmission</div>
                    <div className="font-semibold text-gray-900 mt-1">{vehicle.transmission_mode}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Year</div>
                    <div className="font-semibold text-gray-900 mt-1">{vehicle.vehicle_year}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Energy Type</div>
                    <div className="font-semibold text-gray-900 mt-1">{vehicle.energy_type}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                    <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      vehicle.vehicle_status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : vehicle.vehicle_status === "OCCUPIED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {vehicle.vehicle_status}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Last Service</div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {vehicle.last_service_date
                        ? new Date(vehicle.last_service_date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  {vehicle.vehicle_model && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Model</div>
                      <div className="font-semibold text-gray-900 mt-1">
                        {vehicle.vehicle_model.manufacturer_name} {vehicle.vehicle_model.vehicle_model_name}
                      </div>
                    </div>
                  )}
                  {vehicle.vehicle_model?.vehicle_capacity && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Capacity</div>
                      <div className="font-semibold text-gray-900 mt-1">{vehicle.vehicle_model.vehicle_capacity}</div>
                    </div>
                  )}
                  {vehicle.organization && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Organization</div>
                      <div className="font-semibold text-gray-900 mt-1">{vehicle.organization.organization_name}</div>
                    </div>
                  )}
                </div>

                {/* Locate button */}
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => router.push(`/dashboard/shared_pages/vehicles/${vehicle.vehicle_id}/locations`)}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-colors duration-300"
                  >
                    Locate The Car
                  </button>
                </div>
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

            {/* Availability Calendar Section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-[#0872b3]" />
                Vehicle Availability
              </h2>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                  <div className="border rounded-md p-2 bg-gray-50">
                    <DayPicker
                      mode="multiple"
                      selected={reservedDates}
                      modifiers={{ reserved: reservedDates }}
                      modifiersClassNames={{
                        reserved: "bg-red-500 text-white font-bold rounded-full hover:bg-red-600 focus:bg-red-600"
                      }}
                      styles={{
                        selected: { backgroundColor: '#ef4444', color: 'white', borderRadius: '50%' }
                      }}
                    />
                  </div>
                  <div className="space-y-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-700 font-medium">Reserved / Busy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-700 font-medium">Available</span>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg text-xs text-blue-800 leading-relaxed border border-blue-100">
                      <strong>How it works:</strong> The red dots indicate days where this vehicle has approved or active reservations. This helps you track when the car is busy or out of the station.
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

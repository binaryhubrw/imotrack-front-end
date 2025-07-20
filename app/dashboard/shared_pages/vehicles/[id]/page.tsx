"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicle, useUpdateVehicle, useDeleteVehicle, useVehicleModel } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faTrash,
  faCar,
} from '@fortawesome/free-solid-svg-icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { TransmissionMode, VehicleType } from "@/types/enums";



export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id);
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    plate_number: '',
    vehicle_type: '',
    transmission_mode: '',
    vehicle_model_id: '',
    vehicle_year: 2020,
    vehicle_capacity: 1,
    energy_type: '',
    organization_id: '',
    vehicle_photo: undefined as File | undefined,
  });
  // Fetch related vehicle model
  const { data: vehicleModel } = useVehicleModel(vehicle?.vehicle_model_id || '');

  React.useEffect(() => {
    if (vehicle) {
      setEditForm({
        plate_number: vehicle.plate_number || '',
        vehicle_type: vehicle.vehicle_type || '',
        transmission_mode: vehicle.transmission_mode || '',
        vehicle_model_id: vehicle.vehicle_model_id || '',
        vehicle_year: vehicle.vehicle_year || 2020,
        vehicle_capacity: vehicle.vehicle_capacity || 1,
        energy_type: vehicle.energy_type || '',
        organization_id: vehicle.organization_id || '',
        vehicle_photo: undefined,
      });
    }
  }, [vehicle]);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!vehicle) return;
    setEditForm({
      plate_number: vehicle.plate_number || '',
      vehicle_type: vehicle.vehicle_type || '',
      transmission_mode: vehicle.transmission_mode || '',
      vehicle_model_id: vehicle.vehicle_model_id || '',
      vehicle_year: vehicle.vehicle_year || 2020,
      vehicle_capacity: vehicle.vehicle_capacity || 1,
      energy_type: vehicle.energy_type || '',
      organization_id: vehicle.organization_id || '',
      vehicle_photo: undefined,
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateVehicle.mutateAsync({
        id,
        updates: {
          ...editForm,
          vehicle_type: editForm.vehicle_type as VehicleType,
          transmission_mode: editForm.transmission_mode as TransmissionMode,
        },
      });
      toast.success("Vehicle model updated!");
      setShowEdit(false);
      refetch();
    } catch {
      // Error handled by mutation
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicle.mutateAsync({ id });
      toast.success("Vehicle model deleted!");
      setShowDeleteDialog(false);
      router.push("/dashboard/shared_pages/vehicle-model");
    } catch {
      setShowDeleteDialog(false);
    }
  };

  // Local enums for select options
  const VehicleTypeOptions = {
    AMBULANCE: "AMBULANCE",
    SEDAN: "SEDAN",
    SUV: "SUV",
    TRUCK: "TRUCK",
    VAN: "VAN",
    MOTORCYCLE: "MOTORCYCLE",
    BUS: "BUS",
    OTHER: "OTHER"
  };

  const getVehicleTypeLabel = (type: string) => {
    const options = Object.values(VehicleTypeOptions).map(value => ({ value, label: value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) }));
    return options.find(option => option.value === type)?.label || type;
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
                    <div key={i} className="bg-gray-100 rounded-lg p-4 h-16"></div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading vehicle model details</div>
      </div>
    );
  }
  // Main return
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" className="text-[#0872b3] hover:text-[#065d8f]" onClick={() => router.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button className="bg-[#0872b3] text-white hover:bg-[#065d8f]" onClick={handleEdit}>
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Model
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold mb-2">Edit Vehicle Model</h2>
              
              <label className="text-sm font-medium">Model Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={editForm.plate_number}
                  onChange={e => setEditForm(f => ({ ...f, plate_number: e.target.value }))}
                  required
                />
              </label>

              <label className="text-sm font-medium">Vehicle Type
                <select
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent bg-white"
                  value={editForm.vehicle_type}
                  onChange={e => setEditForm(f => ({ ...f, vehicle_type: e.target.value }))}
                  required
                >
                  <option value="">Select vehicle type</option>
                  {Object.values(VehicleTypeOptions).map(value => (
                    <option key={value} value={value}>
                      {value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">Manufacturer
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={vehicleModel?.vehicle_model_name}
                  onChange={e => setEditForm(f => ({ ...f, plate_number: e.target.value }))}
                  required
                />
              </label>

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
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
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
                <h1 className="text-2xl font-bold">Vehicle Model Details</h1>
              </div>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {getVehicleTypeLabel(vehicle.vehicle_type)}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Model ID</div>
                <div className="font-medium text-gray-900">{id}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Model Name</div>
                <div className="font-medium text-gray-900">{vehicleModel?.vehicle_model_name}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Type</div>
                <div className="font-medium text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getVehicleTypeLabel(vehicle.vehicle_type)}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Manufacturer</div>
                <div className="font-medium text-gray-900">{vehicleModel?.manufacturer_name}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Created At</div>
                <div className="font-medium text-gray-900">
                  {vehicle.created_at ? new Date(vehicle.created_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Model Information</h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCar} className="text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900">
                      {vehicleModel?.manufacturer_name} {vehicleModel?.vehicle_model_name}
                    </div>
                    <div className="text-blue-700 text-sm">
                      This is a {getVehicleTypeLabel(vehicle.vehicle_type).toLowerCase()} model manufactured by {vehicleModel?.manufacturer_name}.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{vehicleModel?.vehicle_model_name}&quot;? This action cannot be undone and may affect related records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Model
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicleModel, useUpdateVehicleModel, useDeleteVehicleModel } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
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
import { ModelType } from "@/types/enums";
import { Ban } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";


export default function VehicleModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: model, isLoading, isError, refetch } = useVehicleModel(id);
  const updateVehicleModel = useUpdateVehicleModel();
  const deleteVehicleModel = useDeleteVehicleModel();
  const { user, isLoading: authLoading } = useAuth();
  
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    vehicle_model_name: '',
    vehicle_type: undefined as ModelType | undefined,
    manufacturer_name: '',
    vehicle_capacity: 0,
  });

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicleModels?.view;
  const canViewSingle = !!user?.position?.position_access?.vehicleModels?.viewSingle;
  const canUpdate = !!user?.position?.position_access?.vehicleModels?.update;
  const canDelete = !!user?.position?.position_access?.vehicleModels?.delete;

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canViewSingle || canUpdate || canDelete;
 
  const VEHICLE_TYPE_OPTIONS = [
    { value: "SEDAN", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "HATCHBACK", label: "Hatchback" },
    { value: "TRUCK", label: "Truck" },
    { value: "VAN", label: "Van" },
    { value: "COUPE", label: "Coupe" },
    { value: "CONVERTIBLE", label: "Convertible" },
    { value: "WAGON", label: "Wagon" },
    { value: "AMBULANCE", label: "Ambulance" },
    { value: "MOTORCYCLE", label: "Motorcycle" },
    { value: "BUS", label: "Bus" },
    { value: "OTHER", label: "Other" },
  ];
  
  React.useEffect(() => {
    if (model) {
      setEditForm({
        vehicle_model_name: model.vehicle_model_name || '',
        vehicle_type: (model.vehicle_type as ModelType | undefined),
        manufacturer_name: model.manufacturer_name || '',
        vehicle_capacity: model.vehicle_capacity || 0,
      });
    }
  }, [model]);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!canUpdate) {
      toast.error('You do not have permission to update vehicle models');
      return;
    }
    
    if (!model) return;
    setEditForm({
      vehicle_model_name: model.vehicle_model_name || '',
      vehicle_type: (model.vehicle_type as ModelType | undefined),
      manufacturer_name: model.manufacturer_name || '',
      vehicle_capacity: model.vehicle_capacity || 0,
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      toast.error('You do not have permission to update vehicle models');
      return;
    }
    
    setSubmitting(true);
    try {
      await updateVehicleModel.mutateAsync({ id, updates: editForm });
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
      toast.error('You do not have permission to delete vehicle models');
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!canDelete) return;
    
    try {
      await deleteVehicleModel.mutateAsync({ id });
      // toast.success("Vehicle model deleted!");
      setShowDeleteDialog(false);
      router.push("/dashboard/shared_pages/vehicle-model");
    } catch {
      setShowDeleteDialog(false);
    }
  };

  const getModelTypeLabel = (type: string) => {
    return VEHICLE_TYPE_OPTIONS.find(option => option.value === type)?.label || type;
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!hasAnyPermission) {
    return <NoPermissionUI resource="vehicle models" />;
  }

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
  if (isError || !model) {
    return (
      
      <ErrorUI
                    resource={`model ${model?.vehicle_model_name}`}
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
          <Button variant="ghost" className="text-[#0872b3] hover:text-[#065d8f]" onClick={() => router.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {canUpdate && (
              <Button className="bg-[#0872b3] text-white hover:bg-[#065d8f]" onClick={handleEdit}>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Model
              </Button>
            )}
            {canDelete && (
              <Button className="bg-cyan-600 hover:bg-red-500" variant="destructive" onClick={handleDelete}>
                <Ban className="mr-2" />
                DisActivate
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
              <h2 className="text-xl font-bold mb-2">Edit Vehicle Model</h2>

              <label className="text-sm font-medium">Model Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={editForm.vehicle_model_name}
                  onChange={e => setEditForm(f => ({ ...f, vehicle_model_name: e.target.value }))}
                  required
                />
              </label>

              <label className="text-sm font-medium">Vehicle Type
                <select
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent bg-white"
                  value={editForm.vehicle_type}
                  onChange={e => setEditForm(f => ({ ...f, vehicle_type: e.target.value as ModelType }))}
                  required
                >
                  <option value="">Select vehicle type</option>
                  {VEHICLE_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">Manufacturer
                <input
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={editForm.manufacturer_name}
                  onChange={e => setEditForm(f => ({ ...f, manufacturer_name: e.target.value }))}
                  required
                />
              </label>

              <label className="text-sm font-medium">Vehicle Capacity
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                  value={editForm.vehicle_capacity}
                  onChange={e => setEditForm(f => ({ ...f, vehicle_capacity: parseInt(e.target.value) || 0 }))}
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Blue header */}
          <div className="bg-[#0872b3] text-white px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                <FontAwesomeIcon icon={faCar} className="text-2xl" />
              </div>
              <div>
                <p className="text-white/70 text-sm uppercase tracking-widest">Vehicle Model</p>
                <h1 className="text-2xl font-bold">{model.vehicle_model_name}</h1>
              </div>
            </div>
            <span className="bg-white text-[#0872b3] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              {getModelTypeLabel(model.vehicle_type)}
            </span>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
            {[
              { label: "Model Name", value: model.vehicle_model_name },
              { label: "Manufacturer", value: model.manufacturer_name },
              { label: "Capacity", value: `${model.vehicle_capacity} passengers` },
              { label: "Created", value: model.created_at ? new Date(model.created_at).toLocaleDateString() : "N/A" },
            ].map((item) => (
              <div key={item.label} className="px-6 py-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Detail cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Model Name</span>
                <span className="text-lg font-bold text-gray-800">{model.vehicle_model_name}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Vehicle Type</span>
                <span className="inline-flex mt-1">
                  <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {getModelTypeLabel(model.vehicle_type)}
                  </span>
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Manufacturer</span>
                <span className="text-lg font-bold text-gray-800">{model.manufacturer_name}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Seating Capacity</span>
                <span className="text-lg font-bold text-gray-800">{model.vehicle_capacity}
                  <span className="text-sm font-normal text-gray-500 ml-1">passengers</span>
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Date Added</span>
                <span className="text-lg font-bold text-gray-800">
                  {model.created_at ? new Date(model.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                </span>
              </div>
              {/* Summary card */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                <span className="text-xs text-blue-400 uppercase tracking-wide">Summary</span>
                <p className="text-sm text-blue-800 leading-relaxed">
                  <span className="font-semibold">{model.manufacturer_name} {model.vehicle_model_name}</span> is a{" "}
                  {getModelTypeLabel(model.vehicle_type).toLowerCase()} with a seating capacity of{" "}
                  {model.vehicle_capacity} passengers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && canDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>DisActivate Vehicle Model</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to DisActivate &quot;{model.vehicle_model_name}&quot;? This action cannot be undone and may affect related records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                DisActivate Model
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
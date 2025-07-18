"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicleModel, useUpdateVehicleModel, useDeleteVehicleModel } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Edit, Trash2 } from "lucide-react";
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

export default function VehicleModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: model, isLoading, isError } = useVehicleModel(id);
  const updateVehicleModel = useUpdateVehicleModel();
  const deleteVehicleModel = useDeleteVehicleModel();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    vehicle_model_name: '',
    vehicle_type: '',
    manufacturer_name: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  React.useEffect(() => {
    if (model) {
      setForm({
        vehicle_model_name: model.vehicle_model_name,
        vehicle_type: model.vehicle_type,
        manufacturer_name: model.manufacturer_name,
      });
    }
  }, [model]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVehicleModel.mutateAsync({ id, updates: form });
      toast.success("Vehicle model updated!");
      setEditMode(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteVehicleModel.mutateAsync({ id });
      toast.success("Vehicle model deleted!");
      setShowDeleteDialog(false);
      router.push("/dashboard/shared_pages/vehicle-model");
    } catch {
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading vehicle model...</div>;
  if (isError || !model) return <div className="p-8 text-center text-red-500">Failed to load vehicle model.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border border-gray-100 p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Model Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditMode(true)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
        </div>
      </div>
      {editMode ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Model Name</label>
            <Input name="vehicle_model_name" value={form.vehicle_model_name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 transition-colors duration-200 bg-white"
            >
              <option value="">Select vehicle type</option>
              <option value="SEDAN">SEDAN</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">HATCHBACK</option>
              <option value="TRUCK">TRUCK</option>
              <option value="VAN">VAN</option>
              <option value="COUPE">COUPE</option>
              <option value="CONVERTIBLE">CONVERTIBLE</option>
              <option value="WAGON">WAGON</option>
              <option value="AMBULANCE">AMBULANCE</option>
              <option value="MOTORCYCLE">MOTORCYCLE</option>
              <option value="BUS">BUS</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacturer</label>
            <Input name="manufacturer_name" value={form.manufacturer_name} onChange={handleChange} required />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="bg-[#0872b3] text-white">Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <table className="w-full text-sm mt-2">
          <tbody>
            <tr>
              <td className="font-medium text-gray-700 py-2 pr-4">Model Name</td>
              <td className="py-2">{model.vehicle_model_name}</td>
            </tr>
            <tr>
              <td className="font-medium text-gray-700 py-2 pr-4">Vehicle Type</td>
              <td className="py-2">{model.vehicle_type}</td>
            </tr>
            <tr>
              <td className="font-medium text-gray-700 py-2 pr-4">Manufacturer</td>
              <td className="py-2">{model.manufacturer_name}</td>
            </tr>
            <tr>
              <td className="font-medium text-gray-700 py-2 pr-4">Created</td>
              <td className="py-2">{model.created_at ? new Date(model.created_at).toLocaleString() : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle model? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
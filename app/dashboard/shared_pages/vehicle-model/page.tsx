"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useVehicleModels, useCreateVehicleModel, useDeleteVehicleModel } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Modal for creating a vehicle model
function CreateVehicleModelModal({ open, onClose, onCreate, isLoading }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { vehicle_model_name: string; vehicle_type: string; manufacturer_name: string }) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    vehicle_model_name: '',
    vehicle_type: '',
    manufacturer_name: '',
  });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.vehicle_model_name.trim()) errs.vehicle_model_name = 'Model name is required';
    if (!form.vehicle_type.trim()) errs.vehicle_type = 'Vehicle type is required';
    if (!form.manufacturer_name.trim()) errs.manufacturer_name = 'Manufacturer is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ vehicle_model_name: true, vehicle_type: true, manufacturer_name: true });
    if (!validate()) return;
    await onCreate(form);
    setForm({ vehicle_model_name: '', vehicle_type: '', manufacturer_name: '' });
    setTouched({});
    setErrors({});
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Create Vehicle Model</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Model Name</label>
            <Input name="vehicle_model_name" placeholder="e.g. Toyota Hiace" value={form.vehicle_model_name} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, vehicle_model_name: true }))} required />
            {errors.vehicle_model_name && touched.vehicle_model_name && <p className="text-xs text-red-500 mt-1">{errors.vehicle_model_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <Input name="vehicle_type" placeholder="e.g. VAN, AMBULANCE" value={form.vehicle_type} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, vehicle_type: true }))} required />
            {errors.vehicle_type && touched.vehicle_type && <p className="text-xs text-red-500 mt-1">{errors.vehicle_type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manufacturer</label>
            <Input name="manufacturer_name" placeholder="e.g. Toyota" value={form.manufacturer_name} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, manufacturer_name: true }))} required />
            {errors.manufacturer_name && touched.manufacturer_name && <p className="text-xs text-red-500 mt-1">{errors.manufacturer_name}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</Button>
        </form>
      </div>
    </div>
  );
}

export default function VehicleModelsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: vehicleModels, isLoading, isError } = useVehicleModels();
  const createVehicleModel = useCreateVehicleModel();
  const deleteVehicleModel = useDeleteVehicleModel();

  const handleCreate = async (form: { vehicle_model_name: string; vehicle_type: string; manufacturer_name: string }) => {
    try {
      await createVehicleModel.mutateAsync(form);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle model?')) return;
    try {
      await deleteVehicleModel.mutateAsync({ id });
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Vehicle Models</h1>
        <Button className="flex items-center gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Model
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading vehicle models...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load vehicle models. Please try again.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(vehicleModels || []).map((model) => (
              <div key={model.vehicle_model_id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                      {model.vehicle_model_name}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{model.vehicle_type}</span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">Manufacturer: {model.manufacturer_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      onClick={e => { e.stopPropagation(); toast.info('Edit not implemented'); }}
                      aria-label="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(model.vehicle_model_id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Created: {model.created_at ? new Date(model.created_at).toLocaleString() : 'N/A'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateVehicleModelModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        isLoading={createVehicleModel.isPending}
      />
    </div>
  );
}
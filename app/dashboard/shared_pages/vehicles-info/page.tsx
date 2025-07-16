"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useVehicles, useCreateVehicle, useDeleteVehicle, useVehicleModels } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Modal for creating a vehicle
function CreateVehicleModal({ open, onClose, onCreate, isLoading, orgId }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormData) => void;
  isLoading: boolean;
  orgId: string;
}) {
  const { data: vehicleModels, isLoading: loadingModels } = useVehicleModels();
  const [form, setForm] = useState({
    plate_number: '',
    vehicle_type: '',
    transmission_mode: '',
    vehicle_model_id: '',
    vehicle_photo: null as File | null,
    vehicle_year: '',
    vehicle_capacity: '',
    energy_type: '',
  });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  React.useEffect(() => {
    if (vehicleModels && vehicleModels.length > 0 && !form.vehicle_model_id) {
      setForm(f => ({ ...f, vehicle_model_id: vehicleModels[0].vehicle_model_id }));
    }
  }, [vehicleModels]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.plate_number.trim()) errs.plate_number = 'Plate number is required';
    if (!form.vehicle_type.trim()) errs.vehicle_type = 'Vehicle type is required';
    if (!form.transmission_mode.trim()) errs.transmission_mode = 'Transmission mode is required';
    if (!form.vehicle_model_id.trim()) errs.vehicle_model_id = 'Model is required';
    if (!form.vehicle_year.trim() || isNaN(Number(form.vehicle_year))) errs.vehicle_year = 'Year is required';
    if (!form.vehicle_capacity.trim() || isNaN(Number(form.vehicle_capacity))) errs.vehicle_capacity = 'Capacity is required';
    if (!form.energy_type.trim()) errs.energy_type = 'Energy type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).files?.[0] || null });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ plate_number: true, vehicle_type: true, transmission_mode: true, vehicle_model_id: true, vehicle_year: true, vehicle_capacity: true, energy_type: true });
    if (!validate()) return;
    const formData = new FormData();
    formData.append('plate_number', form.plate_number);
    formData.append('vehicle_type', form.vehicle_type);
    formData.append('transmission_mode', form.transmission_mode);
    formData.append('vehicle_model_id', form.vehicle_model_id);
    if (form.vehicle_photo) formData.append('vehicle_photo', form.vehicle_photo);
    formData.append('vehicle_year', form.vehicle_year);
    formData.append('vehicle_capacity', form.vehicle_capacity);
    formData.append('energy_type', form.energy_type);
    formData.append('organization_id', orgId);
    await onCreate(formData);
    setForm({ plate_number: '', vehicle_type: '', transmission_mode: '', vehicle_model_id: vehicleModels?.[0]?.vehicle_model_id || '', vehicle_photo: null, vehicle_year: '', vehicle_capacity: '', energy_type: '' });
    setTouched({});
    setErrors({});
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Create Vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plate Number</label>
            <Input name="plate_number" value={form.plate_number} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, plate_number: true }))} required />
            {errors.plate_number && touched.plate_number && <p className="text-xs text-red-500 mt-1">{errors.plate_number}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <Input name="vehicle_type" value={form.vehicle_type} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, vehicle_type: true }))} required />
            {errors.vehicle_type && touched.vehicle_type && <p className="text-xs text-red-500 mt-1">{errors.vehicle_type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transmission Mode</label>
            <Input name="transmission_mode" value={form.transmission_mode} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, transmission_mode: true }))} required />
            {errors.transmission_mode && touched.transmission_mode && <p className="text-xs text-red-500 mt-1">{errors.transmission_mode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select name="vehicle_model_id" value={form.vehicle_model_id} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" disabled={loadingModels || !vehicleModels || vehicleModels.length === 0}>
              {loadingModels && <option>Loading...</option>}
              {vehicleModels && vehicleModels.length > 0 ? vehicleModels.map(model => (
                <option key={model.vehicle_model_id} value={model.vehicle_model_id}>{model.vehicle_model_name}</option>
              )) : !loadingModels && <option value="">No models available</option>}
            </select>
            {errors.vehicle_model_id && touched.vehicle_model_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_model_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <input name="vehicle_photo" type="file" accept="image/*" onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Input name="vehicle_year" value={form.vehicle_year} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, vehicle_year: true }))} required />
            {errors.vehicle_year && touched.vehicle_year && <p className="text-xs text-red-500 mt-1">{errors.vehicle_year}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <Input name="vehicle_capacity" value={form.vehicle_capacity} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, vehicle_capacity: true }))} required />
            {errors.vehicle_capacity && touched.vehicle_capacity && <p className="text-xs text-red-500 mt-1">{errors.vehicle_capacity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <Input name="energy_type" value={form.energy_type} onChange={handleChange} onBlur={() => setTouched(t => ({ ...t, energy_type: true }))} required />
            {errors.energy_type && touched.energy_type && <p className="text-xs text-red-500 mt-1">{errors.energy_type}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</Button>
        </form>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const orgId = user?.organization?.organization_id || '';
  const { data: vehicles, isLoading, isError } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const handleCreate = async (formData: FormData) => {
    try {
      await createVehicle.mutateAsync(formData as any);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle.mutateAsync({ id });
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Vehicles</h1>
        <Button className="flex items-center gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Vehicle
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading vehicles...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load vehicles. Please try again.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(vehicles || []).map((vehicle) => (
              <div key={vehicle.vehicle_id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                      {vehicle.plate_number}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{vehicle.vehicle_type}</span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">Model: {vehicle.vehicle_model_id}</div>
                    <div className="text-gray-600 text-sm mt-1">Year: {vehicle.vehicle_year} | Capacity: {vehicle.vehicle_capacity}</div>
                    <div className="text-gray-600 text-sm mt-1">Energy: {vehicle.energy_type}</div>
                    <div className="text-gray-600 text-sm mt-1">Status: {vehicle.vehicle_status}</div>
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
                        handleDelete(vehicle.vehicle_id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Created: {vehicle.created_at ? new Date(vehicle.created_at).toLocaleString() : 'N/A'}</div>
                {vehicle.vehicle_photo && (
                  <div className="mt-2">
                    <img src={vehicle.vehicle_photo} alt="Vehicle" className="w-full h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateVehicleModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        isLoading={createVehicle.isPending}
        orgId={orgId}
      />
    </div>
  );
}
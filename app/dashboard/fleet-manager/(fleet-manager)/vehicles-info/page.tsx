'use client'
import React, { useState, useMemo } from 'react';
import { Car, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Fuel, Calendar, MapPin, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useFMVehicles, useCreateFMVehicles, useUpdateFMVehicle, useDeleteFMVehicle, useFMVehiclesStatuses } from '@/lib/queries';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Updated interfaces to match API response
interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: string;
  vehicle_model: string;
  manufacturer: string;
  year: number;
  capacity?: number;
  odometer?: number;
  status: string;
  fuel_type?: string;
  last_service_date?: string;
  created_at: string;
  organization_name?: string;
}

interface CreateVehicleDto {
  plate_number: string;
  vehicle_type: string;
  vehicle_model: string;
  manufacturer: string;
  year: number;
  capacity?: number;
  odometer?: number;
  status: string;
  fuel_type?: string;
  last_service_date?: string;
}

type UpdateVehicleDto = CreateVehicleDto

const VEHICLE_TYPES = [
  'Sedan', 'SUV', 'Truck', 'Van', 'Bus', 'Pickup', 'Motorcycle', 'Other'
];
const VEHICLE_MODELS = [
  'Corolla', 'Hilux', 'Land Cruiser', 'RAV4', 'Fuso', 'Canter', 'Prado', 'Premio', 'Vitz', 'Other'
];

// --- MOCK DATA FOR DROPDOWNS ---
// In a real app, this might come from an API
const vehicleData: Record<string, Record<string, number[]>> = {
  Sedan: {
    Corolla: [4, 5],
    Civic: [4, 5],
    Camry: [5],
  },
  SUV: {
    RAV4: [5, 7],
    'CR-V': [5],
    Explorer: [7],
  },
  Truck: {
    'F-150': [3, 5, 6],
    Hilux: [2, 5],
    Tacoma: [4, 5],
  },
  Van: {
    Sienna: [7, 8],
    Transit: [8, 12, 15],
  },
  Bus: {
    Coaster: [22, 29],
    'Rosa': [25, 30],
  },
};

const vehicleTypes = Object.keys(vehicleData);
// --- END MOCK DATA ---

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'OCCUPIED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'OUT_OF_SERVICE':
      return 'bg-gray-200 text-gray-600 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MANUFACTURERS = [
  'Toyota', 'Honda', 'Ford', 'Nissan', 'Mitsubishi', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Hyundai', 'Kia', 'Other'
];

export default function VehiclesDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { register, handleSubmit, reset, watch } = useForm<CreateVehicleDto>();
  const router = useRouter();

  // Watch for changes in the vehicle type dropdown
  const selectedVehicleType = watch('vehicle_type');

  // Get models and capacities based on selections
  const vehicleModels = useMemo(() => {
    return selectedVehicleType ? Object.keys(vehicleData[selectedVehicleType]) : [];
  }, [selectedVehicleType]);

  const selectedVehicleModel = watch('vehicle_model');

  const vehicleCapacities = useMemo(() => {
    if (selectedVehicleType && selectedVehicleModel) {
      return vehicleData[selectedVehicleType][selectedVehicleModel] || [];
    }
    return [];
  }, [selectedVehicleType, selectedVehicleModel]);

  // Fetch vehicles
  const { data: vehicles, isLoading, isError } = useFMVehicles();
  const createVehicle = useCreateFMVehicles();
  const updateVehicle = useUpdateFMVehicle();
  const deleteVehicle = useDeleteFMVehicle();
  const { data: statusOptions = [], isLoading: isStatusLoading, isError: isStatusError } = useFMVehiclesStatuses() as { data: { value: string; label: string }[]; isLoading: boolean; isError: boolean };

  // Filter vehicles based on search term
  const filteredVehicles = (vehicles || []).filter((vehicle: Vehicle) =>
    vehicle.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Add Vehicle
  const onAddVehicle = async (data: CreateVehicleDto) => {
    try {
      // Format the date properly for the API
      const formattedData = {
        ...data,
        year: Number(data.year),
        capacity: data.capacity ? Number(data.capacity) : undefined,
        odometer: data.odometer ? Number(data.odometer) : undefined,
        last_service_date: data.last_service_date || undefined,
      };
      
      await createVehicle.mutateAsync(formattedData);
      toast.success('Vehicle added successfully');
      setShowAddModal(false);
      reset();
    } catch (error) {
      console.error('Add vehicle error:', error);
      toast.error('Failed to add vehicle');
    }
  };

  // Edit Vehicle
  const onEditVehicle = async (data: UpdateVehicleDto) => {
    if (!selectedVehicle) return;
    try {
      const formattedData = {
        ...data,
        year: Number(data.year),
        capacity: data.capacity ? Number(data.capacity) : undefined,
        odometer: data.odometer ? Number(data.odometer) : undefined,
        last_service_date: data.last_service_date || undefined,
      };
      
      await updateVehicle.mutateAsync({ id: selectedVehicle.id, updates: formattedData });
      toast.success('Vehicle updated successfully');
      setShowEditModal(false);
      setSelectedVehicle(null);
      reset();
    } catch (error) {
      console.error('Update vehicle error:', error);
      toast.error('Failed to update vehicle');
    }
  };

  // Delete Vehicle
  const onDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      await deleteVehicle.mutateAsync(selectedVehicle.id);
      toast.success('Vehicle deleted successfully');
      setShowDeleteModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Delete vehicle error:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  // Prefill edit form with selected vehicle data
  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
    
    // Format the date for form input (YYYY-MM-DD)
    const formattedDate = vehicle.last_service_date 
      ? new Date(vehicle.last_service_date).toISOString().split('T')[0]
      : '';
    
    reset({
      vehicle_model: vehicle.vehicle_model,
      vehicle_type: vehicle.vehicle_type,
      manufacturer: vehicle.manufacturer,
      year: vehicle.year,
      capacity: vehicle.capacity,
      plate_number: vehicle.plate_number,
      odometer: vehicle.odometer,
      status: vehicle.status,
      fuel_type: vehicle.fuel_type,
      last_service_date: formattedDate,
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load vehicles.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles</h1>
              <p className="text-gray-600">Manage your fleet vehicles and track their status</p>
            </div>
            <button
              className="cursor-pointer bg-[#0872B3] hover:bg-[#055a8c] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => { setShowAddModal(true); reset(); }}
            >
              <Plus size={20} />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header with Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {currentVehicles.map((vehicle: Vehicle) => (
    <tr
      key={vehicle.id}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() =>
        router.push(`/dashboard/fleet-manager/vehicles-info/${vehicle.id}`)
      }
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="bg-gray-100 p-2 rounded-lg mr-4">
            <Car className="text-gray-600" size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {vehicle.manufacturer} {vehicle.vehicle_model}
            </div>
            <div className="text-sm text-gray-500">
              {vehicle.year} • {vehicle.vehicle_type}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{vehicle.plate_number}</div>
        <div className="text-sm text-gray-500">
          Capacity: {vehicle.capacity || 0} seats
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            vehicle.status
          )}`}
        >
          {vehicle.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Fuel className="mr-1 text-gray-400" size={16} />
          {vehicle.odometer?.toLocaleString() || 0} mi
        </div>
        <div className="text-sm text-gray-500">
          {vehicle.fuel_type || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="mr-1 text-gray-400" size={16} />
          {vehicle.last_service_date
            ? new Date(vehicle.last_service_date).toLocaleDateString()
            : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="mr-1 text-gray-400" size={16} />
          {vehicle.organization_name || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(vehicle);
            }}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehicle(vehicle);
              setShowDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                  disabled={currentPage === 1} 
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                  disabled={currentPage === totalPages} 
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 overflow-y-auto max-h-[90vh]">
              <button 
                onClick={() => { setShowAddModal(false); reset(); }} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors" 
                aria-label="Close" 
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-2xl font-bold text-center mb-8 text-[#0872B3]">Add New Vehicle</h2>
              {/* <p className="text-center text-gray-500 mb-8">Fill in the details below to add a new vehicle to the fleet.</p> */}
              
              <form onSubmit={handleSubmit(onAddVehicle)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Vehicle Type</label>
                    <select 
                      {...register('vehicle_type', { required: true })}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      required
                    >
                      <option value="">Select Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Vehicle Model</label>
                    <select 
                      {...register('vehicle_model', { required: true })}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring disabled:bg-gray-100"
                      disabled={!selectedVehicleType}
                      required
                    >
                      <option value="">Select Model</option>
                      {vehicleModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Manufacturer</label>
                    <select 
                      {...register('manufacturer', { required: true })}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      required
                    >
                      <option value="">Select Manufacturer</option>
                      {MANUFACTURERS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Year of Manufacture</label>
                    <input 
                      type="number" 
                      {...register('year', { required: true, min: 1990, max: new Date().getFullYear() + 1 })}
                      placeholder={`e.g., ${new Date().getFullYear()}`}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Plate Number</label>
                    <input 
                      {...register('plate_number', { required: true })} 
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Capacity (Seats)</label>
                    <select 
                      {...register('capacity', { required: true })}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring disabled:bg-gray-100"
                      disabled={!selectedVehicleModel}
                      required
                    >
                      <option value="">Select Capacity</option>
                      {vehicleCapacities.map((capacity) => (
                         <option key={capacity} value={capacity}>{capacity} seats</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Initial Odometer (miles)</label>
                    <input 
                      type="number" 
                      {...register('odometer')} 
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring" 
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Fuel Type</label>
                    <select 
                      {...register('fuel_type')} 
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                    >
                        <option value="">Select Fuel Type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Status</label>
                    {isStatusLoading ? (
                      <div className="text-gray-500 text-sm h-11 flex items-center">Loading...</div>
                    ) : isStatusError ? (
                      <div className="text-red-600 text-sm h-11 flex items-center">Error loading statuses</div>
                    ) : (
                      <select 
                        {...register('status', { required: true })} 
                        className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                        required
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Last Service Date</label>
                    <input 
                      type="date" 
                      {...register('last_service_date')} 
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button" 
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors" 
                    onClick={() => { setShowAddModal(false); reset(); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full bg-[#0872B3] hover:bg-[#065d8f] text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                    disabled={createVehicle.isPending}
                  >
                    {createVehicle.isPending ? 'Adding...' : 'SAVE'}
                  </button>
                </div>
                
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50">
            <div className="relative bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-6 md:my-12 overflow-y-auto max-h-[90vh] animate-fadeIn">
              <button 
                onClick={() => { setShowEditModal(false); setSelectedVehicle(null); reset(); }} 
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                aria-label="Close" 
                type="button"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 underline text-gray-900">Edit Vehicle</h2>
              <form onSubmit={handleSubmit(onEditVehicle)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle Model</label>
                    <input 
                      {...register('vehicle_model', { required: true })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Manufacturer</label>
                    <select
                      {...register('manufacturer', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#0872B3] outline-none transition"
                      required
                    >
                      <option value="">Select Manufacturer</option>
                      {MANUFACTURERS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle Type</label>
                    <input 
                      {...register('vehicle_type', { required: true })} 
                      placeholder="e.g., Sedan, SUV, Truck"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Year of Manufacture</label>
                    <input 
                      type="number" 
                      {...register('year', { required: true })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Plate Number</label>
                    <input 
                      {...register('plate_number', { required: true })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Capacity</label>
                    <input 
                      type="number" 
                      {...register('capacity')} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Initial Odometer (miles)</label>
                    <input 
                      type="number" 
                      {...register('odometer')} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fuel Type</label>
                    <input 
                      {...register('fuel_type')} 
                      placeholder="e.g., Petrol, Diesel, Electric"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                    {isStatusLoading ? (
                      <div className="text-gray-400 text-sm">Loading statuses...</div>
                    ) : isStatusError ? (
                      <div className="text-red-500 text-sm">Failed to load statuses</div>
                    ) : (
                      <select 
                        {...register('status', { required: true })} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Last Service Date</label>
                    <input 
                      type="date" 
                      {...register('last_service_date')} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    type="button" 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold" 
                    onClick={() => { setShowEditModal(false); setSelectedVehicle(null); reset(); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#0872B3] hover:bg-[#055a8c] text-white px-6 py-2 rounded-lg font-semibold" 
                    disabled={updateVehicle.isPending}
                  >
                    {updateVehicle.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600 text-xl w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Vehicle</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedVehicle.plate_number}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" disabled={deleteVehicle.isPending}>Cancel</button>
                <button onClick={onDeleteVehicle} disabled={deleteVehicle.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {deleteVehicle.isPending ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
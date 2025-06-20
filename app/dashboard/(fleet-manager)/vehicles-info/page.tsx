'use client'
import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Calendar,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

const VehiclesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [selectedVehicleType, setSelectedVehicleType] = useState('');

  const router = useRouter()
  // Mock vehicle data - replace with your actual data
  const vehicles = [
    {
      id: 'VH001',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC-1234',
      status: 'Active',
      mileage: 15420,
      fuelType: 'Gasoline',
      lastService: '2024-01-15',
      location: 'Main Depot'
    },
    {
      id: 'VH002',
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      color: 'Blue',
      vin: '1FTFW1ET5DKE12345',
      licensePlate: 'XYZ-5678',
      status: 'In Service',
      mileage: 8750,
      fuelType: 'Gasoline',
      lastService: '2024-02-20',
      location: 'Service Center'
    },
    {
      id: 'VH003',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      color: 'White',
      vin: '5YJ3E1EA4KF123456',
      licensePlate: 'ELC-9999',
      status: 'Active',
      mileage: 12340,
      fuelType: 'Electric',
      lastService: '2024-01-28',
      location: 'Main Depot'
    },
    {
      id: 'VH004',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      color: 'Black',
      vin: '19XFC2F59ME123456',
      licensePlate: 'DEF-4567',
      status: 'Maintenance',
      mileage: 25680,
      fuelType: 'Gasoline',
      lastService: '2024-02-10',
      location: 'Service Center'
    },
    {
      id: 'VH005',
      make: 'Chevrolet',
      model: 'Silverado',
      year: 2022,
      color: 'Red',
      vin: '3GCUYDED4NG123456',
      licensePlate: 'GHI-7890',
      status: 'Active',
      mileage: 18920,
      fuelType: 'Gasoline',
      lastService: '2024-01-05',
      location: 'Main Depot'
    }
  ];

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const capacityOptions: { [key: string]: number[] } = {
    Sedan: [4, 5],
    SUV: [5, 7],
    Truck: [2, 3],
    Bus: [20, 30, 40],
    Van: [8, 12],
    Other: Array.from({ length: 50 }, (_, i) => i + 1),
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in service':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddVehicle = (data: any) => {
    // For now, just log data and close modal
    console.log('New Vehicle:', data);
    setShowAddModal(false);
    reset();
    setSelectedVehicleType('');
  };

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
              onClick={() => setShowAddModal(true)}
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
              <div className="flex gap-2">
                <button className="bg-[#0872B3] text-white px-4 py-2 rounded-lg hover:bg-[#065d94] transition-colors">
                  <Filter className="inline-block mr-2" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mileage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVehicles.map((vehicle) => (
                  <tr 
                    key={vehicle.id}
                    onClick={() => router.push(`/dashboard/vehicles-info/$${vehicle.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-lg mr-4">
                          <Car className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.color}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.licensePlate}</div>
                      <div className="text-sm text-gray-500">VIN: {vehicle.vin.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Fuel className="mr-1 text-gray-400" size={16} />
                        {vehicle.mileage.toLocaleString()} mi
                      </div>
                      <div className="text-sm text-gray-500">{vehicle.fuelType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="mr-1 text-gray-400" size={16} />
                        {new Date(vehicle.lastService).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="mr-1 text-gray-400" size={16} />
                        {vehicle.location}
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
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
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

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50">
            <div className="relative bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-6 md:my-12 overflow-y-auto max-h-[90vh] animate-fadeIn">
              <button
                onClick={() => { setShowAddModal(false); reset(); setSelectedVehicleType(''); }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 underline text-gray-900">Add New Vehicle</h2>
              <form onSubmit={handleSubmit(handleAddVehicle)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle Type</label>
                    <select
                      {...register('vehicleType', { required: true })}
                      value={selectedVehicleType}
                      onChange={e => setSelectedVehicleType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Bus">Bus</option>
                      <option value="Van">Van</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Capacity</label>
                    <select
                      {...register('capacity', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                      disabled={!selectedVehicleType}
                    >
                      <option value="">{selectedVehicleType ? 'Select Capacity' : 'Select Vehicle Type First'}</option>
                      {selectedVehicleType &&
                        capacityOptions[selectedVehicleType]?.map((cap) => (
                          <option key={cap} value={cap}>{cap}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle Model</label>
                    <select {...register('vehicleModel')} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Model</option>
                      <option value="Camry">Camry</option>
                      <option value="F-150">F-150</option>
                      <option value="Model 3">Model 3</option>
                      <option value="Civic">Civic</option>
                      <option value="Silverado">Silverado</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Plate Number</label>
                    <input {...register('plateNumber')} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Odometer Counter</label>
                  <input {...register('odometerCounter')} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                    onClick={() => { setShowAddModal(false); reset(); setSelectedVehicleType(''); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0872B3] hover:bg-[#055a8c] text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesDashboard;
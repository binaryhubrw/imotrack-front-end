import React from 'react'

export default function Vehicle() {
  return (
    <div>
      In Progress
    </div>
  )
}



// "use client";
// import React, { useState, useMemo } from "react";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
//   VisibilityState,
//   ColumnFiltersState,
// } from "@tanstack/react-table";
// import { 
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   AlertCircle,
//   Car,
//   Users,
//   Fuel,
//   Eye,
//   Image as ImageIcon,
//   Loader2,
// } from "lucide-react";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
// import { useVehicles, useCreateVehicle, useDeleteVehicle, useVehicleModels } from '@/lib/queries';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'next/navigation';
// import type { Vehicle, CreateVehicleDto, VehicleModel, VehicleType, TransmissionMode } from '@/types/next-auth';
// import Image from "next/image";

// // Types
// // Remove local Vehicle and CreateVehicleForm interfaces

// // Create Vehicle Modal Component
// function CreateVehicleModal({ 
//   open, 
//   onClose, 
//   onCreate, 
//   isLoading 
// }: {
//   open: boolean;
//   onClose: () => void;
//   onCreate: (data: CreateVehicleDto) => void;
//   isLoading: boolean;
// }) {
//   const { data: vehicleModels, isLoading: modelsLoading } = useVehicleModels();
//   const { user } = useAuth();
//   const [form, setForm] = useState<CreateVehicleDto>({
//     plate_number: '',
//     vehicle_type: 'CAR' as VehicleType,
//     transmission_mode: 'MANUAL' as TransmissionMode,
//     vehicle_model_id: '',
//     vehicle_year: new Date().getFullYear(),
//     vehicle_capacity: 5,
//     energy_type: 'GASOLINE',
//     organization_id: user?.organization.organization_id || '',
//     vehicle_photo: undefined,
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!form.plate_number.trim()) newErrors.plate_number = 'Plate number is required';
//     if (!form.vehicle_model_id) newErrors.vehicle_model_id = 'Vehicle model is required';
//     if (form.vehicle_year < 1900 || form.vehicle_year > new Date().getFullYear() + 1) {
//       newErrors.vehicle_year = 'Invalid year';
//     }
//     if (form.vehicle_capacity < 1) newErrors.vehicle_capacity = 'Capacity must be at least 1';
//     if (!form.energy_type.trim()) newErrors.energy_type = 'Energy type is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setForm(prev => ({ ...prev, vehicle_photo: e.target.files![0] }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     try {
//       await onCreate({
//         ...form,
//         vehicle_type: form.vehicle_type as VehicleType,
//         transmission_mode: form.transmission_mode as TransmissionMode,
//       });
//       // Reset form
//       const { user } = useAuth();
//       setForm({
//         plate_number: '',
//         vehicle_type: 'CAR' as VehicleType,
//         transmission_mode: 'MANUAL' as TransmissionMode,
//         vehicle_model_id: '',
//         vehicle_year: new Date().getFullYear(),
//         vehicle_capacity: 5,
//         energy_type: 'GASOLINE',
//         organization_id: user?.organization.organization_id || '',
//         vehicle_photo: undefined,
//       });
//       setErrors({});
//     } catch (error) {
//       console.error('Error creating vehicle:', error);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                 <Car className="w-6 h-6 text-blue-600" />
//                 Add New Vehicle
//               </h2>
//               <p className="text-gray-600 mt-1">Fill in the details to register a new vehicle</p>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={onClose}
//               disabled={isLoading}
//             >
//               <X className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Plate Number *
//                 </label>
//                 <Input
//                   name="plate_number"
//                   value={form.plate_number}
//                   onChange={handleChange}
//                   placeholder="e.g., ABC-123"
//                   className={errors.plate_number ? 'border-red-500' : ''}
//                 />
//                 {errors.plate_number && (
//                   <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Vehicle Type *
//                 </label>
//                 <select
//                   name="vehicle_type"
//                   value={form.vehicle_type}
//                   onChange={e => setForm(prev => ({ ...prev, vehicle_type: e.target.value as VehicleType }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="CAR">Car</option>
//                   <option value="TRUCK">Truck</option>
//                   <option value="MOTORCYCLE">Motorcycle</option>
//                   <option value="BUS">Bus</option>
//                   <option value="VAN">Van</option>
//                   <option value="AMBULANCE">Ambulance</option>
//                   <option value="SEDAN">Sedan</option>
//                   <option value="SUV">SUV</option>
//                   <option value="OTHER">Other</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Vehicle Model *
//                 </label>
//                 <select
//                   name="vehicle_model_id"
//                   value={form.vehicle_model_id}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.vehicle_model_id ? 'border-red-500' : ''}`}
//                   disabled={modelsLoading}
//                 >
//                   <option value="">Select a model</option>
//                   {vehicleModels?.map(model => (
//                     <option key={model.vehicle_model_id} value={model.vehicle_model_id}>
//                       {model.manufacturer_name} - {model.vehicle_model_name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.vehicle_model_id && (
//                   <p className="text-red-500 text-xs mt-1">{errors.vehicle_model_id}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Transmission Mode *
//                 </label>
//                 <select
//                   name="transmission_mode"
//                   value={form.transmission_mode}
//                   onChange={e => setForm(prev => ({ ...prev, transmission_mode: e.target.value as TransmissionMode }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="MANUAL">Manual</option>
//                   <option value="AUTOMATIC">Automatic</option>
//                   <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Technical Details */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Technical Details</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Year *
//                 </label>
//                 <Input
//                   name="vehicle_year"
//                   type="number"
//                   value={form.vehicle_year}
//                   onChange={handleChange}
//                   min="1900"
//                   max={new Date().getFullYear() + 1}
//                   className={errors.vehicle_year ? 'border-red-500' : ''}
//                 />
//                 {errors.vehicle_year && (
//                   <p className="text-red-500 text-xs mt-1">{errors.vehicle_year}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Capacity *
//                 </label>
//                 <Input
//                   name="vehicle_capacity"
//                   type="number"
//                   value={form.vehicle_capacity}
//                   onChange={handleChange}
//                   min="1"
//                   className={errors.vehicle_capacity ? 'border-red-500' : ''}
//                 />
//                 {errors.vehicle_capacity && (
//                   <p className="text-red-500 text-xs mt-1">{errors.vehicle_capacity}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Energy Type *
//                 </label>
//                 <select
//                   name="energy_type"
//                   value={form.energy_type}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="GASOLINE">Gasoline</option>
//                   <option value="DIESEL">Diesel</option>
//                   <option value="ELECTRIC">Electric</option>
//                   <option value="HYBRID">Hybrid</option>
//                   <option value="LPG">LPG</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Photo Upload */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Photo</h3>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Upload Photo
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onClose}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Vehicle
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Main Vehicles Page Component
// export default function VehiclesPage() {
//   const router = useRouter();
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

//   // Queries and Mutations
//   const { data: vehicles = [], isLoading, isError, error } = useVehicles();
//   const createVehicle = useCreateVehicle();
//   const deleteVehicle = useDeleteVehicle();
//   const { data: vehicleModels = [] } = useVehicleModels();

//   // Table Columns
//   const columns: ColumnDef<Vehicle>[] = useMemo(() => [
//     {
//       accessorKey: "vehicle_photo",
//       header: "Photo",
//       cell: ({ row }) => (
//         <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
//           {row.original.vehicle_photo ? (
//             <Image
//             width={40}
//             height={40}
//               src={row.original.vehicle_photo} 
//               alt={`${row.original.plate_number}`}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <ImageIcon className="w-5 h-5 text-gray-400" />
//           )}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "plate_number",
//       header: "Plate Number",
//       cell: ({ row }) => (
//         <div className="font-medium text-gray-900">
//           {row.original.plate_number}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "vehicle_type",
//       header: "Type",
//       cell: ({ row }) => (
//         <Badge variant="secondary" className="capitalize">
//           {row.original.vehicle_type.toLowerCase()}
//         </Badge>
//       ),
//     },
//     {
//       accessorKey: "vehicle_model_id",
//       header: "Model",
//       cell: ({ row }) => {
//         const model = vehicleModels.find((m: VehicleModel) => m.vehicle_model_id === row.original.vehicle_model_id);
//         return (
//           <div className="text-sm">
//             {model ? (
//               <span className="font-medium">
//                 {model.manufacturer_name} {model.vehicle_model_name}
//               </span>
//             ) : (
//               <span className="text-gray-500">No model</span>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "vehicle_year",
//       header: "Year",
//       cell: ({ row }) => (
//         <div className="text-sm font-medium">
//           {row.original.vehicle_year}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "vehicle_capacity",
//       header: "Capacity",
//       cell: ({ row }) => (
//         <div className="text-sm flex items-center gap-1">
//           <Users className="w-4 h-4 text-gray-400" />
//           {row.original.vehicle_capacity}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "energy_type",
//       header: "Energy Type",
//       cell: ({ row }) => (
//         <div className="text-sm flex items-center gap-1">
//           <Fuel className="w-4 h-4 text-gray-400" />
//           {row.original.energy_type}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "transmission_mode",
//       header: "Transmission",
//       cell: ({ row }) => (
//         <Badge variant="outline" className="capitalize">
//           {row.original.transmission_mode.toLowerCase()}
//         </Badge>
//       ),
//     },
//     {
//       accessorKey: "vehicle_status",
//       header: "Status",
//       cell: ({ row }) => (
//         <Badge variant="outline" className="capitalize">
//           {row.original.vehicle_status.toLowerCase()}
//         </Badge>
//       ),
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push(`/vehicles/${row.original.vehicle_id}`)}
//           >
//             <Eye className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push(`/vehicles/${row.original.vehicle_id}/edit`)}
//           >
//             <Edit className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setVehicleToDelete(row.original)}
//             className="text-red-600 hover:text-red-700"
//           >
//             <Trash2 className="w-4 h-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ], [router, vehicleModels]);

//   const table = useReactTable({
//     data: vehicles,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onGlobalFilterChange: setGlobalFilter,
//     globalFilterFn: "includesString",
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       globalFilter,
//     },
//     initialState: {
//       pagination: {
//         pageSize: 10,
//       },
//     },
//   });

//   // Handle create vehicle
//   const handleCreateVehicle = async (formData: CreateVehicleDto) => {
//     try {
//       await createVehicle.mutateAsync(formData);
//       setShowCreateModal(false);
//     } catch (error) {
//       console.error('Error creating vehicle:', error);
//     }
//   };

//   // Handle delete vehicle
//   const handleDeleteVehicle = async () => {
//     if (!vehicleToDelete) return;
    
//     try {
//       await deleteVehicle.mutateAsync({ id: vehicleToDelete.vehicle_id });
//       setVehicleToDelete(null);
//     } catch (error) {
//       console.error('Error deleting vehicle:', error);
//     }
//   };

//   // Stats calculation
//   const stats = useMemo(() => {
//     const totalVehicles = vehicles.length;
//     const vehiclesByType = vehicles.reduce((acc, vehicle) => {
//       acc[vehicle.vehicle_type] = (acc[vehicle.vehicle_type] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
    
//     const averageYear = vehicles.length > 0 
//       ? Math.round(vehicles.reduce((sum, v) => sum + v.vehicle_year, 0) / vehicles.length)
//       : 0;

//     return {
//       totalVehicles,
//       vehiclesByType,
//       averageYear,
//     };
//   }, [vehicles]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
//         <p className="text-red-600 font-medium">Failed to load vehicles</p>
//         <p className="text-gray-500 text-sm mt-2">
//           {error instanceof Error ? error.message : 'An error occurred'}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
//           <p className="text-gray-600 mt-1">
//             Manage your organization&apos;s vehicle fleet
//           </p>
//         </div>
//         <Button 
//           onClick={() => setShowCreateModal(true)}
//           className="bg-blue-600 hover:bg-blue-700"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Vehicle
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">Total Vehicles</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">Most Common Type</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-gray-900">
//               {Object.entries(stats.vehiclesByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">Average Year</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-gray-900">{stats.averageYear || 'N/A'}</div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-gray-600">Active Vehicles</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">{stats.totalVehicles}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Table */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle>All Vehicles</CardTitle>
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search vehicles..."
//                   value={globalFilter ?? ""}
//                   onChange={(e) => setGlobalFilter(e.target.value)}
//                   className="pl-9 w-64"
//                 />
//               </div>
//               <div className="text-sm text-gray-500">
//                 {table.getFilteredRowModel().rows.length} of {vehicles.length} vehicles
//               </div>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody>
//                 {table.getRowModel().rows.length > 0 ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow key={row.id}>
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id}>
//                           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">
//                       <div className="flex flex-col items-center justify-center">
//                         <Car className="w-12 h-12 text-gray-400 mb-2" />
//                         <p className="text-gray-500">No vehicles found</p>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
          
//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="text-sm text-gray-500">
//               Page {table.getState().pagination.pageIndex + 1} of{' '}
//               {table.getPageCount()}
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//                 Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 Next
//                 <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Create Vehicle Modal */}
//       <CreateVehicleModal
//         open={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onCreate={handleCreateVehicle}
//         isLoading={createVehicle.isPending}
//       />

//       {/* Delete Confirmation Modal */}
//       {vehicleToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Delete Vehicle
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete the vehicle with plate number&nbsp;
//               <span className="font-medium">{vehicleToDelete.plate_number}</span>? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => setVehicleToDelete(null)}
//                 disabled={deleteVehicle.isPending}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={handleDeleteVehicle}
//                 disabled={deleteVehicle.isPending}
//               >
//                 {deleteVehicle.isPending ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Deleting...
//                   </>
//                 ) : (
//                   'Delete'
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
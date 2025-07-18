"use client";
import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VehicleeactTable,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useVehicles, useCreateVehicle, useUnitPositions } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

// Define the type for CreateVehicleDto
import type { CreateVehicleDto } from '@/types/next-auth';
import { SkeletonVehiclesTable } from "@/components/ui/skeleton";

function CreateVehicleModal({ open, onClose, onCreate, isLoading, unitId }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateVehicleDto) => void;
  isLoading: boolean;
  unitId: string | undefined;
}) {
  const { data: positions, isLoading: loadingPositions } = useUnitPositions(unitId || '');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    Vehicle_nid: '',
    Vehicle_phone: '',
    Vehicle_gender: 'MALE',
    Vehicle_dob: '',
    street_address: '',
    position_id: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Set default position_id when positions load
  React.useEffect(() => {
    if (positions && positions.length > 0 && !form.position_id) {
      setForm(f => ({ ...f, position_id: positions[0].position_id }));
    }
  }, [positions]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.Vehicle_nid.trim()) newErrors.Vehicle_nid = 'National ID is required';
    if (!form.Vehicle_phone.trim()) newErrors.Vehicle_phone = 'Phone is required';
    if (!form.Vehicle_dob) newErrors.Vehicle_dob = 'Date of birth is required';
    if (!form.street_address.trim()) newErrors.street_address = 'Street address is required';
    if (!form.position_id) newErrors.position_id = 'Position is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (!validateForm()) return;
    try {
      await onCreate(form);
      setForm({
        first_name: '', last_name: '', Vehicle_nid: '', Vehicle_phone: '', Vehicle_gender: 'MALE', Vehicle_dob: '', street_address: '', position_id: positions?.[0]?.position_id || '', email: '',
      });
      setErrors({});
      setTouched({});
    } catch {
      // error handled by mutation
    }
  };
  const handleClose = () => {
    setForm({
      first_name: '', last_name: '', Vehicle_nid: '', Vehicle_phone: '', Vehicle_gender: 'MALE', Vehicle_dob: '', street_address: '', position_id: positions?.[0]?.position_id || '', email: '',
    });
    setErrors({});
    setTouched({});
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
    
    {/* Header */}
    <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
      <button 
        className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100" 
        onClick={handleClose} 
        disabled={isLoading}
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold text-[#0872b3] pr-10">Create New Vehicle</h2>
      <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new Vehicle account</p>
    </div>

    {/* Form Content */}
    <div className="p-6">
      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">First Name</label>
              <Input 
                name="first_name" 
                placeholder="Enter first name" 
                value={form.first_name} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.first_name && touched.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                disabled={isLoading} 
              />
              {errors.first_name && touched.first_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.first_name}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Last Name</label>
              <Input 
                name="last_name" 
                placeholder="Enter last name" 
                value={form.last_name} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.last_name && touched.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                disabled={isLoading} 
              />
              {errors.last_name && touched.last_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-2">Email Address</label>
            <Input 
              name="email" 
              type="email" 
              placeholder="Enter email address" 
              value={form.email} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
              disabled={isLoading} 
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">National ID</label>
              <Input 
                name="Vehicle_nid" 
                placeholder="Enter National ID" 
                value={form.Vehicle_nid} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.Vehicle_nid && touched.Vehicle_nid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                disabled={isLoading} 
              />
              {errors.Vehicle_nid && touched.Vehicle_nid && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.Vehicle_nid}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Phone Number</label>
              <Input 
                name="Vehicle_phone" 
                placeholder="Enter phone number" 
                value={form.Vehicle_phone} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.Vehicle_phone && touched.Vehicle_phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                disabled={isLoading} 
              />
              {errors.Vehicle_phone && touched.Vehicle_phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.Vehicle_phone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Gender</label>
              <select 
                name="Vehicle_gender" 
                value={form.Vehicle_gender} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white" 
                disabled={isLoading}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-2">Date of Birth</label>
              <Input 
                name="Vehicle_dob" 
                type="date" 
                value={form.Vehicle_dob} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.Vehicle_dob && touched.Vehicle_dob ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                disabled={isLoading} 
              />
              {errors.Vehicle_dob && touched.Vehicle_dob && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.Vehicle_dob}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address & Position */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0872b3] border-b border-[#0872b3]/20 pb-2">Address & Position</h3>
          
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-2">Street Address</label>
            <Input 
              name="street_address" 
              placeholder="Enter street address" 
              value={form.street_address} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] transition-colors duration-200 ${errors.street_address && touched.street_address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
              disabled={isLoading} 
            />
            {errors.street_address && touched.street_address && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.street_address}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-2">Position</label>
            <select 
              name="position_id" 
              value={form.position_id} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition-colors duration-200 bg-white" 
              disabled={isLoading || loadingPositions || !positions || positions.length === 0}
            >
              {loadingPositions && <option>Loading positions...</option>}
              {positions && positions.length > 0 ? positions.map(pos => (
                <option key={pos.position_id} value={pos.position_id}>{pos.position_name}</option>
              )) : !loadingPositions && <option value="">No positions available</option>}
            </select>
            {errors.position_id && touched.position_id && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.position_id}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-xl">
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClose} 
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || loadingPositions || !positions || positions.length === 0} 
          className="min-w-[120px] bg-[#0872b3] hover:bg-[#065a8f] text-white transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </span>
          ) : (
            'Create Vehicle'
          )}
        </Button>
      </div>
    </div>
  </div>
</div>
  );
}

export default function VehiclesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { Vehicle } = useAuth();
  const unitId = Vehicle?.unit?.unit_id;
  const { data: unitsWithVehicles, isLoading, isError } = useVehicles();
  const createVehicle = useCreateVehicle();

  // Flatten Vehicles for table with memoization
  const Vehicles = useMemo(() => {
    if (!unitsWithVehicles) return [];
    return unitsWithVehicles.flatMap(unit =>
      unit.Vehicles.map(Vehicle => ({
        ...Vehicle,
        unit_name: unit.unit_name,
        unit_id: unit.unit_id,
      }))
    );
  }, [unitsWithVehicles]);

  type VehicleRow = typeof Vehicles[number];

  const columns: ColumnDef<VehicleRow>[] = useMemo(() => [
    {
      accessorKey: "first_name",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">First Name</span>,
      cell: ({ row }) => <span className="text-xs text-gray-900 font-medium">{row.getValue("first_name")}</span>,
    },
    {
      accessorKey: "last_name",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Last Name</span>,
      cell: ({ row }) => <span className="text-xs text-gray-900 font-medium">{row.getValue("last_name")}</span>,
    },
    {
      accessorKey: "email",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Email</span>,
      cell: ({ row }) => (
        <a href={`mailto:${row.getValue("email")}`} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">{row.getValue("email")}</a>
      ),
    },
    {
      accessorKey: "Vehicle_gender",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Gender</span>,
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 text-[10px] rounded-full ${row.getValue("Vehicle_gender") === "MALE" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}>{row.getValue("Vehicle_gender")}</span>
      ),
    },
    {
      accessorKey: "Vehicle_phone",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Phone</span>,
      cell: ({ row }) => (
        <a href={`tel:${row.getValue("Vehicle_phone")}`} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">{row.getValue("Vehicle_phone")}</a>
      ),
    },
    {
      accessorKey: "position_name",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Position</span>,
      cell: ({ row }) => <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-800 rounded-full">{row.getValue("position_name")}</span>,
    },
    {
      accessorKey: "unit_name",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Unit</span>,
      cell: ({ row }) => <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-800 rounded-full">{row.getValue("unit_name")}</span>,
    },
    {
      id: "actions",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Actions</span>,
      cell: ({  }) => (
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" onClick={e => { e.stopPropagation(); }} aria-label="Edit"><Edit className="w-4 h-4" /></button>
          <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" onClick={e => { e.stopPropagation(); }} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], []);

  const table = VehicleeactTable<VehicleRow>({
    data: Vehicles,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleCreateVehicle = async (formData: CreateVehicleDto) => {
    try {
      await createVehicle.mutateAsync(formData);
      setShowCreate(false);
    } catch {
      // handled by mutation
    }
  };

  if (isLoading) {
    return (
      <SkeletonVehiclesTable rows={10}/>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-600">Failed to load Vehicles</p>
            <p className="text-gray-500 text-sm mt-2">An error occurred while fetching Vehicles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your organization&apos;s Vehicles and their permissions</p>
        </div>
        <Button className="flex text-white items-center gap-2 bg-[#0872b3] hover:bg-blue-700" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search Vehicles..." value={globalFilter ?? ""} onChange={e => setGlobalFilter(e.target.value)} className="pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{table.getFilteredRowModel().rows.length} of {Vehicles.length} Vehicles</span>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="px-3 py-6 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.original.Vehicle_id} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-3 py-6 whitespace-nowrap text-xs text-gray-900">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="px-3 py-6 text-center text-gray-500">No Vehicles found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="w-4 h-4" />Prev</Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next<ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
      {/* Create Vehicle Modal */}
      <CreateVehicleModal open={showCreate} onClose={() => setShowCreate(false)} isLoading={createVehicle.isPending} onCreate={handleCreateVehicle} unitId={unitId} />
    </div>
  );
}
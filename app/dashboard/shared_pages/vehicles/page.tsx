

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
  useReactTable,
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
  Car,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useVehicles, useDeleteVehicle, useUpdateVehicle, useVehicleModels, useCreateVehicle } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import type { Vehicle, CreateVehicleDto, VehicleModel, VehicleType as VehicleTypeEnum, TransmissionMode as TransmissionModeEnum } from '@/types/next-auth';
import Image from "next/image";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/lib/queries';
import type { Organization } from '@/types/next-auth';
import { SkeletonVehiclesTable } from "@/components/ui/skeleton";

// Local enums for select options
const VehicleType = {
  AMBULANCE: "AMBULANCE",
  SEDAN: "SEDAN",
  SUV: "SUV",
  TRUCK: "TRUCK",
  VAN: "VAN",
  MOTORCYCLE: "MOTORCYCLE",
  BUS: "BUS",
  OTHER: "OTHER"
};
const TransmissionMode = {
  MANUAL: "MANUAL",
  AUTOMATIC: "AUTOMATIC",
  SEMI_AUTOMATIC: "SEMI_AUTOMATIC"
};

// Edit Vehicle Modal Component
function EditVehicleModal({
  open,
  onClose,
  vehicle,
  onUpdate,
  isLoading,
  vehicleModels
}: {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onUpdate: (id: string, data: Partial<CreateVehicleDto>) => void;
  isLoading: boolean;
  vehicleModels: VehicleModel[];
}) {
  const [form, setForm] = useState<CreateVehicleDto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (vehicle) {
      setForm({
        plate_number: vehicle.plate_number,
        vehicle_type: vehicle.vehicle_type as string,
        transmission_mode: vehicle.transmission_mode as string,
        vehicle_model_id: vehicle.vehicle_model_id,
        vehicle_year: vehicle.vehicle_year,
        vehicle_capacity: vehicle.vehicle_capacity,
        energy_type: vehicle.energy_type,
        organization_id: vehicle.organization_id,
        vehicle_photo: undefined,
      });
    }
  }, [vehicle]);

  const validateForm = () => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    if (!form.plate_number.trim()) newErrors.plate_number = 'Plate number is required';
    if (!form.vehicle_model_id) newErrors.vehicle_model_id = 'Vehicle model is required';
    if (form.vehicle_year < 1900 || form.vehicle_year > new Date().getFullYear() + 1) {
      newErrors.vehicle_year = 'Invalid year';
    }
    if (form.vehicle_capacity < 1) newErrors.vehicle_capacity = 'Capacity must be at least 1';
    if (!form.energy_type.trim()) newErrors.energy_type = 'Energy type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm(prev => prev ? { ...prev, [name]: value } : null);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    if (e.target.files && e.target.files[0]) {
      setForm(prev => prev ? { ...prev, vehicle_photo: e.target.files![0] } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !vehicle) return;
    if (!validateForm()) return;
    try {
      await onUpdate(vehicle.vehicle_id, form);
      onClose();
    } catch {
      toast.error('Failed to update vehicle');
    }
  };

  if (!open || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" />
              Edit Vehicle
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                <Input name="plate_number" value={form.plate_number} onChange={handleChange} className={errors.plate_number ? 'border-red-500' : ''} />
                {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {Object.values(VehicleType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model *</label>
                <select name="vehicle_model_id" value={form.vehicle_model_id} onChange={handleChange} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.vehicle_model_id ? 'border-red-500' : ''}`}> 
                  <option value="">Select a model</option>
                  {vehicleModels.map(model => (
                    <option key={model.vehicle_model_id} value={model.vehicle_model_id}>{model.manufacturer_name} - {model.vehicle_model_name}</option>
                  ))}
                </select>
                {errors.vehicle_model_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_model_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission Mode *</label>
                <select name="transmission_mode" value={form.transmission_mode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {Object.values(TransmissionMode).map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <Input name="vehicle_year" type="number" value={form.vehicle_year} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1} className={errors.vehicle_year ? 'border-red-500' : ''} />
                {errors.vehicle_year && <p className="text-red-500 text-xs mt-1">{errors.vehicle_year}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                <Input name="vehicle_capacity" type="number" value={form.vehicle_capacity} onChange={handleChange} min="1" className={errors.vehicle_capacity ? 'border-red-500' : ''} />
                {errors.vehicle_capacity && <p className="text-red-500 text-xs mt-1">{errors.vehicle_capacity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Type *</label>
                <select name="energy_type" value={form.energy_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="GASOLINE">Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Photo</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save Changes</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- CreateVehicleModal ---
function CreateVehicleModal({ open, onClose, onCreate, isLoading, vehicleModels, organizations, defaultOrgId }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateVehicleDto) => void;
  isLoading: boolean;
  vehicleModels: VehicleModel[];
  organizations: Organization[];
  defaultOrgId?: string;
}) {
  const [form, setForm] = useState<CreateVehicleDto>({
    plate_number: '',
    vehicle_type: 'SEDAN',
    transmission_mode: 'MANUAL',
    vehicle_model_id: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_capacity: 1,
    energy_type: 'GASOLINE',
    organization_id: defaultOrgId || (organizations[0]?.organization_id ?? ''),
    vehicle_photo: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  React.useEffect(() => {
    if (vehicleModels && vehicleModels.length > 0 && !form.vehicle_model_id) {
      setForm(f => ({ ...f, vehicle_model_id: vehicleModels[0].vehicle_model_id }));
    }
  }, [vehicleModels]);
  React.useEffect(() => {
    if (defaultOrgId && form.organization_id !== defaultOrgId) {
      setForm(f => ({ ...f, organization_id: defaultOrgId }));
    }
  }, [defaultOrgId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.plate_number.trim()) newErrors.plate_number = 'Plate number is required';
    if (!form.vehicle_model_id) newErrors.vehicle_model_id = 'Vehicle model is required';
    if (form.vehicle_year < 1900 || form.vehicle_year > new Date().getFullYear() + 1) newErrors.vehicle_year = 'Invalid year';
    if (form.vehicle_capacity < 1) newErrors.vehicle_capacity = 'Capacity must be at least 1';
    if (!form.energy_type.trim()) newErrors.energy_type = 'Energy type is required';
    if (!form.organization_id) newErrors.organization_id = 'Organization is required';
    setErrors(newErrors);
    setErrorSummary(Object.keys(newErrors).length > 0 ? 'Please fix the errors below.' : null);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, vehicle_photo: e.target.files![0] }));
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (!validateForm()) return;
    console.log('Submitting vehicle with photo:', form.vehicle_photo);
    if (form.vehicle_photo && !(form.vehicle_photo instanceof File)) {
      setErrorSummary('Selected file is not valid.');
      return;
    }
    await onCreate(form);
    setImgPreview(null);
  };
  const handleClose = () => {
    setForm({
      plate_number: '', vehicle_type: 'SEDAN', transmission_mode: 'MANUAL', vehicle_model_id: vehicleModels?.[0]?.vehicle_model_id || '', vehicle_year: new Date().getFullYear(), vehicle_capacity: 1, energy_type: 'GASOLINE', organization_id: defaultOrgId || (organizations[0]?.organization_id ?? ''), vehicle_photo: undefined,
    });
    setErrors({});
    setTouched({});
    setImgPreview(null);
    setErrorSummary(null);
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100" onClick={handleClose} disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-blue-700 pr-10">Add New Vehicle</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new vehicle</p>
        </div>
        <div className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorSummary && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorSummary}</div>}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b border-blue-200 pb-2">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Plate Number</label>
                  <Input name="plate_number" value={form.plate_number} onChange={handleChange} onBlur={handleBlur} className={`border-gray-300 focus:border-blue-700 focus:ring-blue-700 ${errors.plate_number && touched.plate_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} disabled={isLoading} />
                  {errors.plate_number && touched.plate_number && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.plate_number}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Vehicle Model</label>
                  <select name="vehicle_model_id" value={form.vehicle_model_id} onChange={handleChange} className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white ${errors.vehicle_model_id && touched.vehicle_model_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} disabled={isLoading}>
                    {vehicleModels.map(model => (
                      <option key={model.vehicle_model_id} value={model.vehicle_model_id}>{model.manufacturer_name} - {model.vehicle_model_name}</option>
                    ))}
                  </select>
                  {errors.vehicle_model_id && touched.vehicle_model_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.vehicle_model_id}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Vehicle Type</label>
                  <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white" disabled={isLoading}>
                    {Object.values(VehicleType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Transmission Mode</label>
                  <select name="transmission_mode" value={form.transmission_mode} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white" disabled={isLoading}>
                    {Object.values(TransmissionMode).map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Year</label>
                  <Input name="vehicle_year" type="number" value={form.vehicle_year} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1} className={errors.vehicle_year && touched.vehicle_year ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} disabled={isLoading} />
                  {errors.vehicle_year && touched.vehicle_year && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.vehicle_year}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Capacity</label>
                  <Input name="vehicle_capacity" type="number" value={form.vehicle_capacity} onChange={handleChange} min="1" className={errors.vehicle_capacity && touched.vehicle_capacity ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} disabled={isLoading} />
                  {errors.vehicle_capacity && touched.vehicle_capacity && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.vehicle_capacity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Energy Type</label>
                  <select name="energy_type" value={form.energy_type} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white" disabled={isLoading}>
                    <option value="GASOLINE">Gasoline</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Organization</label>
                  <select name="organization_id" value={form.organization_id} onChange={handleChange} className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white ${errors.organization_id && touched.organization_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} disabled={isLoading || organizations.length === 0}>
                    {organizations.map(org => (
                      <option key={org.organization_id} value={org.organization_id}>{org.organization_name}</option>
                    ))}
                  </select>
                  {errors.organization_id && touched.organization_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.organization_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    disabled={isLoading}
                  />
                  {imgPreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <Image width={40} height={40} src={imgPreview} alt="Preview" className="rounded shadow w-32 h-20 object-cover border" />
                      <span className="text-xs text-gray-600">{form.vehicle_photo?.name}</span>
                    </div>
                  )}
                  {form.vehicle_photo && !(form.vehicle_photo instanceof File) && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Selected file is not a valid image.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Add Vehicle</>)}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main Vehicles Page Component
export default function VehiclesPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const updateVehicle = useUpdateVehicle();
  const createVehicle = useCreateVehicle();
  const handleCreateVehicle = async (formData: CreateVehicleDto) => {
    try {
      await createVehicle.mutateAsync({
        ...formData,
        vehicle_type: formData.vehicle_type as VehicleTypeEnum,
        transmission_mode: formData.transmission_mode as TransmissionModeEnum,
        vehicle_photo: formData.vehicle_photo ?? undefined,
      });
      setShowCreateModal(false);
    } catch {
      // handled by mutation
    }
  };

  // Queries and Mutations
  const { data: vehicles = [], isLoading, isError } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const { data: vehicleModels = [] } = useVehicleModels();
  const { user } = useAuth();
  const { data: orgsData } = useOrganizations(1, 100);
  const organizations = orgsData?.organizations || [];
  const defaultOrgId = user?.organization?.organization_id;

  // Table Columns - keep only essential ones
  const columns: ColumnDef<Vehicle>[] = useMemo(() => [
    {
      accessorKey: "vehicle_photo",
      header: "Photo",
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {row.original.vehicle_photo ? (
            <Image
              width={40}
              height={40}
              src={
                row.original.vehicle_photo.startsWith('http')
                  ? row.original.vehicle_photo
                  : `/uploads/${row.original.vehicle_photo}`
              }
              alt={`${row.original.plate_number}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "plate_number",
      header: "Plate Number",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.plate_number}
        </div>
      ),
    },
    {
      accessorKey: "vehicle_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.vehicle_type.toLowerCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "vehicle_model_id",
      header: "Model",
      cell: ({ row }) => {
        // Prefer nested vehicle_model from API, fallback to vehicleModels lookup
        const model = row.original.vehicle_model || vehicleModels.find((m: VehicleModel) => m.vehicle_model_id === row.original.vehicle_model_id);
        return (
          <div className="text-sm">
            {model ? (
              <span className="font-medium">
                {model.manufacturer_name} {model.vehicle_model_name}
              </span>
            ) : (
              <span className="text-gray-500">No model</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "vehicle_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.vehicle_status.toLowerCase()}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => { e.stopPropagation(); setVehicleToEdit(row.original); setEditModalOpen(true); }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={e => { e.stopPropagation(); setVehicleToDelete(row.original); }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [router, vehicleModels]);

  const table = useReactTable({
    data: vehicles,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await deleteVehicle.mutateAsync({ id: vehicleToDelete.vehicle_id });
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleEditVehicle = async (id: string, data: Partial<CreateVehicleDto>) => {
    // Fix type for vehicle_type and transmission_mode
    const updateData = {
      ...data,
      vehicle_type: data.vehicle_type as VehicleTypeEnum | undefined,
      transmission_mode: data.transmission_mode as TransmissionModeEnum | undefined,
      vehicle_photo: data.vehicle_photo && data.vehicle_photo instanceof File ? data.vehicle_photo : undefined,
    };
    await updateVehicle.mutateAsync({ id, updates: updateData });
    setEditModalOpen(false);
    setVehicleToEdit(null);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const vehiclesByType = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.vehicle_type] = (acc[vehicle.vehicle_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageYear = vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + v.vehicle_year, 0) / vehicles.length)
      : 0;

    return {
      totalVehicles,
      vehiclesByType,
      averageYear,
    };
  }, [vehicles]);

  if (isLoading) {
    return (
      <SkeletonVehiclesTable />
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-medium">Failed to load vehicles</p>
        <p className="text-gray-500 text-sm mt-2">
          {isError ? 'An error occurred' : 'An error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Vehicles</h1>
                <p className="text-sm text-gray-600">
                  Manage your organization&apos;s vehicle fleet ({vehicles.length} vehicles)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-4 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Vehicle
              </Button>
            </div>
          </div>
        </div>
        {/* Stats Cards - make more compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3">
          <Card className="bg-blue-50 border-0 shadow-none rounded-lg">
            <CardHeader className="pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-gray-900">{stats.totalVehicles}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-0 shadow-none rounded-lg">
            <CardHeader className="pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Most Common Type</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-gray-900">
                {Object.entries(stats.vehiclesByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-0 shadow-none rounded-lg">
            <CardHeader className="pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Average Year</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-gray-900">{stats.averageYear || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-0 shadow-none rounded-lg">
            <CardHeader className="pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-green-600">{stats.totalVehicles}</div>
            </CardContent>
          </Card>
        </div>
        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Table Controls */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search vehicles..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 pr-3 py-3.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              {globalFilter && (
                <span className="text-sm text-gray-500">
                  {table.getFilteredRowModel().rows.length} of {vehicles.length} vehicles
                </span>
              )}
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors"
                        onClick={() => router.push(`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}`)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Car className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-gray-500">No vehicles found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-4 pb-4">
              <div className="text-sm text-gray-500">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Create Vehicle Modal */}
        <CreateVehicleModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateVehicle} isLoading={createVehicle.isPending} vehicleModels={vehicleModels} organizations={organizations} defaultOrgId={defaultOrgId} />
        {/* Edit Vehicle Modal */}
        <EditVehicleModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setVehicleToEdit(null); }}
          vehicle={vehicleToEdit}
          onUpdate={handleEditVehicle}
          isLoading={updateVehicle.isPending}
          vehicleModels={vehicleModels}
        />
        {/* Delete Confirmation Modal */}
        {vehicleToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
         <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
           {/* Close Button */}
           <button
             onClick={() => setVehicleToDelete(null)}
             className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
             aria-label="Close modal"
           >
             <X className="w-5 h-5" />
           </button>
   
           {/* Title */}
           <h3 className="text-xl font-semibold text-red-600 mb-2">
             Delete Vehicle
           </h3>
   
           {/* Description */}
           <p className="text-gray-700 text-sm leading-relaxed mb-6">
             Are you sure you want to delete the vehicle with plate number{" "}
             <span className="font-semibold text-gray-900">
               {vehicleToDelete.plate_number}
             </span>
             ? <br />
             <span className="text-red-500">This action cannot be undone.</span>
           </p>
   
           {/* Action Buttons */}
           <div className="flex justify-end gap-3">
             <Button
               variant="outline"
               onClick={() => setVehicleToDelete(null)}
               disabled={deleteVehicle.isPending}
             >
               Cancel
             </Button>
             <Button
               variant="destructive"
               onClick={handleDeleteVehicle}
               disabled={deleteVehicle.isPending}
             >
               {deleteVehicle.isPending ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Deleting...
                 </>
               ) : (
                 "Delete"
               )}
             </Button>
           </div>
         </div>
       </div>
        )}
      </div>
    </div>
  );
}
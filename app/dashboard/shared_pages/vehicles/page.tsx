"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Search,
  X,
  AlertCircle,
  Car,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  ChevronDown,
  Eye,
  MapPin,
  FileDown,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { exportToStyledExcel } from "@/lib/excel-export";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  useVehicles,
  useUpdateVehicle,
  useVehicleModels,
  useCreateVehicle,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type {
  Vehicle,
  CreateVehicleDto as BaseCreateVehicleDto,
  VehicleModel,
} from "@/types/next-auth";
import Image from "next/image";
// import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonVehiclesTable } from "@/components/ui/skeleton";
import { TransmissionMode } from "@/types/enums";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/** Decorative circles overlay for gradient stat cards */
const CardDecoration = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute top-1/2 -left-8 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -bottom-4 right-1/3 w-20 h-20 rounded-full bg-white/5" />
    <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/8" />
  </div>
);

// Searchable Dropdown Component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: Array<{ [key: string]: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the display field name (manufacturer_name, vehicle_model_name, etc.)
  const displayField =
    options.length > 0
      ? Object.keys(options[0]).find((key) => key.includes("name")) ||
        Object.keys(options[0])[0]
      : "";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option[displayField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option name
  const selectedOption = options.find((option) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    return option[idField] === value;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { [key: string]: string }) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    onChange(option[idField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white cursor-pointer ${
          isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => {
              const searchInput = dropdownRef.current?.querySelector("input");
              if (searchInput) {
                (searchInput as HTMLInputElement).focus();
              }
            }, 100);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className={`${
              selectedOption
                ? "text-gray-900"
                : "text-gray-500"
            }`}
          >
            {selectedOption
              ? selectedOption[displayField]
              : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm
                  ? `No ${placeholder.toLowerCase()} found`
                  : `No ${placeholder.toLowerCase()} available`}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const idField =
                  Object.keys(option).find((key) => key.includes("id")) ||
                  Object.keys(option)[0];
                return (
                  <div
                    key={option[idField] || index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                      option[idField] === value
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option[displayField]}
                  </div>
                );
              })
            )}
          </div>
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredOptions.length} of {options.length}{" "}
              {placeholder.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Use the base CreateVehicleDto type
type CreateVehicleDto = BaseCreateVehicleDto;

// Edit Vehicle Modal Component
function EditVehicleModal({
  open,
  onClose,
  vehicle,
  onUpdate,
  isLoading,
  vehicleModels,
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
        transmission_mode: vehicle.transmission_mode as string,
        vehicle_model_id: vehicle.vehicle_model_id,
        vehicle_year: vehicle.vehicle_year,
        energy_type: vehicle.energy_type,
        organization_id: vehicle.organization_id,
        vehicle_photo: undefined,
      });
    }
  }, [vehicle]);

  const validateForm = () => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    if (!form.plate_number.trim())
      newErrors.plate_number = "Plate number is required";
    if (!form.vehicle_model_id)
      newErrors.vehicle_model_id = "Vehicle model is required";
    if (
      form.vehicle_year < 1900 ||
      form.vehicle_year > new Date().getFullYear() + 1
    ) {
      newErrors.vehicle_year = "Invalid year";
    }
    if (!form.energy_type.trim())
      newErrors.energy_type = "Energy type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : null));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    if (e.target.files && e.target.files[0]) {
      setForm((prev) =>
        prev ? { ...prev, vehicle_photo: e.target.files![0] } : null
      );
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
      // toast.error("Failed to update vehicle");
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-xs text-amber-700 flex items-center gap-1 -mt-2">
            <span className="text-red-500 font-semibold">*</span> Required field
          </p>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="plate_number"
                  value={form.plate_number}
                  onChange={handleChange}
                  className={errors.plate_number ? "border-red-500" : ""}
                />
                {errors.plate_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.plate_number}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicle_model_id"
                  value={form.vehicle_model_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vehicle_model_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select a model</option>
                  {vehicleModels.map((model) => (
                    <option
                      key={model.vehicle_model_id}
                      value={model.vehicle_model_id}
                    >
                      {model.manufacturer_name} - {model.vehicle_model_name}
                    </option>
                  ))}
                </select>
                {errors.vehicle_model_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.vehicle_model_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission_mode"
                  value={form.transmission_mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(TransmissionMode).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Technical Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufactured Year <span className="text-red-500">*</span>
                </label>
                <Input
                  name="vehicle_year"
                  type="number"
                  value={form.vehicle_year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={errors.vehicle_year ? "border-red-500" : ""}
                />
                {errors.vehicle_year && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.vehicle_year}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="energy_type"
                  value={form.energy_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
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
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Vehicle Photo
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- CreateVehicleModal ---
function CreateVehicleModal({
  open,
  onClose,
  onCreate,
  isLoading,
  vehicleModels,
  organizationId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateVehicleDto) => void;
  isLoading: boolean;
  vehicleModels: VehicleModel[];
  organizationId: string;
}) {
  const [form, setForm] = useState<CreateVehicleDto>({
    plate_number: "",
    transmission_mode: "",
    vehicle_model_id: "",
    vehicle_year: 0,
    energy_type: "",
    organization_id: organizationId,
    vehicle_photo: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  // Removed auto-selection logic to let users choose their own values
  React.useEffect(() => {
    if (organizationId && form.organization_id !== organizationId) {
      setForm((f) => ({ ...f, organization_id: organizationId }));
    }
  }, [organizationId, form.organization_id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.plate_number.trim())
      newErrors.plate_number = "Plate number is required";
    if (!form.vehicle_model_id)
      newErrors.vehicle_model_id = "Vehicle model is required";
    if (
      form.vehicle_year < 1900 ||
      form.vehicle_year > new Date().getFullYear() + 1
    )
      newErrors.vehicle_year = "Invalid year";
    if (!form.energy_type.trim())
      newErrors.energy_type = "Energy type is required";
    if (!form.organization_id)
      newErrors.organization_id = "Organization is required";
    setErrors(newErrors);
    setErrorSummary(
      Object.keys(newErrors).length > 0 ? "Please fix the errors below." : null
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, vehicle_photo: e.target.files![0] }));
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(
      Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (!validateForm()) return;
    console.log("Submitting vehicle with photo:", form.vehicle_photo);
    if (form.vehicle_photo && !(form.vehicle_photo instanceof File)) {
      setErrorSummary("Selected file is not valid.");
      return;
    }
    await onCreate(form);
    setImgPreview(null);
  };
  const handleClose = () => {
    setForm({
      plate_number: "",
      transmission_mode: "",
      vehicle_model_id: "",
      vehicle_year: 0,
      energy_type: "",
      organization_id: organizationId,
      vehicle_photo: undefined,
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
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-blue-700 pr-10">
            Add New Vehicle
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the details to add a new vehicle
          </p>
          <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
            <span className="text-red-500 font-semibold">*</span> Required field
          </p>
        </div>
        <div className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorSummary && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorSummary}
              </div>
            )}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b border-blue-200 pb-2">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Plate Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="plate_number"
                    placeholder="Enter plate number"
                    value={form.plate_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-blue-700 focus:ring-blue-700 ${
                      errors.plate_number && touched.plate_number
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.plate_number && touched.plate_number && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.plate_number}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={vehicleModels.map(model => ({
                      vehicle_model_id: model.vehicle_model_id,
                      display_name: `${model.manufacturer_name} - ${model.vehicle_model_name}`
                    }))}
                    value={form.vehicle_model_id}
                    onChange={(value) => {
                      setForm(prev => ({ ...prev, vehicle_model_id: value }));
                      if (errors.vehicle_model_id) {
                        setErrors(prev => ({ ...prev, vehicle_model_id: "" }));
                      }
                    }}
                    placeholder="Select vehicle model"
                    className={`${
                      errors.vehicle_model_id && touched.vehicle_model_id
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.vehicle_model_id && touched.vehicle_model_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.vehicle_model_id}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Transmission Mode <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={Object.values(TransmissionMode).map(mode => ({
                      transmission_mode: mode,
                      display_name: mode
                    }))}
                    value={form.transmission_mode}
                    onChange={(value) => {
                      setForm(prev => ({ ...prev, transmission_mode: value }));
                    }}
                    placeholder="Select transmission mode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Year Manufactured <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="vehicle_year"
                    type="number"
                    placeholder="Enter vehicle year of manufacture"
                    value={form.vehicle_year || ""}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={
                      errors.vehicle_year && touched.vehicle_year
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }
                    disabled={isLoading}
                  />
                  {errors.vehicle_year && touched.vehicle_year && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.vehicle_year}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Energy Type <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={[
                      { energy_type: "GASOLINE", display_name: "Gasoline" },
                      { energy_type: "DIESEL", display_name: "Diesel" },
                      { energy_type: "ELECTRIC", display_name: "Electric" },
                      { energy_type: "HYBRID", display_name: "Hybrid" },
                      { energy_type: "LPG", display_name: "LPG" }
                    ]}
                    value={form.energy_type}
                    onChange={(value) => {
                      setForm(prev => ({ ...prev, energy_type: value }));
                    }}
                    placeholder="Select energy type"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                  disabled={isLoading}
                />
                {imgPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      width={40}
                      height={40}
                      src={imgPreview}
                      alt="Preview"
                      className="rounded shadow w-32 h-20 object-cover border"
                    />
                    <span className="text-xs text-gray-600">
                      {form.vehicle_photo?.name}
                    </span>
                  </div>
                )}
                {form.vehicle_photo &&
                  !(form.vehicle_photo instanceof File) && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Selected file is not a valid image.
                    </p>
                  )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Add Vehicle</>
                )}
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
  const { user, isLoading: authLoading } = useAuth();

  // Permission checks (before data hooks so we can skip API calls when no permission)
  const canView = !!user?.position?.position_access?.vehicles?.view;
  const canCreate = !!user?.position?.position_access?.vehicles?.create;

  // Date range for availability filter (must be before useVehicles)
  const [availabilityStartDate, setAvailabilityStartDate] = useState<string>("");
  const [availabilityEndDate, setAvailabilityEndDate] = useState<string>("");

  const availabilityFilter = availabilityStartDate && availabilityEndDate
    ? { startDate: availabilityStartDate, endDate: availabilityEndDate }
    : undefined;
  const { data: vehicles = [], isLoading, isError } = useVehicles(availabilityFilter, { enabled: canView });
  const { data: vehicleModels = [] } = useVehicleModels({ enabled: canView || canCreate });
  const updateVehicle = useUpdateVehicle();
  const createVehicle = useCreateVehicle();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filter states
  const [modelFilter, setModelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [energyTypeFilter, setEnergyTypeFilter] = useState<string>("");
  const canUpdate = !!user?.position?.position_access?.vehicles?.update;
  const canDelete = !!user?.position?.position_access?.vehicles?.delete;
  const hasAnyPermission = canView || canCreate || canUpdate || canDelete;

  // Table Columns - keep only essential ones (must be before early returns)
  const columns: ColumnDef<Vehicle>[] = useMemo(
    () => [
      {
        id: "number",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider px-3">
            #
          </span>
        ),
        cell: ({ row }) => {
          return (
            <span className="text-xs text-gray-700 font-semibold px-3">
              {row.index + 1}
            </span>
          );
        },
        size: 30,
      },
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
                  row.original.vehicle_photo.startsWith("http")
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
        accessorKey: "vehicle_model_id",
        header: "Model",
        cell: ({ row }) => {
          // Prefer nested vehicle_model from API, fallback to vehicleModels lookup
          const model =
            row.original.vehicle_model ||
            vehicleModels.find(
              (m: VehicleModel) =>
                m.vehicle_model_id === row.original.vehicle_model_id
            );
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
            <a
              href={`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
              onClick={e => {
                e.stopPropagation();
                router.push(`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}`);
                e.preventDefault();
              }}
              tabIndex={0}
            >
              <Eye className="w-4 h-4" />
              View
            </a>
            {row.original.vehicle_status === "OCCUPIED" && (
              <a
                href={`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}/locations`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-all duration-200 hover:shadow-sm"
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}/locations`);
                  e.preventDefault();
                }}
                tabIndex={0}
              >
                <MapPin className="w-4 h-4" />
                Track Me
              </a>
            )}
          </div>
        ),
      },
    ],
    [vehicleModels, canUpdate, router]
  );

  // Filtering logic
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Filter by model
    if (modelFilter) {
      filtered = filtered.filter((vehicle) => 
        vehicle.vehicle_model_id === modelFilter
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((vehicle) => 
        vehicle.vehicle_status === statusFilter
      );
    }

    // Filter by energy type
    if (energyTypeFilter) {
      filtered = filtered.filter((vehicle) => 
        vehicle.energy_type === energyTypeFilter
      );
    }

    // Global search filter
    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      filtered = filtered.filter((vehicle) =>
        vehicle.plate_number.toLowerCase().includes(search) ||
        vehicle.vehicle_model?.vehicle_model_name?.toLowerCase().includes(search) ||
        vehicle.vehicle_model?.manufacturer_name?.toLowerCase().includes(search) ||
        vehicle.vehicle_status.toLowerCase().includes(search) ||
        vehicle.energy_type.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [vehicles, modelFilter, statusFilter, energyTypeFilter, globalFilter]);

  // Table configuration
  const table = useReactTable({
    data: filteredVehicles,
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

  // Stats calculation (must be before early returns)
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const vehiclesByType = vehicles.reduce((acc, vehicle) => {
      // Access vehicle_type through the vehicle model
      const vehicleType = vehicle.vehicle_model?.vehicle_type || 'Unknown';
      acc[vehicleType] = (acc[vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // New: Available and Occupied counts
    const availableCount = vehicles.filter(
      (v) => v.vehicle_status === "AVAILABLE"
    ).length;
    const occupiedCount = vehicles.filter(
      (v) => v.vehicle_status === "OCCUPIED"
    ).length;

    return {
      totalVehicles,
      vehiclesByType,
      availableCount,
      occupiedCount,
    };
  }, [vehicles]);

  // Early returns
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!hasAnyPermission) {
    return <NoPermissionUI resource="vehicles" />;
  }

  const handleExportVehicles = () => {
    const excelData = filteredVehicles.map((v) => ({
      "Plate Number": v.plate_number,
      "Model": v.vehicle_model?.vehicle_model_name ?? "N/A",
      "Manufacturer": v.vehicle_model?.manufacturer_name ?? "N/A",
      "Type": v.vehicle_model?.vehicle_type ?? "N/A",
      "Transmission": v.transmission_mode,
      "Year": v.vehicle_year,
      "Energy Type": v.energy_type,
      "Status": v.vehicle_status,
    }));
    const columns = ["Plate Number", "Model", "Manufacturer", "Type", "Transmission", "Year", "Energy Type", "Status"];
    exportToStyledExcel({
      title: "ImoTrak - Vehicles Export",
      sheetName: "Vehicles",
      columns,
      data: excelData,
      filename: "vehicles_export",
      statusColumn: "Status",
      columnWidths: [14, 18, 16, 14, 14, 8, 14, 14],
    }).catch((err) => console.error("Export error:", err));
  };

  const handleCreateVehicle = async (formData: CreateVehicleDto) => {
    if (!canCreate) {
      // toast.error("You do not have permission to create vehicles");
      return;
    }

    try {
      // Fix type casting for API compatibility
      const apiData = {
        ...formData,
        transmission_mode: formData.transmission_mode as TransmissionMode,
        vehicle_photo: formData.vehicle_photo || undefined,
      };
      await createVehicle.mutateAsync(apiData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
    }
  };

  const handleUpdateVehicle = async (
    id: string,
    data: Partial<CreateVehicleDto>
  ) => {
    if (!canUpdate) {
      // toast.error("You do not have permission to update vehicles");
      return;
    }

    try {
      // Fix type for transmission_mode
      const updateData = {
        ...data,
        transmission_mode: data.transmission_mode as
          | TransmissionMode
          | undefined,
        vehicle_photo:
          data.vehicle_photo && data.vehicle_photo instanceof File
            ? data.vehicle_photo
            : undefined,
      };
      await updateVehicle.mutateAsync({ id, updates: updateData });
      setEditModalOpen(false);
      setVehicleToEdit(null);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  };
  // Table configuration (must be before early returns)

  if (isLoading) {
    return <SkeletonVehiclesTable />;
  }

  if (isError && canView) {
    return (
      <ErrorUI
        resource="vehicles"
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

  return (
    <motion.div
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
        {/* Header - match dashboard */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Vehicles
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your organization&apos;s vehicle fleet • {vehicles.length} vehicles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-100 shadow-md"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString()}
              </span>
            </motion.div>
            {canView && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportVehicles}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-gray-300"
                >
                  <FileDown className="w-4 h-4" /> Export Excel
                </Button>
              </motion.div>
            )}
            {canCreate && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[#0872b3] rounded-xl shadow-md hover:shadow-lg hover:bg-[#066399] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Vehicle
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards - gradient style + stagger (match dashboard) */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Vehicles */}
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Total Vehicles</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Car className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">{stats.totalVehicles}</p>
            </div>
          </motion.div>
          {/* Active */}
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Active</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">{stats.totalVehicles}</p>
            </div>
          </motion.div>
          {/* Available */}
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Available</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">{stats.availableCount}</p>
            </div>
          </motion.div>
          {/* Occupied */}
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Occupied</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Car className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">{stats.occupiedCount}</p>
            </div>
          </motion.div>
        </motion.div>
        {/* Table Content - card style match dashboard */}
        {canView ? (
          <motion.div
            className="min-w-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
              {/* Table Controls */}
              <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between bg-white/80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search vehicles..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 bg-white shadow-sm"
                  />
                </div>
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <SearchableDropdown
                    options={vehicleModels.map(model => ({
                      vehicle_model_id: model.vehicle_model_id,
                      display_name: `${model.manufacturer_name} ${model.vehicle_model_name}`
                    }))}
                    value={modelFilter}
                    onChange={setModelFilter}
                    placeholder="All Models"
                    className="w-48"
                  />
                  <SearchableDropdown
                    options={[
                      { status: "AVAILABLE", display_name: "Available" },
                      { status: "OCCUPIED", display_name: "Occupied" },
                      { status: "MAINTENANCE", display_name: "Maintenance" },
                      { status: "OUT_OF_SERVICE", display_name: "Out of Service" }
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="All Status"
                    className="w-40"
                  />
                  <SearchableDropdown
                    options={[
                      { energy_type: "GASOLINE", display_name: "Gasoline" },
                      { energy_type: "DIESEL", display_name: "Diesel" },
                      { energy_type: "ELECTRIC", display_name: "Electric" },
                      { energy_type: "HYBRID", display_name: "Hybrid" },
                      { energy_type: "LPG", display_name: "LPG" }
                    ]}
                    value={energyTypeFilter}
                    onChange={setEnergyTypeFilter}
                    placeholder="All Energy Types"
                    className="w-44"
                  />
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-2 py-1 bg-white shadow-sm">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Availability:</span>
                    <Input
                      type="date"
                      value={availabilityStartDate}
                      onChange={(e) => setAvailabilityStartDate(e.target.value)}
                      className="w-36 h-8 text-sm border-0 py-0 focus-visible:ring-0"
                      aria-label="Availability start date"
                    />
                    <span className="text-gray-400">–</span>
                    <Input
                      type="date"
                      value={availabilityEndDate}
                      onChange={(e) => setAvailabilityEndDate(e.target.value)}
                      className="w-36 h-8 text-sm border-0 py-0 focus-visible:ring-0"
                      aria-label="Availability end date"
                    />
                    {(availabilityStartDate || availabilityEndDate) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setAvailabilityStartDate("");
                          setAvailabilityEndDate("");
                        }}
                        title="Clear date range"
                        aria-label="Clear availability date range"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {table.getFilteredRowModel().rows.length} of{" "}
                    {filteredVehicles.length} vehicles
                  </span>
                </div>
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
                            className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/90"
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
                          className="hover:bg-indigo-50/70 cursor-pointer border-b border-gray-100 transition-colors group"
                          onClick={() =>
                            router.push(`/dashboard/shared_pages/vehicles/${row.original.vehicle_id}`)
                          }
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={`px-4 py-4 whitespace-nowrap text-sm ${cell.column.id === 'actions' ? '!cursor-default group-hover:bg-transparent' : ''}`}
                              onClick={cell.column.id === 'actions' ? e => e.stopPropagation() : undefined}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="p-4 rounded-2xl bg-gray-100/80 mb-3">
                              <Car className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No vehicles found</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting filters or search</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-gray-200"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    {"<<"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    {">>"}
                  </Button>
                </div>
                <span className="text-xs text-gray-700">
                  Page <strong>{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</strong>
                </span>
                <span className="text-xs text-gray-700">
                  Go to page:{" "}
                  <input
                    type="number"
                    min={1}
                    max={table.getPageCount()}
                    value={table.getState().pagination.pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      table.setPageIndex(Math.max(0, Math.min(page, table.getPageCount() - 1)));
                    }}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs"
                  />
                </span>
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value));
                    table.setPageIndex(0);
                  }}
                >
                  {[10, 20, 30, 40, 50].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="min-w-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="p-8 text-center border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-gray-100/80">
                  <Car className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No View Access</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  You don&apos;t have permission to view vehicles, but you can create new ones.
                </p>
                {canCreate && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[#0872b3] rounded-xl shadow-md hover:shadow-lg hover:bg-[#066399] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create New Vehicle
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create Vehicle Modal */}
        {canCreate && (
          <CreateVehicleModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={async (formData) => {
              await handleCreateVehicle(formData);
            }}
            isLoading={createVehicle.isPending}
            vehicleModels={vehicleModels}
            organizationId={
              user && user.organization && user.organization.organization_id
                ? user.organization.organization_id
                : ""
            }
          />
        )}
        {/* Edit Vehicle Modal */}
        {canUpdate && (
          <EditVehicleModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setVehicleToEdit(null);
            }}
            vehicle={vehicleToEdit}
            onUpdate={async (id, data) => {
              await handleUpdateVehicle(id, data);
            }}
            isLoading={updateVehicle.isPending}
            vehicleModels={vehicleModels}
          />
        )}
      </div>
    </motion.div>
  );
}

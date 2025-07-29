"use client";
import React, { useState, useMemo, useCallback } from "react";
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
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Car,
  Eye,
  Edit,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  useVehicleModels,
  useCreateVehicleModel,
  useUpdateVehicleModel,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import type { VehicleModel, CreateVehicleModelDto } from "@/types/next-auth";
import { SkeletonVehicleModelsTable } from "@/components/ui/skeleton";
import { VehicleType } from "@/types/enums";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

function CreateVehicleModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateVehicleModelDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateVehicleModelDto>({
    vehicle_model_name: "",
    vehicle_type: VehicleType.SEDAN,
    manufacturer_name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.vehicle_model_name.trim())
      newErrors.vehicle_model_name = "Model name is required";
    if (!form.vehicle_type) newErrors.vehicle_type = "Vehicle type is required";
    if (!form.manufacturer_name.trim())
      newErrors.manufacturer_name = "Manufacturer name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(
      Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (!validateForm()) return;

    try {
      await onCreate(form);
      setForm({
        vehicle_model_name: "",
        vehicle_type: VehicleType.SEDAN,
        manufacturer_name: "",
      });
      setErrors({});
      setTouched({});
    } catch {
      // error handled by mutation
    }
  };

  const handleClose = () => {
    setForm({
      vehicle_model_name: "",
      vehicle_type: VehicleType.SEDAN,
      manufacturer_name: "",
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0872b3]/10 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-[#0872b3]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0872b3]">
                Create Vehicle Model
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add a new vehicle model to the system
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="vehicle_model_name"
                placeholder="e.g., Camry, Accord, Model 3"
                value={form.vehicle_model_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`transition-colors duration-200 ${
                  errors.vehicle_model_name && touched.vehicle_model_name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
                }`}
                disabled={isLoading}
              />
              {errors.vehicle_model_name && touched.vehicle_model_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.vehicle_model_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    vehicle_type: e.target.value as VehicleType,
                  }))
                }
                onBlur={handleBlur}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 transition-colors duration-200 bg-white ${
                  errors.vehicle_type && touched.vehicle_type
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
                }`}
                disabled={isLoading}
              >
                <option value={VehicleType.SEDAN}>SEDAN</option>
                <option value={VehicleType.SUV}>SUV</option>
                <option value={VehicleType.TRUCK}>TRUCK</option>
                <option value={VehicleType.VAN}>VAN</option>
                <option value={VehicleType.MOTORCYCLE}>MOTORCYCLE</option>
                <option value={VehicleType.BUS}>BUS</option>
                <option value={VehicleType.OTHER}>OTHER</option>
              </select>
              {errors.vehicle_type && touched.vehicle_type && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.vehicle_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <Input
                name="manufacturer_name"
                placeholder="e.g., Toyota, Honda, Tesla"
                value={form.manufacturer_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`transition-colors duration-200 ${
                  errors.manufacturer_name && touched.manufacturer_name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
                }`}
                disabled={isLoading}
              />
              {errors.manufacturer_name && touched.manufacturer_name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.manufacturer_name}
                </p>
              )}
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-[120px] bg-[#0872b3] hover:bg-[#065a8f] text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                "Create Model"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleModelsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const updateVehicleModel = useUpdateVehicleModel();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [modelToEdit, setModelToEdit] = useState<VehicleModel | null>(null);
  const [editForm, setEditForm] = useState({
    vehicle_model_name: "",
    vehicle_type: VehicleType.SEDAN as VehicleType,
    manufacturer_name: "",
  });

  const { user, isLoading: authLoading } = useAuth();
  const canView = !!user?.position?.position_access?.vehicleModels?.view;
  const canCreate = !!user?.position?.position_access?.vehicleModels?.create;
  const canUpdate = !!user?.position?.position_access?.vehicleModels?.update;
  const canDelete = !!user?.position?.position_access?.vehicleModels?.delete;

  // Open edit modal and prefill form
  const openEditModal = useCallback(
    (model: VehicleModel) => {
      if (!canUpdate) {
        toast.error("You do not have permission to update vehicle models");
        return;
      }
      setModelToEdit(model);
      setEditForm({
        vehicle_model_name: model.vehicle_model_name,
        vehicle_type: model.vehicle_type as VehicleType,
        manufacturer_name: model.manufacturer_name,
      });
      setEditModalOpen(true);
    },
    [canUpdate]
  );
  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
    setModelToEdit(null);
    setEditLoading(false);
  }, []);
  const confirmEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!modelToEdit) return;

      setEditLoading(true);
      try {
        await updateVehicleModel.mutateAsync({
          id: modelToEdit.vehicle_model_id,
          updates: editForm,
        });
        closeEditModal();
      } catch (error) {
        console.error("Error updating vehicle model:", error);
      } finally {
        setEditLoading(false);
      }
    },
    [modelToEdit, editForm, updateVehicleModel, closeEditModal]
  );

  const { data: vehicleModels, isLoading, isError } = useVehicleModels();
  const createVehicleModel = useCreateVehicleModel();

  const handleCreateVehicleModel = async (formData: CreateVehicleModelDto) => {
    if (!canCreate) {
      toast.error("You do not have permission to create vehicle models");
      return;
    }

    try {
      await createVehicleModel.mutateAsync(formData);
      setShowCreate(false);
    } catch (error) {
      console.error("Error creating vehicle model:", error);
    }
  };

  // Define columns after all functions are declared
  const columns = useMemo<ColumnDef<VehicleModel>[]>(
    () => [
      {
        accessorKey: "vehicle_model_name",
        header: "Model Name",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue("vehicle_model_name")}
          </div>
        ),
      },
      {
        accessorKey: "vehicle_type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("vehicle_type") as string;
          const getTypeColor = (type: string) => {
            switch (type.toLowerCase()) {
              case "sedan":
                return "bg-blue-100 text-blue-800";
              case "suv":
                return "bg-green-100 text-green-800";
              case "hatchback":
                return "bg-yellow-100 text-yellow-800";
              case "truck":
                return "bg-orange-100 text-orange-800";
              case "van":
                return "bg-purple-100 text-purple-800";
              default:
                return "bg-gray-100 text-gray-800";
            }
          };
          return <Badge className={getTypeColor(type)}>{type}</Badge>;
        },
      },
      {
        accessorKey: "manufacturer_name",
        header: "Manufacturer",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("manufacturer_name")}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue("created_at"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <a
              href={`/dashboard/shared_pages/vehicle-model/${row.original.vehicle_model_id}`}
              className="text-blue-600 font-semibold hover:underline px-2 py-1 rounded"
              onClick={e => {
                e.stopPropagation();
                router.push(`/dashboard/shared_pages/vehicle-model/${row.original.vehicle_model_id}`);
                e.preventDefault();
              }}
              tabIndex={0}
            >
              View
            </a>
          </div>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable<VehicleModel>({
    data: vehicleModels || [],
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

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canCreate || canUpdate || canDelete;
  if (!hasAnyPermission) {
    return <NoPermissionUI resource="vehicle models" />;
  }

  if (isLoading) {
    return <SkeletonVehicleModelsTable />;
  }

  // Only show error UI if user has view permission and there's an actual error
  if (isError && canView) {
    return (
      <ErrorUI
        resource="vehicle models"
        onRetry={() => {
          window.location.reload();
        }}
        onBack={() => {
          router.back();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0872b3]/10 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-[#0872b3]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vehicle Models
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage vehicle models in your fleet
              </p>
            </div>
          </div>
          {canCreate && (
            <Button
              className="flex items-center gap-2 bg-[#0872b3] hover:bg-[#065a8f] text-white"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" /> Add Model
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {canView ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Search and Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vehicle models..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {table.getFilteredRowModel().rows.length} of{" "}
                    {vehicleModels?.length || 0} models
                  </span>
                </div>
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
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
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
                        className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors group"
                        onClick={() =>
                          router.push(`/dashboard/shared_pages/vehicle-model/${row.original.vehicle_model_id}`)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`px-4 py-4 whitespace-nowrap ${cell.column.id === 'actions' ? '!cursor-default group-hover:bg-transparent' : ''}`}
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
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Car className="w-8 h-8 text-gray-300" />
                          <p>No vehicle models found</p>
                          <p className="text-sm">
                            Get started by adding your first vehicle model
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
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
                  className="w-16 border rounded px-2 py-1 text-xs"
                />
              </span>
              <select
                className="border rounded px-2 py-1 text-xs"
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
        </div>
      ) : (
        // Show message when user can't view but has other permissions
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Access to View Vehicle Models
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You don&apos;t have permission to view existing vehicle models,
                but you can create new ones if you have the appropriate
                permissions.
              </p>
              {canCreate && (
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-5 h-5" />
                  Create New Vehicle Model
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Vehicle Model Modal */}
      {canCreate && (
        <CreateVehicleModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          isLoading={createVehicleModel.isPending}
          onCreate={handleCreateVehicleModel}
        />
      )}

      {editModalOpen && modelToEdit && canUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={confirmEdit}
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold mb-2">Edit Vehicle Model</h2>
            <label className="text-sm font-medium">
              Model Name
              <input
                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                value={editForm.vehicle_model_name}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    vehicle_model_name: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="text-sm font-medium">
              Vehicle Type
              <select
                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent bg-white"
                value={editForm.vehicle_type}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    vehicle_type: e.target.value as VehicleType,
                  }))
                }
                required
              >
                <option value="">Select vehicle type</option>
                <option value={VehicleType.SEDAN}>SEDAN</option>
                <option value={VehicleType.SUV}>SUV</option>
                <option value={VehicleType.TRUCK}>TRUCK</option>
                <option value={VehicleType.VAN}>VAN</option>
                <option value={VehicleType.MOTORCYCLE}>MOTORCYCLE</option>
                <option value={VehicleType.BUS}>BUS</option>
                <option value={VehicleType.OTHER}>OTHER</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Manufacturer
              <input
                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-[#0872b3] focus:border-transparent"
                value={editForm.manufacturer_name}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    manufacturer_name: e.target.value,
                  }))
                }
                required
              />
            </label>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={closeEditModal}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

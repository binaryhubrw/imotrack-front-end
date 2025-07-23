"use client";
import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Download, Plus, Edit, Search, Filter } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import {
  useOrganizationUnits,
  useUpdateOrganizationUnit,
  useCreateUnit,
  useOrganizationUnitsByOrgId,
} from "@/lib/queries";
import type { Unit } from "@/types/next-auth";
import { CreateUnitDto } from "@/types/next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonOrganizationsTable } from "@/components/ui/skeleton";
import { OrganizationStatusEnum } from "@/types/enums";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizations } from "@/lib/queries";

// Status badge for unit status
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { className: string; dotColor: string }> =
    {
      ACTIVE: {
        className: "bg-green-100 text-green-700 border-green-200",
        dotColor: "bg-green-500",
      },
      INACTIVE: {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        dotColor: "bg-gray-400",
      },
      PENDING: {
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-500",
      },
    };
  const config = statusConfig[status] || statusConfig.INACTIVE;
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span className="capitalize">{status.toLowerCase()}</span>
    </div>
  );
};

// Create Unit Modal
function CreateUnitModal({
  open,
  onClose,
  onCreate,
  organizations,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateUnitDto) => void;
  organizations: Array<{ organization_id: string; organization_name: string }>;
}) {
  const [form, setForm] = useState({
    unit_name: "",
    organization_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm({ unit_name: "", organization_id: "" });
      onClose();
    } catch {
      // error handled in mutation
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#0872b3]">Create Unit</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            name="unit_name"
            placeholder="Unit Name"
            value={form.unit_name}
            onChange={handleChange}
            required
            className="h-12 text-base px-4 border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
          />
        

          <select
            name="organization_id"
            value={form.organization_id}
            onChange={handleChange}
            required
            className="h-12 text-base px-4 border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] rounded w-full"
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.organization_id} value={org.organization_id}>
                {org.organization_name}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            className="w-full bg-[#0872b3] hover:bg-[#065a8f] text-white transition-colors duration-200 h-11 text-base"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function UnitsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editForm, setEditForm] = useState({
    unit_name: "",
    status: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { user } = useAuth();
  const canViewOrganizations =
    !!user?.position?.position_access?.organizations?.view;
  const { data: orgData } = useOrganizations(1, 100);
  const organizations = orgData?.organizations || [];

  const { data: allUnits, isLoading: isLoadingAll, isError: isErrorAll } = useOrganizationUnits();
  const { data: orgUnits, isLoading: isLoadingOrg, isError: isErrorOrg } = useOrganizationUnitsByOrgId(selectedOrg);
  const isLoading = selectedOrg ? isLoadingOrg : isLoadingAll;
  const isError = selectedOrg ? isErrorOrg : isErrorAll;
  const data = selectedOrg ? orgUnits : allUnits;
  const updateUnit = useUpdateOrganizationUnit();
  const createUnit = useCreateUnit();

  const units: Unit[] = data || [];

  // Filter units by selected organization
  const filteredUnits = selectedOrg
    ? units.filter((u) => u.organization_id === selectedOrg)
    : units;
  // Filter by status
  const statusFilteredUnits = statusFilter
    ? filteredUnits.filter((u) => u.status === statusFilter)
    : filteredUnits;

  const handleEdit = (unit: Unit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUnit(unit);
    setEditForm({
      unit_name: unit.unit_name || "",
      status: unit.status || "",
    });
    setShowEdit(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setSubmitting(true);
    try {
      await updateUnit.mutateAsync({
        unit_id: editingUnit.unit_id,
        updates: editForm,
      });
      setShowEdit(false);
      setEditingUnit(null);
      // The data will be refetched automatically due to react-query
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Unit>[] = [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => (
        <span className="font-mono text-gray-500">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "unit_name",
      header: "Unit Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.unit_name}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "positions",
      header: "Positions",
      cell: ({ row }) => {
        const positions =
          (row.original.positions as { position_status: string }[]) || [];
        const positionsCount = positions.length;
        const activePositions = positions.filter(
          (p) => p.position_status === "ACTIVE"
        ).length;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {positionsCount} total
            </span>
            <span className="text-xs text-green-600">
              {activePositions} active
            </span>
          </div>
        );
      },
    },
    {
      id: "position_details",
      header: "Position Names",
      cell: ({ row }) => {
        const positions =
          (row.original.positions as {
            position_id: string;
            position_name: string;
          }[]) || [];
        if (positions.length === 0) {
          return <span className="text-xs text-gray-400">No positions</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {positions.slice(0, 2).map((position, index) => (
              <span
                key={position.position_id || index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {position.position_name}
              </span>
            ))}
            {positions.length > 2 && (
              <span className="text-xs text-gray-500">
                +{positions.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center">
          <button
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            onClick={(e) => handleEdit(row.original, e)}
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable<Unit>({
    data: units,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Check if user has organizations.view access
  const canViewAllOrganizations = !!user?.position?.position_access?.organizations?.view;
  if (isLoading) {
    return (
      <>
        <div className="overflow-x-auto">
          {isLoading ? (
            <SkeletonOrganizationsTable rows={6} />
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Failed to load organizations.
            </div>
          ) : units.length === 0 ? (
            canViewAllOrganizations ? (
              <div className="p-8 text-center text-gray-500">
                No units found for this organization.
              </div>
            ) : (
              <div className="p-8 text-center text-red-500">
                Access Denied<br />No units available in this organization. Please contact your administrator.
              </div>
            )
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.organization_id}
                    className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                    onClick={() =>
                      router.push(
                        `/dashboard/shared_pages/organizations/${row.original.organization_id}`
                      )
                    }
                    tabIndex={0}
                    aria-label={`View details for organization ${row.original.organization_id}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-4 whitespace-nowrap text-base"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-right text-sm text-gray-500 px-4 py-3"
                  >
                    Showing {units.length} of {units.length}{" "}
                    organizations
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </div>
      </>
    )
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load units. Please try again.
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
                <h1 className="text-xl font-semibold text-gray-900">Units</h1>
                <p className="text-sm text-gray-600">
                  Manage Units records ({units.length} units)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-5 py-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5" />
                Export
              </button>
              <button
                className="flex items-center cursor-pointer gap-2 px-5 py-4 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="w-5 h-5" />
                Add New
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Table Controls */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search units or positions..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 pr-3 py-3.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer transition">
            <Filter className="text-gray-600" />
            <p className="m-0">Filter By</p>
          </span>
                {canViewOrganizations && (
                  <select
                    className="border rounded px-2 py-2 text-sm text-gray-700"
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                  >
                    <option value="">All Organizations</option>
                    {organizations.map((org) => (
                      <option
                        key={org.organization_id}
                        value={org.organization_id}
                      >
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  className="border rounded px-2 py-2 text-sm text-gray-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(OrganizationStatusEnum).map(
                    ([key, value]) => (
                      <option key={key} value={value}>
                        {value.charAt(0) + value.slice(1).toLowerCase()}
                      </option>
                    )
                  )}
                </select>
                {globalFilter && (
                  <span className="text-sm text-gray-500">
                    {table.getFilteredRowModel().rows.length} of{" "}
                    {statusFilteredUnits.length} units
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {units.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No units found
                    </h3>
                    <p className="text-gray-500">
                      Get started by creating your first unit.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreate(true)}
                    className=" text-white bg-[#0872b3] hover:bg-blue-700"
                  >
                    <Plus className="  w-4 h-4 mr-2" />
                    Create Unit
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                    {table
                      .getRowModel()
                      .rows.filter((row) =>
                        statusFilter
                          ? row.original.status === statusFilter
                          : true
                      )
                      .map((row) => (
                        <TableRow
                          key={row.original.unit_id}
                          className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                          onClick={() =>
                            router.push(
                              `/dashboard/shared_pages/units/${row.original.unit_id}`
                            )
                          }
                          tabIndex={0}
                          aria-label={`View details for unit ${row.original.unit_name}`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="px-4 py-4 whitespace-nowrap text-sm"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-right text-sm text-gray-500 px-4 py-3"
                      >
                        Showing{" "}
                        {globalFilter
                          ? table
                              .getFilteredRowModel()
                              .rows.filter((row) =>
                                statusFilter
                                  ? row.original.status === statusFilter
                                  : true
                              ).length
                          : statusFilteredUnits.length}{" "}
                        of {statusFilteredUnits.length} units
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </div>
            {/* Pagination Controls */}
            {units.length > 10 && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-white">
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
                <span className="text-sm text-gray-600">
                  Page{" "}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </strong>
                </span>
                <span className="text-sm text-gray-600">
                  Go to page:{" "}
                  <input
                    type="number"
                    min={1}
                    max={table.getPageCount()}
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                      table.setPageIndex(page);
                    }}
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateUnitModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (data) => {
          await createUnit.mutateAsync(data);
        }}
        organizations={organizations}
      />
      {/* Edit Modal */}
      {showEdit && editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={handleEditSave}
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold mb-2">Edit Unit</h2>
            <label className="text-sm font-medium">
              Unit Name
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                value={editForm.unit_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, unit_name: e.target.value }))
                }
                required
              />
            </label>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => setShowEdit(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

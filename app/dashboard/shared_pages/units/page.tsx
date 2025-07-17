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
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useUnits, useCreateUnit } from '@/lib/queries';
import type { Unit } from '@/types/next-auth';
import { CreateUnitDto } from '@/types/next-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SkeletonOrganizationsTable, SkeletonTable } from '@/components/ui/skeleton';

// Status badge for unit status
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { className: string; dotColor: string }> = {
    ACTIVE: { className: "bg-green-100 text-green-700 border-green-200", dotColor: "bg-green-500" },
    INACTIVE: { className: "bg-gray-100 text-gray-700 border-gray-200", dotColor: "bg-gray-400" },
    PENDING: { className: "bg-yellow-100 text-yellow-700 border-yellow-200", dotColor: "bg-yellow-500" },
  };
  const config = statusConfig[status] || statusConfig.INACTIVE;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span className="capitalize">{status.toLowerCase()}</span>
    </div>
  );
};

// Create Unit Modal
function CreateUnitModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: CreateUnitDto) => void }) {
  const [form, setForm] = useState({
    unit_name: '',
    organization_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm({ unit_name: '', organization_id: '' });
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
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Create Unit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="unit_name" placeholder="Unit Name" value={form.unit_name} onChange={handleChange} required />
          <Input name="organization_id" placeholder="Organization ID" value={form.organization_id} onChange={handleChange} required />
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
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
  const router = useRouter();

  const { data, isLoading, isError } = useUnits();
  const createUnit = useCreateUnit();

  // The useUnits hook returns the units array directly after processing
  const units: Unit[] = data || [];

  // Debug log to check the structure
  console.log('Raw API data:', data);
  console.log('Extracted units:', units);

  const columns: ColumnDef<Unit>[] = [
    {
      accessorKey: "unit_name",
      header: "Unit Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.unit_name}</span>
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
      accessorKey: "organization_id",
      header: "Organization ID",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 font-mono">
          {row.original.organization_id ? row.original.organization_id.substring(0, 8) + '...' : 'N/A'}
        </span>
      ),
    },
    {
      id: "positions",
      header: "Positions",
      cell: ({ row }) => {
        const positions = row.original.positions as { position_status: string }[] || [];
        const positionsCount = positions.length;
        const activePositions = positions.filter((p) => p.position_status === 'ACTIVE').length;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{positionsCount} total</span>
            <span className="text-xs text-green-600">{activePositions} active</span>
          </div>
        );
      },
    },
    {
      id: "position_details",
      header: "Position Names",
      cell: ({ row }) => {
        const positions = row.original.positions as { position_id: string; position_name: string }[] || [];
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
              <span className="text-xs text-gray-500">+{positions.length - 2} more</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-3">
          <button
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            onClick={e => { e.stopPropagation(); toast.info('Edit not implemented'); }}
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={e => { e.stopPropagation(); toast.info('Delete not implemented'); }}
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Filtered data for search
  const filteredRows = units.filter((unit: Unit) =>
    unit.unit_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
    (unit.positions && unit.positions.some((position: { position_name: string }) =>
      position.position_name?.toLowerCase().includes(globalFilter.toLowerCase())
    ))
  );

  if (isLoading) {
    return (
    <>
<div className="overflow-x-auto">
  {isLoading ? (
    <SkeletonOrganizationsTable rows={6} />
  ) : isError ? (
    <div className="p-8 text-center text-red-500">Failed to load organizations.</div>
  ) : filteredRows.length === 0 ? (
    <div className="p-8 text-center text-gray-500">No organizations found.</div>
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
        {filteredRows.map((org) => (
          <TableRow
            key={org.organization_id}
            className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
            onClick={() => router.push(`/dashboard/shared_pages/organizations/${org.organization_id}`)}
            tabIndex={0}
            aria-label={`View details for organization ${org.organization_name}`}
          >
            {table.getAllColumns().map((col) => (
              <TableCell key={col.id} className="px-4 py-4 whitespace-nowrap text-base">
                {col.id === 'actions'
                  ? flexRender(col.columnDef.cell, {})
                  : flexRender(col.columnDef.cell, { row: { original: org } })}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={columns.length} className="text-right text-sm text-gray-500 px-4 py-3">
            {pagination && (
              <>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </>
            )}
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
    return <div className="p-8 text-center text-red-500">Failed to load units. Please try again.</div>;
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
                  Manage your Units records ({units.length} units)
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
                {globalFilter && (
                  <span className="text-sm text-gray-500">
                    {filteredRows.length} of {units.length} units
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
                    <p className="text-gray-500">Get started by creating your first unit.</p>
                  </div>
                  <Button
                    onClick={() => setShowCreate(true)}
                    className="bg-[#0872b3] hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Unit
                  </Button>
                </div>
              ) : filteredRows.length === 0 && globalFilter ? (
                <div className="p-8 text-center text-gray-500">
                  No units match your search criteria.
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
                    {table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.original.unit_id}
                        className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                        onClick={() => router.push(`/dashboard/shared_pages/units/${row.original.unit_id}`)}
                        tabIndex={0}
                        aria-label={`View details for unit ${row.original.unit_name}`}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-right text-sm text-gray-500 px-4 py-3">
                        Showing {globalFilter ? filteredRows.length : units.length} of {units.length} units
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
      <CreateUnitModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (data) => {
          await createUnit.mutateAsync(data);
        }}
      />
    </div>
  );
}
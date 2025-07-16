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
import { SkeletonTable } from '@/components/ui/skeleton';

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
      <span className="capitalize">{status}</span>
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

  const units = data || [];

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
        <span className="text-xs text-gray-500">{new Date(row.original.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "organization_id",
      header: "Organization ID",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{row.original.organization_id}</span>
      ),
    },
    {
      id: "positions",
      header: "Positions",
      cell: ({ row }) => (
        <span className="text-xs text-gray-700">{row.original.positions?.length ?? 0}</span>
      ),
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
            <Edit className="w-6 h-6" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={e => { e.stopPropagation(); toast.info('Delete not implemented'); }}
            aria-label="Delete"
          >
            <Trash2 className="w-6 h-6" />
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
  const filteredRows = units.filter(unit =>
    unit.unit_name.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Units</h1>
                <p className="text-sm text-gray-600">Manage your Units records</p>
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
            <div className="px-4 py-3 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 pr-3 py-3.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8">
                  <SkeletonTable rows={6} columns={6} />
                </div>
              ) : isError ? (
                <div className="p-8 text-center text-red-500">Failed to load units.</div>
              ) : filteredRows.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No units found.</div>
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
                        key={row.original.unit_id}
                        className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                        onClick={() => router.push(`/dashboard/shared_pages/units/${row.original.unit_id}`)}
                        tabIndex={0}
                        aria-label={`View details for unit ${row.original.unit_name}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-4 whitespace-nowrap text-base">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-right text-sm text-gray-500 px-4 py-3">
                        Showing {table.getRowModel().rows.length} units
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
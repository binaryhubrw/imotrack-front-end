"use client"
import React, { useState } from "react"
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
} from "@tanstack/react-table"
import { 
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useOrganizations, useCreateOrganization } from '@/lib/queries';
import { Organization } from '@/types/next-auth';

import { toast } from 'sonner';
import { SkeletonOrganizationsTable } from '@/components/ui/skeleton';
import Image from 'next/image';

// Status badge for organization status
const StatusBadge = ({ status }: { status: Organization["organization_status"] }) => {
  const statusConfig = {
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

// Create Organization Modal
function CreateOrganizationModal({ 
  open, 
  onClose, 
  onCreate 
}: { 
  open: boolean; 
  onClose: () => void; 
  onCreate: (data: FormData) => Promise<void>; 
}) {
  const [form, setForm] = useState({
    organization_name: '',
    organization_email: '',
    organization_phone: '',
    organization_logo: null as File | null,
    street_address: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files && files[0]) {
      setForm(f => ({ ...f, organization_logo: files[0] }));
      setLogoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validation
      if (!form.organization_name || !form.organization_email || !form.organization_phone || !form.organization_logo || !form.street_address) {
        setError('All fields are required.');
        return;
      }
      
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.organization_email)) {
        setError('Invalid email address.');
        return;
      }
      
      if (!/^\d{10,15}$/.test(form.organization_phone)) {
        setError('Phone number must be 10 to 15 digits.');
        return;
      }
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('organization_name', form.organization_name);
      formData.append('organization_email', form.organization_email);
      formData.append('organization_phone', form.organization_phone);
      formData.append('organization_logo', form.organization_logo);
      formData.append('street_address', form.street_address);
      
      await onCreate(formData);
      
      // Reset form on success
      setForm({ 
        organization_name: '', 
        organization_email: '', 
        organization_phone: '', 
        organization_logo: null, 
        street_address: '' 
      });
      setLogoPreview(null);
      onClose();
    } catch {
      setError('Failed to create organization.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-100">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" 
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-[#0872b3]">Create Organization</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 col-span-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input 
                name="organization_name" 
                value={form.organization_name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g. LoremDev" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="organization_email" 
                type="email" 
                value={form.organization_email} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="user@example.com" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                name="organization_phone" 
                value={form.organization_phone} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="10-15 digits" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input 
                name="street_address" 
                value={form.street_address} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="1234 Main St" 
              />
            </div>
          </div>
          
          <div className="space-y-4 col-span-1 flex flex-col items-center justify-center">
            <div className="w-full">
        <label className="block text-sm font-medium text-[#0872b3] mb-2 text-center">
          Organization Logo
        </label>
        <input 
          name="organization_logo" 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          required 
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0872b3]/10 file:text-[#0872b3] hover:file:bg-[#0872b3]/20 focus:outline-none focus:ring-2 focus:ring-[#0872b3] focus:ring-offset-2 transition-all duration-200" 
        />
      </div>
            
            {logoPreview && (
              <div className="mt-4 flex flex-col items-center">
                <Image 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  width={120} 
                  height={120} 
                  className="rounded-lg border border-gray-200 object-contain" 
                />
                <span className="text-xs text-gray-500 mt-2">Preview</span>
              </div>
            )}
            
            <div className="mt-8 flex-1 flex flex-col justify-end w-full">
              <button 
                type="submit" 
                className="w-full py-3 bg-[#0872b3] text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Organization'}
              </button>
              
              {error && (
                <div className="mt-4 text-red-600 text-center text-sm">{error}</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<import("@tanstack/react-table").ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const router = useRouter();

  const { data, isLoading, isError } = useOrganizations(page, limit);
  const createOrg = useCreateOrganization();

  const organizations = data?.organizations || [];
  const pagination = data?.pagination;

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "organization_name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.organization_name}</span>
      ),
    },
    {
      accessorKey: "organization_email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.organization_email}</span>
      ),
    },
    {
      accessorKey: "organization_phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.organization_phone}</span>
      ),
    },
    {
      accessorKey: "organization_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.organization_status} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{new Date(row.original.created_at).toLocaleDateString()}</span>
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

  const table = useReactTable<Organization>({
    data: organizations,
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
  const filteredRows = organizations.filter(org =>
    org.organization_name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    org.organization_email.toLowerCase().includes(globalFilter.toLowerCase())
  );

  // Handle organization creation
  const handleCreateOrganization = async (formData: FormData) => {
    await createOrg.mutateAsync(formData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Organizations</h1>
                <p className="text-sm text-gray-600">Manage your Organization records</p>
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
                
                <>
                {/* Table */}
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
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.original.organization_id}
            className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
            onClick={() => router.push(`/dashboard/shared_pages/organizations/${row.original.organization_id}`)}
            tabIndex={0}
            aria-label={`View details for organization ${row.original.organization_name}`}
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
                    {table.getRowModel().rows
                      .filter(row =>
                        row.original.organization_name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                        row.original.organization_email.toLowerCase().includes(globalFilter.toLowerCase())
                      )
                      .map((row) => (
                        <TableRow
                          key={row.original.organization_id}
                          className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                          onClick={() => router.push(`/dashboard/shared_pages/organizations/${row.original.organization_id}`)}
                          tabIndex={0}
                          aria-label={`View details for organization ${row.original.organization_name}`}
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

            {/* Pagination */}
            {pagination && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateOrganizationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateOrganization}
      />
    </div>
  )
}
"use client";
import React, { useState } from "react";
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
} from "@tanstack/react-table";
import { Download, Plus, Search, Filter, FileSpreadsheet, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
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
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
} from "@/lib/queries";
import { Organization } from "@/types/next-auth";
import { OrganizationStatusEnum } from "@/types/enums";

import { toast } from "sonner";
import { SkeletonOrganizationsTable } from "@/components/ui/skeleton";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import ErrorUI from "@/components/ErrorUI";

// Status badge for organization status
const StatusBadge = ({
  status,
}: {
  status: Organization["organization_status"];
}) => {
  const statusConfig = {
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
      <span className="capitalize">{status}</span>
    </div>
  );
};

// Create Organization Modal
function CreateOrganizationModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormData) => Promise<void>;
}) {
  const [form, setForm] = useState({
    organization_name: "",
    organization_email: "",
    organization_phone: "",
    organization_logo: null as File | null,
    street_address: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setForm((f) => ({ ...f, organization_logo: files[0] }));
      setLogoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validation
      if (
        !form.organization_name ||
        !form.organization_email ||
        !form.organization_phone ||
        !form.organization_logo
      ) {
        setError("All fields except address are required.");
        return;
      }

      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.organization_email)) {
        setError("Invalid email address.");
        return;
      }

      if (!/^\d{10,15}$/.test(form.organization_phone)) {
        setError("Phone number must be 10 to 15 digits.");
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("organization_name", form.organization_name);
      formData.append("organization_email", form.organization_email);
      formData.append("organization_phone", form.organization_phone);
      formData.append("organization_logo", form.organization_logo);
      if (form.street_address) {
        formData.append("street_address", form.street_address);
      }

      await onCreate(formData);

      // Reset form on success
      setForm({
        organization_name: "",
        organization_email: "",
        organization_phone: "",
        organization_logo: null,
        street_address: "",
      });
      setLogoPreview(null);
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-100">
        <button
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-[#0872b3]">
          Create Organization
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4 col-span-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                name="street_address"
                value={form.street_address}
                onChange={handleChange}
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
                className="w-full py-3 cursor-pointer bg-[#0872b3] text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Organization"}
              </button>

              {error && (
                <div className="mt-4 text-red-600 text-center text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<
    import("@tanstack/react-table").ColumnFiltersState
  >([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateOrg, setUpdateOrg] = useState<Organization | null>(null);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  // Call all hooks unconditionally at the top
  const { data, isLoading, isError } = useOrganizations(page, limit);
  const createOrg = useCreateOrganization();
  const updateOrgMutation = useUpdateOrganization();

  const organizations = data?.organizations || [];
  const pagination = data?.pagination;

  // Permission checks
  const canView = !!user?.position?.position_access?.organizations?.view;
  const canCreate = !!user?.position?.position_access?.organizations?.create;
  const canUpdate = !!user?.position?.position_access?.organizations?.update;

  // Define columns before useReactTable
  const columns: ColumnDef<Organization>[] = [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => {
        // Calculate the row number based on pagination
        return (
          <span className="font-mono text-gray-500">
            {(pagination ? (pagination.page - 1) * pagination.limit : 0) +
              row.index +
              1}
          </span>
        );
      },
    },
    {
      accessorKey: "organization_logo",
      header: "Logo",
      cell: ({ row }) => {
        const logo = row.original.organization_logo;
        const isValidLogo =
          logo && (logo.startsWith("http") || logo.startsWith("/"));
        return isValidLogo ? (
          <Image
            width={40}
            height={40}
            src={logo}
            alt={row.original.organization_name + " logo"}
            className="w-10 h-10 rounded object-contain bg-gray-100 border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
            N/A
          </div>
        );
      },
    },
    {
      accessorKey: "organization_customId",
      header: "Custom ID",
      cell: ({ row }) => (
        <span className="font-mono text-gray-700">
          {row.original.organization_customId || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "organization_name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 max-w-[140px] truncate block text-sm whitespace-nowrap overflow-ellipsis">
          {row.original.organization_name}
        </span>
      ),
    },
    {
      accessorKey: "organization_email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-gray-700 max-w-[180px] truncate block text-xs whitespace-nowrap overflow-ellipsis">
          {row.original.organization_email}
        </span>
      ),
    },
    {
      accessorKey: "organization_status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.organization_status} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/shared_pages/organizations/${row.original.organization_id}`}
            className="text-blue-600 font-semibold hover:underline px-2 py-1 rounded"
            onClick={e => {
              e.stopPropagation();
              router.push(`/dashboard/shared_pages/organizations/${row.original.organization_id}`);
              e.preventDefault();
            }}
            tabIndex={0}
          >
            View
          </a>
        </div>
      ),
    },
  ];

  // Call useReactTable unconditionally
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

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Check if user has any relevant permissions
  const hasAnyPermission = canView || canCreate || canUpdate;
  if (!hasAnyPermission) {
    return <NoPermissionUI resource="organizations" />;
  }

  // Filtered data for search
  const filteredRows = organizations.filter((org) => {
    const matchesSearch =
      org.organization_name
        .toLowerCase()
        .includes(globalFilter.toLowerCase()) ||
      org.organization_email.toLowerCase().includes(globalFilter.toLowerCase());
    const matchesStatus = statusFilter
      ? org.organization_status === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  // Handle organization creation
  const handleCreateOrganization = async (formData: FormData) => {
    await createOrg.mutateAsync(formData);
  };

  // Excel Export Functions
  const exportOrganizationsToExcel = async (filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    };
  }, selectedColumns: string[]) => {
    try {
      // Apply filters
      let filteredData = organizations;
      if (filters.searchTerm) {
        filteredData = filteredData.filter(org =>
          org.organization_name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          org.organization_email.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }
      if (filters.statusFilter) {
        filteredData = filteredData.filter(org => org.organization_status === filters.statusFilter);
      }
      if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
        filteredData = filteredData.filter(org => {
          const createdDate = new Date(org.created_at);
          if (filters.dateRange!.startDate && createdDate < filters.dateRange!.startDate) return false;
          if (filters.dateRange!.endDate && createdDate > filters.dateRange!.endDate) return false;
          return true;
        });
      }

      // Transform data for Excel
      const excelData = filteredData.map(org => {
        const row: Record<string, string> = {};
        selectedColumns.forEach(col => {
          switch (col) {
            case 'organization_customId':
              row['Custom ID'] = org.organization_customId || 'N/A';
              break;
            case 'organization_name':
              row['Organization Name'] = org.organization_name;
              break;
            case 'organization_email':
              row['Email'] = org.organization_email;
              break;
            case 'organization_phone':
              row['Phone'] = org.organization_phone;
              break;
            case 'organization_status':
              row['Status'] = org.organization_status.charAt(0) + org.organization_status.slice(1).toLowerCase();
              break;
            case 'street_address':
              row['Address'] = org.street_address || 'N/A';
              break;
            case 'created_at':
              row['Created Date'] = format(new Date(org.created_at), 'yyyy-MM-dd HH:mm:ss');
              break;
            case 'organization_logo':
              row['Has Logo'] = org.organization_logo ? 'Yes' : 'No';
              break;
          }
        });
        return row;
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Apply styling
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Style headers
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { type: 'pattern', patternType: 'solid', fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'middle' }
          };
        }
      }

      // Set column widths
      worksheet['!cols'] = selectedColumns.map(() => ({ wch: 20 }));

      // Add auto filter
      worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: range.e.r, c: range.e.c }
        })
      };

      // Freeze first row
      worksheet['!views'] = [{
        state: 'frozen',
        xSplit: 0,
        ySplit: 1
      }];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Organizations');

      // Generate and download file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        compression: true
      });

      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = `Organizations_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`;
      saveAs(blob, filename);

      toast.success(`Exported ${filteredData.length} organizations successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const availableColumns = [
    { key: 'organization_customId', label: 'Custom ID', default: true },
    { key: 'organization_name', label: 'Organization Name', default: true },
    { key: 'organization_email', label: 'Email', default: true },
    { key: 'organization_phone', label: 'Phone', default: true },
    { key: 'organization_status', label: 'Status', default: true },
    { key: 'street_address', label: 'Address', default: false },
    { key: 'created_at', label: 'Created Date', default: true },
    { key: 'organization_logo', label: 'Has Logo', default: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Organizations
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your Organization records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canView && (
                <button 
                  className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowExportModal(true)}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export Excel
                </button>
              )}
              {canCreate && (
                <button
                  className="flex items-center cursor-pointer gap-2 px-5 py-4 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content - Only show if user can view */}
        {canView ? (
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
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer transition">
                    <Filter className="text-gray-600" />
                    <p className="m-0">Filter By</p>
                  </span>
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
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <SkeletonOrganizationsTable rows={6} />
                ) : isError && canView ? (
                  <ErrorUI
                    resource="organizations"
                    onRetry={() => {
                      // re-fetch your data
                      router.refresh();
                    }}
                    onBack={() => {
                      router.back();
                    }}
                  />
                ) : filteredRows.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No organizations found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                        .rows.filter((row) => {
                          const matchesSearch =
                            row.original.organization_name
                              .toLowerCase()
                              .includes(globalFilter.toLowerCase()) ||
                            row.original.organization_email
                              .toLowerCase()
                              .includes(globalFilter.toLowerCase());
                          const matchesStatus = statusFilter
                            ? row.original.organization_status === statusFilter
                            : true;
                          return matchesSearch && matchesStatus;
                        })
                        .map((row) => (
                          <TableRow
                            key={row.original.organization_id}
                            className="transition-colors cursor-pointer hover:bg-blue-50 border-b border-gray-100 group"
                            onClick={() =>
                              router.push(
                                `/dashboard/shared_pages/organizations/${row.original.organization_id}`
                              )
                            }
                            tabIndex={0}
                            aria-label={`View details for organization ${row.original.organization_name}`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className={`px-2 py-3 whitespace-nowrap text-base ${cell.column.id === 'actions' ? '!cursor-default group-hover:bg-transparent' : ''}`}
                                onClick={cell.column.id === 'actions' ? e => e.stopPropagation() : undefined}
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
                          {pagination && (
                            <>
                              Showing page {pagination.page} of{" "}
                              {pagination.pages} ({filteredRows.length} shown,{" "}
                              {pagination.total} total)
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
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 cursor-pointer text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {"<<"}
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 cursor-pointer text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 cursor-pointer text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setPage(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 cursor-pointer text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {">>"}
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Page{" "}
                    <strong>
                      {pagination.page} of {pagination.pages}
                    </strong>
                  </span>
                  <span className="text-sm text-gray-600">
                    Go to page:{" "}
                    <input
                      type="number"
                      min={1}
                      max={pagination.pages}
                      defaultValue={pagination.page}
                      onChange={(e) => {
                        const page = e.target.value
                          ? Number(e.target.value)
                          : 1;
                        setPage(Math.max(1, Math.min(pagination.pages, page)));
                      }}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                  </span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={limit}
                    onChange={(e) => {
                      setPage(1);
                      setLimit(Number(e.target.value));
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
        ) : (
          // Show message when user can't view but has other permissions
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Access to View Organizations
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You don&apos;t have permission to view existing organizations,
                  but you can create new ones if you have the appropriate
                  permissions.
                </p>
                {canCreate && (
                  <button
                    className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Create New Organization
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateOrganizationModal
        open={showCreate && canCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateOrganization}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={exportOrganizationsToExcel}
          data={organizations}
          availableColumns={availableColumns}
          title="Organizations"
        />
      )}

      {/* Update Organization Modal */}
      {showUpdate && updateOrg && canUpdate && (
        <UpdateOrganizationModal
          open={showUpdate}
          onClose={() => setShowUpdate(false)}
          organization={updateOrg}
          onUpdate={async (updates) => {
            await updateOrgMutation.mutateAsync({
              organization_id: updateOrg.organization_id,
              updates,
            });
            setShowUpdate(false);
            setUpdateOrg(null);
            toast.success("Organization updated successfully!");
          }}
        />
      )}
    </div>
  );
}

// Export Modal Component
function ExportModal({
  isOpen,
  onClose,
  onExport,
  data,
  availableColumns,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    };
  }, columns: string[]) => Promise<void>;
  data: Organization[];
  availableColumns: { key: string; label: string; default?: boolean }[];
  title: string;
}) {
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: '',
    startDate: '',
    endDate: '',
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.filter(col => col.default).map(col => col.key)
  );
  const [exporting, setExporting] = useState(false);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleDeselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to export');
      return;
    }

    setExporting(true);
    try {
      const exportFilters = {
        searchTerm: filters.searchTerm || undefined,
        statusFilter: filters.statusFilter || undefined,
        dateRange: filters.startDate || filters.endDate ? {
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        } : undefined,
      };

      await onExport(exportFilters, selectedColumns);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: '',
      startDate: '',
      endDate: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export {title}</h2>
              <p className="text-sm text-gray-600">Configure your export settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={exporting}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Term</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status Filter</label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                disabled={exporting}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Columns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Columns</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  disabled={exporting}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllColumns}
                  disabled={exporting}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={column.key}
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    disabled={exporting}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={column.key}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total records:</span>
              <span className="font-semibold">{data.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Selected columns:</span>
              <span className="font-semibold">{selectedColumns.length}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={exporting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || selectedColumns.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type UpdateOrganizationModalProps = {
  open: boolean;
  onClose: () => void;
  organization: Organization;
  onUpdate: (updates: Partial<Organization>) => Promise<void>;
};

function UpdateOrganizationModal({
  open,
  onClose,
  organization,
  onUpdate,
}: UpdateOrganizationModalProps) {
  const [form, setForm] = useState({
    organization_name: organization.organization_name || "",
    organization_email: organization.organization_email || "",
    organization_phone: organization.organization_phone || "",
    organization_logo: organization.organization_logo || "",
    street_address: organization.street_address || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (
        !form.organization_name ||
        !form.organization_email ||
        !form.organization_phone
      ) {
        setError("Name, email, and phone are required.");
        setSubmitting(false);
        return;
      }
      await onUpdate(form);
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Update Organization
          </h2>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
            disabled={submitting}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              name="organization_name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.organization_name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="organization_email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.organization_email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="organization_phone"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.organization_phone}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="street_address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.street_address}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 py-2 px-4 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

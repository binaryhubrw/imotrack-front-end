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
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useUsers, useCreateUser, useUnitPositions } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

// Define the type for CreateUserDto
import type { CreateUserDto } from '@/types/next-auth';
import { SkeletonUsersTable } from "@/components/ui/skeleton";

function CreateUserModal({ open, onClose, onCreate, isLoading, unitId }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserDto) => void;
  isLoading: boolean;
  unitId: string | undefined;
}) {
  const { data: positions, isLoading: loadingPositions } = useUnitPositions(unitId || '');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    user_nid: '',
    user_phone: '',
    user_gender: 'MALE',
    user_dob: '',
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
    if (!form.user_nid.trim()) newErrors.user_nid = 'National ID is required';
    if (!form.user_phone.trim()) newErrors.user_phone = 'Phone is required';
    if (!form.user_dob) newErrors.user_dob = 'Date of birth is required';
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
        first_name: '', last_name: '', user_nid: '', user_phone: '', user_gender: 'MALE', user_dob: '', street_address: '', position_id: positions?.[0]?.position_id || '', email: '',
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      // error handled by mutation
    }
  };
  const handleClose = () => {
    setForm({
      first_name: '', last_name: '', user_nid: '', user_phone: '', user_gender: 'MALE', user_dob: '', street_address: '', position_id: positions?.[0]?.position_id || '', email: '',
    });
    setErrors({});
    setTouched({});
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors" onClick={handleClose} disabled={isLoading}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Create New User</h2>
        <form className="space-y-3" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
              <Input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} onBlur={handleBlur} className={errors.first_name && touched.first_name ? 'border-red-500' : ''} disabled={isLoading} />
              {errors.first_name && touched.first_name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <Input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} onBlur={handleBlur} className={errors.last_name && touched.last_name ? 'border-red-500' : ''} disabled={isLoading} />
              {errors.last_name && touched.last_name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.last_name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email && touched.email ? 'border-red-500' : ''} disabled={isLoading} />
            {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">National ID</label>
              <Input name="user_nid" placeholder="National ID" value={form.user_nid} onChange={handleChange} onBlur={handleBlur} className={errors.user_nid && touched.user_nid ? 'border-red-500' : ''} disabled={isLoading} />
              {errors.user_nid && touched.user_nid && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.user_nid}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <Input name="user_phone" placeholder="Phone" value={form.user_phone} onChange={handleChange} onBlur={handleBlur} className={errors.user_phone && touched.user_phone ? 'border-red-500' : ''} disabled={isLoading} />
              {errors.user_phone && touched.user_phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.user_phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select name="user_gender" value={form.user_gender} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" disabled={isLoading}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
              <Input name="user_dob" type="date" value={form.user_dob} onChange={handleChange} onBlur={handleBlur} className={errors.user_dob && touched.user_dob ? 'border-red-500' : ''} disabled={isLoading} />
              {errors.user_dob && touched.user_dob && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.user_dob}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
            <Input name="street_address" placeholder="Street address" value={form.street_address} onChange={handleChange} onBlur={handleBlur} className={errors.street_address && touched.street_address ? 'border-red-500' : ''} disabled={isLoading} />
            {errors.street_address && touched.street_address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.street_address}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
            <select name="position_id" value={form.position_id} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" disabled={isLoading || loadingPositions || !positions || positions.length === 0}>
              {loadingPositions && <option>Loading...</option>}
              {positions && positions.length > 0 ? positions.map(pos => (
                <option key={pos.position_id} value={pos.position_id}>{pos.position_name}</option>
              )) : !loadingPositions && <option value="">No positions available</option>}
            </select>
            {errors.position_id && touched.position_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.position_id}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading || loadingPositions || !positions || positions.length === 0} className="min-w-[100px]">{isLoading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const unitId = user?.unit?.unit_id;
  const { data: unitsWithUsers, isLoading, isError } = useUsers();
  const createUser = useCreateUser();

  // Flatten users for table with memoization
  const users = useMemo(() => {
    if (!unitsWithUsers) return [];
    return unitsWithUsers.flatMap(unit =>
      unit.users.map(user => ({
        ...user,
        unit_name: unit.unit_name,
        unit_id: unit.unit_id,
      }))
    );
  }, [unitsWithUsers]);

  type UserRow = typeof users[number];

  const columns: ColumnDef<UserRow>[] = useMemo(() => [
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
      accessorKey: "user_gender",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Gender</span>,
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 text-[10px] rounded-full ${row.getValue("user_gender") === "MALE" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}>{row.getValue("user_gender")}</span>
      ),
    },
    {
      accessorKey: "user_phone",
      header: () => <span className="text-xs font-semibold uppercase tracking-wider">Phone</span>,
      cell: ({ row }) => (
        <a href={`tel:${row.getValue("user_phone")}`} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">{row.getValue("user_phone")}</a>
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
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" onClick={e => { e.stopPropagation(); }} aria-label="Edit"><Edit className="w-4 h-4" /></button>
          <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" onClick={e => { e.stopPropagation(); }} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable<UserRow>({
    data: users,
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

  const handleCreateUser = async (formData: CreateUserDto) => {
    try {
      await createUser.mutateAsync(formData);
      setShowCreate(false);
    } catch (error) {
      // handled by mutation
    }
  };

  if (isLoading) {
    return (
      <SkeletonUsersTable rows={10}/>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-600">Failed to load users</p>
            <p className="text-gray-500 text-sm mt-2">An error occurred while fetching users</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your organization&apos;s users and their permissions</p>
        </div>
        <Button className="flex text-white items-center gap-2 bg-[#0872b3] hover:bg-blue-700" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search users..." value={globalFilter ?? ""} onChange={e => setGlobalFilter(e.target.value)} className="pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{table.getFilteredRowModel().rows.length} of {users.length} users</span>
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
                    <TableRow key={row.original.user_id} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-3 py-6 whitespace-nowrap text-xs text-gray-900">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="px-3 py-6 text-center text-gray-500">No users found</TableCell>
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
      {/* Create User Modal */}
      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} isLoading={createUser.isPending} onCreate={handleCreateUser} unitId={unitId} />
    </div>
  );
}
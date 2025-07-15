'use client'
import React, { useState } from "react"
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
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  Activity,
  Menu,
  Search,
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

// Reduced mock data
const mockData: Users[] = [
  {
    id: "001",
    customer: "John Doe",
    email: "john@example.com",
    amount: 2540.0,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: 1850.5,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "003",
    customer: "Mike Chen",
    email: "mike@example.com",
    amount: 750.25,
    status: "failed",
    date: "2024-01-13",
  },
  {
    id: "004",
    customer: "Emma Wilson",
    email: "emma@example.com",
    amount: 3200.0,
    status: "processing",
    date: "2024-01-12",
  },
  {
    id: "005",
    customer: "Alex Rodriguez",
    email: "alex@example.com",
    amount: 1200.75,
    status: "completed",
    date: "2024-01-11",
  },
];

type Users = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "processing";
  date: string;
};


// Compact Status Badge Component
const StatusBadge = ({ status }: { status: Users["status"] }) => {
  const statusConfig = {
    completed: { 
      icon: Check, 
      className: "bg-green-100 text-green-700 border-green-200",
      dotColor: "bg-green-500"
    },
    pending: { 
      icon: Clock, 
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      dotColor: "bg-yellow-500"
    },
    failed: { 
      icon: X, 
      className: "bg-red-100 text-red-700 border-red-200",
      dotColor: "bg-red-500"
    },
    processing: { 
      icon: Activity, 
      className: "bg-blue-100 text-blue-700 border-blue-200",
      dotColor: "bg-blue-500"
    }
  }

  const config = statusConfig[status]
  const IconComponent = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <IconComponent className="w-3 h-3" />
      <span className="capitalize">{status}</span>
    </div>
  )
}

// Sidebar Component
const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}

export default function Users() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter();

  const columns: ColumnDef<Users>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-blue-600 font-medium">
          #{row.getValue("id")}
        </div>
      ),
      size: 60,
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => {
        const customer = row.getValue("customer") as string
        const email = row.original.email
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{customer}</span>
            <span className="text-xs text-gray-500">{email}</span>
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="text-sm font-semibold text-gray-900">{formatted}</div>
      },
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      size: 120,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return <div className="text-xs text-gray-600">{date.toLocaleDateString()}</div>
      },
      size: 80,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const Users = row.original;
        return (
          <div className="flex items-center gap-3">
            <button
              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              onClick={() => console.log("Edit", Users.id)}
              aria-label="Edit"
            >
              <Edit className="w-6 h-6" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={() => console.log("Delete", Users.id)}
              aria-label="Delete"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        );
      },
      size: 120,
    },
  ]

  const table = useReactTable<Users>({
    data: mockData,
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
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Userss</h1>
                <p className="text-sm text-gray-600">Manage your Users records</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-5 py-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5" />
                Export
              </button>
              <button className="flex items-center cursor-pointer gap-2 px-5 py-4 text-sm text-white bg-[#0872b3] rounded-lg hover:bg-blue-700 transition-colors">
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
              <div className="flex items-center justify-between gap-3">
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
                  <select
                    value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                    onChange={(e) =>
                      table.getColumn("status")?.setFilterValue(e.target.value || undefined)
                    }
                    className="px-3 py-3.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="processing">Processing</option>
                  </select>
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className={`transition-colors cursor-pointer ${row.getIsSelected() ? 'bg-blue-50' : 'hover:bg-blue-50'} border-b border-gray-100`}
                        onClick={() => router.push(`/dashboard/shared_pages/Userss/${row.original.id}`)}
                        tabIndex={0}
                        aria-label={`View details for Users ${row.original.id}`}
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="px-4 py-12 text-center text-gray-500 text-lg"
                      >
                        No Userss found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-right text-sm text-gray-500 px-4 py-3">
                      Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )}{' '}
                      of {table.getFilteredRowModel().rows.length} results
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
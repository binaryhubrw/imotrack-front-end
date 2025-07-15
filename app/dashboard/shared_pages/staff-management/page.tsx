import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Search, Eye, Edit, UserX, Users } from 'lucide-react';

const fakeStaff = [
  { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@company.com', role: 'staff', status: 'active' },
  { id: '2', firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', role: 'fleetmanager', status: 'inactive' },
  { id: '3', firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@company.com', role: 'staff', status: 'active' },
];

const roleLabels = {
  staff: 'Staff',
  fleetmanager: 'Fleet Manager',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
};

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStaff, setDeleteStaff] = useState(null);

  const uniqueRoles = useMemo(() => Array.from(new Set(fakeStaff.map(u => u.role))), []);

  const filteredStaff = useMemo(() => {
    return fakeStaff.filter(staff => {
      const matchesSearch =
        staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || staff.role === filterRole;
      const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, filterRole, filterStatus]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Staff',
      cell: ({ row }: { row: { original: typeof fakeStaff[0] } }) => (
        <span>{row.original.firstName} {row.original.lastName}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: { original: typeof fakeStaff[0] } }) => (
        <span>{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: typeof fakeStaff[0] } }) => (
        <Badge variant={row.original.role === 'staff' ? 'default' : 'secondary'}>
          {roleLabels[row.original.role] || row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: typeof fakeStaff[0] } }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="text-right">Actions</span>,
      cell: ({ row }: { row: { original: typeof fakeStaff[0] } }) => (
        <div className="flex space-x-2 justify-end">
          <Button size="icon" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog open={deleteDialogOpen && deleteStaff?.id === row.original.id} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive" onClick={() => setDeleteStaff(row.original)}>
                <UserX className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the staff member{' '}
                  <span className="font-semibold">{deleteStaff?.firstName} {deleteStaff?.lastName}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteStaff && handleDelete(deleteStaff)} className="bg-red-600 hover:bg-red-700">
                  Delete Staff
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  function handleDelete(staff: typeof fakeStaff[0]) {
    // Implement delete logic here
    setDeleteDialogOpen(false);
    setDeleteStaff(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Manage and monitor all staff members</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{roleLabels[role] || role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Table */}
            <div className="border rounded-md">
              <DataTable columns={columns} data={filteredStaff} showPagination={false} showSearch={false} showFilters={false} showColumnVisibility={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

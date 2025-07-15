import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Car } from 'lucide-react';

// Fake requests data
const fakeRequests = [
  { id: '1', tripPurpose: 'Business', start: 'HQ', end: 'Branch', date: '2024-05-01', status: 'pending' },
  { id: '2', tripPurpose: 'Delivery', start: 'Warehouse', end: 'Client', date: '2024-05-03', status: 'approved' },
  { id: '3', tripPurpose: 'Meeting', start: 'Office', end: 'Hotel', date: '2024-05-05', status: 'completed' },
];

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  active: 'Active',
  completed: 'Completed',
  rejected: 'Rejected',
};

export default function VehicleRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = useMemo(() => {
    return fakeRequests.filter(request => {
      const matchesSearch =
        request.tripPurpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.start.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.end.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, filterStatus]);

  const columns = [
    {
      accessorKey: 'tripPurpose',
      header: 'Trip Purpose',
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => <span>{row.original.tripPurpose}</span>,
    },
    {
      accessorKey: 'start',
      header: 'Start',
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => <span>{row.original.start}</span>,
    },
    {
      accessorKey: 'end',
      header: 'End',
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => <span>{row.original.end}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => <span>{row.original.date}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => (
        <Badge variant={row.original.status === 'completed' ? 'default' : row.original.status === 'approved' ? 'secondary' : row.original.status === 'pending' ? 'outline' : 'secondary'}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="text-right">Actions</span>,
      cell: ({ row }: { row: { original: typeof fakeRequests[0] } }) => (
        <div className="flex space-x-2 justify-end">
          <Button size="icon" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Requests</CardTitle>
            <CardDescription>View and manage all vehicle requests</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Table */}
            <div className="border rounded-md">
              <DataTable columns={columns} data={filteredRequests} showPagination={false} showSearch={false} showFilters={false} showColumnVisibility={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react'

export default function Issue() {
  return (
    <div>
      dfghnm
    </div>
  )
}

// import React, { useState, useMemo } from 'react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { DataTable } from '@/components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, Eye, } from 'lucide-react';

// // Fake issues data
// const fakeIssues = [
//   { id: '1', vehicle: 'Toyota Corolla', plate: 'ABC-123', date: '2024-05-01', tripPurpose: 'Business', description: 'Engine noise', status: 'reported' },
//   { id: '2', vehicle: 'Honda Civic', plate: 'XYZ-789', date: '2024-05-03', tripPurpose: 'Delivery', description: 'Flat tire', status: 'in_progress' },
//   { id: '3', vehicle: 'Ford Focus', plate: 'LMN-456', date: '2024-05-05', tripPurpose: 'Meeting', description: 'Broken AC', status: 'resolved' },
// ];

// const statusLabels = {
//   reported: 'Reported',
//   in_progress: 'In Progress',
//   resolved: 'Resolved',
// };

// export default function IssueManagementPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');

//   const filteredIssues = useMemo(() => {
//     return fakeIssues.filter(issue => {
//       const matchesSearch =
//         issue.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         issue.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         issue.tripPurpose.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
//       return matchesSearch && matchesStatus;
//     });
//   }, [searchQuery, filterStatus]);

//   const columns = [
//     {
//       accessorKey: 'vehicle',
//       header: 'Vehicle',
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => (
//         <span>{row.original.vehicle} <span className="text-xs text-gray-400">({row.original.plate})</span></span>
//       ),
//     },
//     {
//       accessorKey: 'tripPurpose',
//       header: 'Trip Purpose',
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => <span>{row.original.tripPurpose}</span>,
//     },
//     {
//       accessorKey: 'description',
//       header: 'Description',
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => <span>{row.original.description}</span>,
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => (
//         <Badge variant={row.original.status === 'resolved' ? 'default' : row.original.status === 'in_progress' ? 'secondary' : 'outline'}>
//           {statusLabels[row.original.status] || row.original.status}
//         </Badge>
//       ),
//     },
//     {
//       accessorKey: 'date',
//       header: 'Date Reported',
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => <span>{row.original.date}</span>,
//     },
//     {
//       id: 'actions',
//       header: () => <span className="text-right">Actions</span>,
//       cell: ({ row }: { row: { original: typeof fakeIssues[0] } }) => (
//         <div className="flex space-x-2 justify-end">
//           <Button size="icon" variant="outline">
//             <Eye className="h-4 w-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <Card>
//           <CardHeader>
//             <CardTitle>Issue Management</CardTitle>
//             <CardDescription>View and manage reported vehicle issues</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {/* Filters */}
//             <div className="flex flex-col md:flex-row gap-4 mb-6">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//                   <Input
//                     placeholder="Search issues..."
//                     value={searchQuery}
//                     onChange={e => setSearchQuery(e.target.value)}
//                     className="pl-8"
//                   />
//                 </div>
//               </div>
//               <Select value={filterStatus} onValueChange={setFilterStatus}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="reported">Reported</SelectItem>
//                   <SelectItem value="in_progress">In Progress</SelectItem>
//                   <SelectItem value="resolved">Resolved</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {/* Table */}
//             <div className="border rounded-md">
//               <DataTable columns={columns} data={filteredIssues} showPagination={false} showSearch={false} showFilters={false} showColumnVisibility={false} />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

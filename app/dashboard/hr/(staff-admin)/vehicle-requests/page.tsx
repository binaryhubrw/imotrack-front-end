'use client'
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  ChevronDown, 
  Calendar,
  Car,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MakeNewRequestModal from '@/components/MakeNewRequestModal';

interface Request {
  id: string;
  staffName: string;
  purpose: string;
  pickupDate: string;
  returnDate: string;
  vehicleType: string;
  status: string;
  requestDate: string;
  destination: string;
  staffId: string;
}

interface NewRequestData {
  requestType: string;
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  numberOfPassengers: number;
  pickupTime: string;
  returnTime: string;
}

export default function CarRequestManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterVehicleType, setFilterVehicleType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentUserRole] = useState('Admin'); // This would come from your auth context
  const router = useRouter()
  const requestData: Request[] = [
    {
      id: 'CR001',
      staffName: 'John Smith',
      purpose: 'Field Research',
      pickupDate: '2024-04-01',
      returnDate: '2024-04-03',
      vehicleType: 'SUV',
      status: 'Pending',
      requestDate: '2024-03-25',
      destination: 'Musanze District',
      staffId: 'EMP001'
    },
    {
      id: 'CR002',
      staffName: 'Jane Doe',
      purpose: 'Conference Attendance',
      pickupDate: '2024-04-05',
      returnDate: '2024-04-06',
      vehicleType: 'Sedan',
      status: 'Approved',
      requestDate: '2024-03-20',
      destination: 'Kigali Convention Centre',
      staffId: 'EMP002'
    },
    {
      id: 'CR003',
      staffName: 'Michael Brown',
      purpose: 'Student Field Trip',
      pickupDate: '2024-05-01',
      returnDate: '2024-05-02',
      vehicleType: 'Minibus',
      status: 'Rejected',
      requestDate: '2024-03-18',
      destination: 'Nyungwe National Park',
      staffId: 'EMP005'
    },
    {
      id: 'CR004',
      staffName: 'Sarah Williams',
      purpose: 'Administrative Meeting',
      pickupDate: '2024-04-10',
      returnDate: '2024-04-10',
      vehicleType: 'Sedan',
      status: 'Pending',
      requestDate: '2024-03-28',
      destination: 'Ministry of Education',
      staffId: 'EMP004'
    }
  ];

  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];
  const vehicleTypes = ['All', 'SUV', 'Sedan', 'Minibus', 'Pickup'];

  // Permission check function
  const hasPermission = (action: string) => {
    const permissions: { [key: string]: string[] } = {
      'Admin': ['approve', 'reject', 'view', 'create'],
      'Manager': ['approve', 'reject', 'view', 'create'],
      'Transport': ['approve', 'reject', 'view'],
      'Staff': ['view', 'create']
    };
    return permissions[currentUserRole]?.includes(action) || false;
  };

  // Filter requests
  const filteredRequests = requestData.filter(request => {
    const matchesSearch = request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesVehicleType = filterVehicleType === 'All' || request.vehicleType === filterVehicleType;
    
    return matchesSearch && matchesStatus && matchesVehicleType;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    
    return `px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleApprove = (requestId: string) => {
    if (confirm('Are you sure you want to approve this request?')) {
      console.log('Approve request:', requestId);
      // Handle approve logic here
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      console.log('Reject request:', requestId);
      // Handle reject logic here
    }
  };

  const handleSubmitRequest = (requestData: NewRequestData) => {
    console.log('New request submitted:', requestData);
    // In a real application, you would send this data to your backend API
    // and then potentially refetch or update your local state
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0872B3]">Car Request Management</h1>
          </div>
          
          {hasPermission('create') && (
            <button 
              className="bg-[#0872B3] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              onClick={() => setIsModalOpen(true)} // Open the modal
            >
              <Plus className="w-5 h-5" />
              <span>New Car Request</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer hover:border-[#0872B3] focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Status' : status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Vehicle Type Filter */}
            <div className="relative">
              <select
                value={filterVehicleType}
                onChange={(e) => setFilterVehicleType(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer hover:border-[#0872B3] focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Vehicle Types' : type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
                setFilterVehicleType('All');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Request ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Staff Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Purpose</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Pickup Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Return Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Vehicle Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td 
                      className="px-6 py-4 text-sm font-medium text-[#0872B3] cursor-pointer"
                      onClick={() => router.push(`/dashboard/vehicle-requests/${request.id}`)}
                    >
                      {request.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">{request.staffName}</p>
                          <p className="text-xs text-gray-500">{request.staffId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(request.pickupDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(request.returnDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {request.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {hasPermission('view') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/vehicle-requests/${request.id}`);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        {hasPermission('approve') && request.status === 'Pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {hasPermission('reject') && request.status === 'Pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No car requests found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredRequests.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredRequests.length} of {requestData.length} requests
          </div>
        )}

        <MakeNewRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitRequest={handleSubmitRequest}
        />
      </div>
    </div>
  );
}
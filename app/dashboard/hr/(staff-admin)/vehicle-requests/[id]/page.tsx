'use client'
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  User, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';

// Define types for request data and timeline
interface RequestDetailsType {
  id: string;
  status: string;
  requestedBy: string;
  requestType: string;
  vehicleType: string;
  passengers: number;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  destination: string;
  purpose: string;
  requestDate: string;
  staffId: string;
}

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  icon: LucideIcon; // Use LucideIcon type for icons
}

export default function RequestDetails() {
  const [currentUserRole] = useState<'Admin' | 'Manager' | 'Transport' | 'Fleet Manager' | 'Staff'>('Admin'); // Explicitly type currentUserRole
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Request data - this would typically come from an API call based on the request ID
  const requestData: RequestDetailsType = {
    id: 'REC12345',
    status: 'Pending Approval',
    requestedBy: 'John Doe (HR Department)',
    requestType: 'Official Business',
    vehicleType: 'SUV',
    passengers: 4,
    pickupDate: '15/03/2024',
    pickupTime: '08:00 AM',
    returnDate: '15/03/2024',
    returnTime: '05:00 PM',
    pickupLocation: 'University of Rwanda, Kigali Campus',
    destination: 'Kigali Convention Center',
    purpose: 'Attending the annual HR conference at Kigali Convention Center. Need to transport 4 HR staff members for the event.',
    requestDate: '10/03/2024 10:30 AM',
    staffId: 'EMP001'
  };

  const timeline: TimelineItem[] = [
    {
      date: '10/03/2024 10:30 AM',
      title: 'Request Submitted',
      description: 'Request created by John Doe',
      status: 'completed',
      icon: FileText
    },
    {
      date: '14/03/2024 11:45 AM',
      title: 'Department Approval',
      description: 'Approved by HR Department Head',
      status: 'completed',
      icon: CheckCircle
    },
    {
      date: '14/03/2024 02:15 PM',
      title: 'Fleet Manager Review',
      description: 'Pending fleet manager approval',
      status: 'pending',
      icon: Clock
    }
  ];

  // Permission check function
  const hasPermission = (action: string) => {
    const permissions: { [key: string]: string[] } = {
      'Admin': ['approve', 'reject'],
      'Manager': ['approve', 'reject'],
      'Transport': ['approve', 'reject'],
      'Fleet Manager': ['approve', 'reject'],
      'Staff': []
    };
    return permissions[currentUserRole]?.includes(action) || false;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; icon: LucideIcon } } = {
      'Pending Approval': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: AlertCircle 
      },
      'Approved': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: CheckCircle 
      },
      'Rejected': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircle 
      }
    };
    
    const config = statusConfig[status] || statusConfig['Pending Approval'];
    const IconComponent = config.icon;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-4 h-4" />
        <span>{status}</span>
      </div>
    );
  };

  const getTimelineStatus = (status: 'completed' | 'pending' | 'rejected') => {
    const statusStyles: { [key: string]: string } = {
      'completed': 'bg-green-500',
      'pending': 'bg-yellow-500',
      'rejected': 'bg-red-500'
    };
    return statusStyles[status] || 'bg-gray-300';
  };

  const handleApprove = () => {
    console.log('Approve request:', requestData.id);
    setShowApprovalModal(false);
    // Handle approval logic here
  };

  const handleReject = () => {
    console.log('Reject request:', requestData.id);
    setShowRejectionModal(false);
    // Handle rejection logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/vehicle-requests" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-black">Request Details</h1>
              <p className="text-gray-600">View and manage car request information</p>
            </div>
          </div>
          
          <Link href="/dashboard/vehicle-requests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </Link>
        </div>

        {/* Vehicle Request Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Car className="w-6 h-6 text-[#0872B3]" />
                <h2 className="text-xl font-semibold text-black">Vehicle Request</h2>
              </div>
              <p className="text-gray-600">Request ID: <span className="font-medium text-[#0872B3]">{requestData.id}</span></p>
            </div>
            <div>
              {getStatusBadge(requestData.status)}
            </div>
          </div>
        </div>

        {/* Request Information & Trip Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Request Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#0872B3]" />
              <span>Request Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested By</label>
                  <p className="text-black font-medium">{requestData.requestedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Type</label>
                  <p className="text-black font-medium">{requestData.requestType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span className="text-black font-medium">{requestData.vehicleType}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Number of Passengers</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-black font-medium">{requestData.passengers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#0872B3]" />
              <span>Trip Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pickup Date & Time</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-black font-medium">{requestData.pickupDate}, {requestData.pickupTime}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Return Date & Time</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-black font-medium">{requestData.returnDate}, {requestData.returnTime}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Pickup Location</label>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-black font-medium">{requestData.pickupLocation}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Destination</label>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-black font-medium">{requestData.destination}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Purpose */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#0872B3]" />
            <span>Trip Purpose</span>
          </h3>
          <p className="text-gray-700 leading-relaxed">{requestData.purpose}</p>
        </div>

        {/* Request Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-black mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#0872B3]" />
            <span>Request Timeline</span>
          </h3>
          
          <div className="space-y-6">
            {timeline.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTimelineStatus(item.status)}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-black">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {hasPermission('approve') && requestData.status === 'Pending Approval' && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button 
              onClick={() => setShowRejectionModal(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Close</span>
            </button>
            <button 
              onClick={() => setShowApprovalModal(true)}
              className="bg-[#0872B3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Approve Request</span>
            </button>
            <button 
              onClick={() => setShowRejectionModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reject Request</span>
            </button>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-black mb-4">Approve Request</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to approve this car request?</p>
              <div className="flex space-x-3 justify-end">
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApprove}
                  className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-black mb-4">Reject Request</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this request:</p>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
                rows="4"
                placeholder="Enter rejection reason..."
              ></textarea>
              <div className="flex space-x-3 justify-end">
                <button 
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
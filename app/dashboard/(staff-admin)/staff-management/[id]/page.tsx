'use client';
import React, { JSX, useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Car,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- Types ---
type UserRole = 'Admin' | 'Manager' | 'HR' | 'Staff';

type StaffStatus = 'Active' | 'Inactive' | 'On Leave';

interface StaffData {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  status: StaffStatus;
  joinDate: string;
  profileImage: string | null;
}

interface VehicleAccess {
  authorizedTypes: string[];
  maxPassengers: number;
  lastRequest: string;
  totalRequests: number;
}

// --- Component ---
export default function StaffDetails() {
  const [currentUserRole] = useState<UserRole>('Admin');

  const staffData: StaffData = {
    id: 'UR2345',
    name: 'John Doe',
    position: 'HR Manager',
    department: 'Human Resources',
    email: 'john.doe@ur.ac.rw',
    phone: '+250 788 123 456',
    dateOfBirth: '15/05/1985',
    address: '123 University Avenue, Kigali',
    emergencyContact: 'Jane Doe (+250 788 789 012)',
    status: 'Active',
    joinDate: '2020-03-15',
    profileImage: null
  };

  const vehicleAccess: VehicleAccess = {
    authorizedTypes: ['Sedan', 'SUV'],
    maxPassengers: 4,
    lastRequest: '15/03/2024',
    totalRequests: 5
  };

  // Permissions
  const hasPermission = (action: 'edit' | 'delete' | 'deactivate'): boolean => {
    const permissions: Record<UserRole, string[]> = {
      Admin: ['edit', 'delete', 'deactivate'],
      Manager: ['edit'],
      HR: ['edit', 'deactivate'],
      Staff: []
    };
    return permissions[currentUserRole]?.includes(action) ?? false;
  };

  const getStatusBadge = (status: StaffStatus): JSX.Element => {
    const statusConfig: Record<StaffStatus, {
      bg: string;
      text: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = {
      Active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle
      },
      Inactive: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle
      },
      'On Leave': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: AlertCircle
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-4 h-4" />
        <span>{status}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/staff-management" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-black">Staff Details</h1>
              <p className="text-gray-600">View and manage staff information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasPermission('edit') && (
              <Link href={`/dashboard/staff-management/${staffData.id}/edit`}>
                <button className="bg-[#0872B3] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Edit User</span>
                </button>
              </Link>
            )}
            
            
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Image */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              {staffData.profileImage ? (
                <Image 
                  src={staffData.profileImage} 
                  alt={staffData.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-[#0872B3] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {staffData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-2">{staffData.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{staffData.position}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#0872B3] font-medium">Staff ID: {staffData.id}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    {getStatusBadge(staffData.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#0872B3]" />
              <span>Personal Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-black font-medium">{staffData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-black font-medium">{staffData.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-black font-medium">{staffData.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-black font-medium flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{staffData.dateOfBirth}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-[#0872B3]" />
              <span>Contact Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-black font-medium flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${staffData.email}`} className="text-[#0872B3] hover:underline">
                    {staffData.email}
                  </a>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-black font-medium flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${staffData.phone}`} className="text-[#0872B3] hover:underline">
                    {staffData.phone}
                  </a>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-black font-medium flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{staffData.address}</span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                <p className="text-black font-medium">{staffData.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Access & Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Access */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <Car className="w-5 h-5 text-[#0872B3]" />
              <span>Vehicle Access</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Authorized Vehicle Types</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {vehicleAccess.authorizedTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Maximum Passengers</label>
                  <p className="text-black font-medium flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{vehicleAccess.maxPassengers}</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Vehicle Request</label>
                  <p className="text-black font-medium flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{vehicleAccess.lastRequest}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Requests (Last 30 Days)</label>
                  <p className="text-black font-medium">{vehicleAccess.totalRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-[#0872B3]" />
              <span>Employment Details</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Join Date</label>
                <p className="text-black font-medium flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(staffData.joinDate).toLocaleDateString('en-GB')}</span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Employment Status</label>
                <div className="mt-1">
                  {getStatusBadge(staffData.status)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Years of Service</label>
                <p className="text-black font-medium">
                  {Math.floor((new Date() - new Date(staffData.joinDate)) / (365.25 * 24 * 60 * 60 * 1000))} years
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons for Mobile */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 md:hidden">
          {hasPermission('edit') && (
            <Link href={`/dashboard/staff/${staffData.id}/edit`} className="flex-1">
              <button className="w-full bg-[#0872B3] hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit User</span>
              </button>
            </Link>
          )}
          
          {hasPermission('delete') && (
            <button 
              onClick={() => {
                if (confirm(`Are you sure you want to deactivate ${staffData.name}?`)) {
                  console.log('Deactivate user');
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Deactivate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
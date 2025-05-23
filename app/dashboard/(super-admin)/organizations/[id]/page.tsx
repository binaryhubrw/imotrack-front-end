'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, BadgeCheck } from 'lucide-react';

const id = 'UN-202';
// Dummy data – in a real app, fetch this by ID
const ORGANIZATIONS = [
  { 
    id: 'UN-202', 
    name: 'University of Rwanda', 
    email: 'ur@ur.rw', 
    phone: '+250-790-323-567', 
    status: 'Active', 
    address: 'Kigali, Nyarugenge',
    admin: { name: 'Pacifique Uwamarie', email: 'pacifique@ur.rw', phone: '+250-788-900-500' }
  },
  { 
    id: 'UD-201', 
    name: 'Union Dartment', 
    email: 'info@ud.com', 
    phone: '+250-790-323-567', 
    status: 'Active', 
    address: 'Butare',
    admin: { name: 'Jean Hakizimana', email: 'jean@ud.com', phone: '+250-788-123-456' }
  },
  { 
    id: 'US-KA2', 
    name: 'Unite Security', 
    email: 'info@us.com', 
    phone: '+250-790-323-567', 
    status: 'Active', 
    address: 'Rusizi',
    admin: { name: 'Sarah Mukamana', email: 'sarah@us.com', phone: '+250-788-789-012' }
  },
];

function statusBadge(status) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1';
  switch (status) {
    case 'Active':
      return <span className={base + ' bg-green-100 text-green-700'}><BadgeCheck className="w-4 h-4" />Active</span>;
    case 'Inactive':
      return <span className={base + ' bg-red-100 text-red-700'}>Inactive</span>;
    default:
      return <span className={base + ' bg-gray-200 text-gray-700'}>{status}</span>;
  }
}

export default function OrganizationIdPage() {
  const router = useRouter();
  const org = ORGANIZATIONS.find(o => o.id === id);

  if (!org) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Organization not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#0872B3] text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-10 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0872B3] px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:bg-[#065a8e] rounded-full p-2 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">Organization Details</h1>
        </div>
        {/* Main Info */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-7 h-7 text-[#0872B3]" />
              <span className="text-2xl font-bold text-gray-900">{org.name}</span>
            </div>
            <div className="text-sm text-gray-500 font-mono">ID: {org.id}</div>
            <div className="mt-2">{statusBadge(org.status)}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Mail className="w-4 h-4 mr-1" />Email</div>
              <div className="font-medium text-gray-900">{org.email}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Phone className="w-4 h-4 mr-1" />Phone</div>
              <div className="font-medium text-gray-900">{org.phone}</div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center text-sm text-gray-500 mb-1"><MapPin className="w-4 h-4 mr-1" />Address</div>
              <div className="font-medium text-gray-900">{org.address}</div>
            </div>
          </div>
          {/* Admin Info */}
          {org.admin && (
            <div className="mt-8">
              <div className="text-lg font-semibold text-[#0872B3] mb-3">Admin Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Name</div>
                  <div className="font-medium text-gray-900">{org.admin.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-gray-900">{org.admin.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phone</div>
                  <div className="font-medium text-gray-900">{org.admin.phone}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

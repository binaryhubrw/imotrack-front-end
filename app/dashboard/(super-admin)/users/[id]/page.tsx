'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, User2, Calendar, BadgeCheck, MapPin, IdCard, UserCircle2 } from 'lucide-react';

const USER = {
  id: '2058',
  firstName: 'Pacifique',
  lastName: 'Uwamarie',
  email: 'pacifique@ur.ac.rw',
  organization: 'University of Rwanda',
  role: 'Admin',
  dob: '1992-03-14',
  phone: '+250-788-900-500',
  status: 'Active',
  gender: 'Female',
  nid: '1199220034567890',
  streetAddress: 'KG 11 Ave, Kigali',
  startDate: '2022-01-10',
  avatar: 'https://randomuser.me/api/portraits/women/68.jpg', // Example avatar
};

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

export default function SingleUserStaticPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f2fa] to-[#f9fafb] px-4 py-10 flex items-center justify-center">
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
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">User Profile</h1>
        </div>
        {/* Profile Section */}
        <div className="flex flex-col items-center -mt-12 mb-6 px-8">
          <div className="rounded-full border-4 border-white shadow-lg bg-gray-100 w-28 h-28 flex items-center justify-center overflow-hidden">
            {USER.avatar ? (
              <img src={USER.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-20 h-20 text-gray-300" />
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-gray-900">{USER.firstName} {USER.lastName}</div>
            <div className="text-sm text-gray-500">{USER.role} at {USER.organization}</div>
            <div className="mt-2">{statusBadge(USER.status)}</div>
          </div>
        </div>
        {/* Details Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Mail className="w-4 h-4 mr-1" />Email</div>
              <div className="font-medium text-gray-900">{USER.email}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Phone className="w-4 h-4 mr-1" />Phone</div>
              <div className="font-medium text-gray-900">{USER.phone}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><IdCard className="w-4 h-4 mr-1" />NID</div>
              <div className="font-medium text-gray-900">{USER.nid}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><User2 className="w-4 h-4 mr-1" />Gender</div>
              <div className="font-medium text-gray-900">{USER.gender}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Building2 className="w-4 h-4 mr-1" />Organization</div>
              <div className="font-medium text-gray-900">{USER.organization}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><User2 className="w-4 h-4 mr-1" />Role</div>
              <div className="font-medium text-gray-900">{USER.role}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Calendar className="w-4 h-4 mr-1" />Date of Birth</div>
              <div className="font-medium text-gray-900">{USER.dob}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1"><Calendar className="w-4 h-4 mr-1" />Start Date</div>
              <div className="font-medium text-gray-900">{USER.startDate}</div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center text-sm text-gray-500 mb-1"><MapPin className="w-4 h-4 mr-1" />Address</div>
              <div className="font-medium text-gray-900">{USER.streetAddress}</div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">User ID</div>
              <div className="font-mono text-gray-700">{USER.id}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

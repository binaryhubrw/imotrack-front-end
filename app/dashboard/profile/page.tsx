'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserDetails } from '@/lib/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faBuilding, 
  faShieldAlt,
  faPhone,
  faCalendarAlt,
  faIdCard,
  faVenusMars,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';



export default function HRProfilePage() {
  const { user: authUser } = useAuth();
  const { data: userDetails, isLoading, error } = useUserDetails(authUser?.id || '');

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Not authenticated</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0872b3]"></div>
      </div>
    );
  }

  if (error) {
    console.error('Profile loading error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading profile: {error.message}</div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Basic profile items (from auth token)
  const basicItems = [
    {
      icon: faUser,
      label: 'User ID',
      value: authUser.id,
    },
    {
      icon: faEnvelope,
      label: 'Email',
      value: authUser.email,
    },
    {
      icon: faShieldAlt,
      label: 'Role',
      value: authUser.role,
    },
    {
      icon: faBuilding,
      label: 'Organization ID',
      value: authUser.organization_id,
    },
  ];

  // Extended profile items (from users API)
  const extendedItems = userDetails ? [
    {
      icon: faUser,
      label: 'Full Name',
      value: `${userDetails.first_name} ${userDetails.last_name}`,
    },
    {
      icon: faPhone,
      label: 'Phone',
      value: userDetails.phone || 'N/A',
    },
    {
      icon: faCalendarAlt,
      label: 'Date of Birth',
      value: formatDate(userDetails.dob),
    },
    {
      icon: faIdCard,
      label: 'NID',
      value: userDetails.nid,
    },
    {
      icon: faVenusMars,
      label: 'Gender',
      value: userDetails.gender,
    },
    {
      icon: faMapMarkerAlt,
      label: 'Address',
      value: userDetails.street_address,
    },
  ] : [];

  // HR-specific fields (if available)
  const hrFields = userDetails && authUser.role === 'hr' ? [
    {
      icon: faShieldAlt,
      label: 'Staff Status',
      value: userDetails.status || 'Active',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        {/* Profile content will go here */}
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </div>
        <div className="mt-8 flex justify-center">
          <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
            Active
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium text-gray-800">john.doe@company.com</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Phone</div>
            <div className="font-medium text-gray-800">+250 788 123 456</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date of Birth</div>
            <div className="font-medium text-gray-800">15/05/1985</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">NID</div>
            <div className="font-medium text-gray-800">1234567890123456</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Gender</div>
            <div className="font-medium text-gray-800">Male</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Address</div>
            <div className="font-medium text-gray-800">123 Main St, Kigali</div>
          </div>
        </div>
      </div>
    </div>
  );
}

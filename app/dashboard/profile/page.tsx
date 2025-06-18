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



export default function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 bg-[#0872b3] text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium">Profile Information</h3>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full capitalize">
                {authUser.role}
              </div>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-white/80">
              Personal details and account information
            </p>
          </div>

          {/* Profile Content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {/* Basic Items */}
              {basicItems.map((item, index) => (
                <div key={index} className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={item.icon} /> {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              ))}

              {/* Extended Items */}
              {extendedItems.map((item, index) => (
                <div key={index} className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={item.icon} /> {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

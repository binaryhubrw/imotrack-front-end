'use client'

import { useUserDetails } from '@/lib/queries';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faBuilding,
  faShieldAlt,
  faIdCard,
  faCalendarAlt,
  faVenusMars,
  faMapMarkerAlt,
  faArrowLeft,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';
import EditUserForm from '../EditUserForm';
import { CheckCircle } from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: user, isLoading, error } = useUserDetails(params.id as string);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0872b3]"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading user details</div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const profileItems = [
    {
      icon: faUser,
      label: 'Full Name',
      value: `${user.first_name} ${user.last_name}`,
    },
    {
      icon: faEnvelope,
      label: 'Email',
      value: user.email,
    },
    {
      icon: faPhone,
      label: 'Phone',
      value: user.phone || 'N/A',
    },
    {
      icon: faBuilding,
      label: 'Organization',
      value: user.organization_id || 'N/A',
    },
    {
      icon: faShieldAlt,
      label: 'Role',
      value: user.role_id || 'N/A',
    },
    {
      icon: faCalendarAlt,
      label: 'Date of Birth',
      value: formatDate(user.dob),
    },
    {
      icon: faIdCard,
      label: 'NID',
      value: user.nid,
    },
    {
      icon: faVenusMars,
      label: 'Gender',
      value: user.gender,
    },
    {
      icon: faMapMarkerAlt,
      label: 'Address',
      value: user.street_address,
    },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-[#0872b3] hover:text-[#065d8f]"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <Button className="bg-[#0872b3] text-white hover:bg-[#065d8f]" onClick={() => setShowEditModal(true)}>
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit User
          </Button>
        </div>
        {/* Edit User Modal */}
        {showEditModal && (
          <EditUserForm
            userId={user.id}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              setShowEditSuccessModal(true);
              setTimeout(() => setShowEditSuccessModal(false), 2500);
            }}
          />
        )}
        {/* Edit Success Modal */}
        {showEditSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col items-center"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">User updated successfully!</h2>
              <p className="text-gray-600 text-center">The user information has been updated.<br/>Thank you for keeping your records up to date.</p>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">User Details</h1>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {user.status}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-[#0872b3] text-xl">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-lg text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

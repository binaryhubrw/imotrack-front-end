import React from 'react'

export default function AddUserForm() {
  return (
    <div>
      fd
    </div>
  )
}


// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faUser,
//   faEnvelope,
//   faPhone,
//   faIdCard,
//   faCalendarAlt,
//   faVenusMars,
//   faMapMarkerAlt,
//   faBuilding,
//   faShieldAlt,
//   faTimes,
//   faSpinner,
// } from '@fortawesome/free-solid-svg-icons';
// import { useCreateUser, useRoles } from '@/lib/queries';
// import { toast } from 'sonner';
// import { AxiosError } from 'axios';
// import { Organization, CreateUserDto } from '@/types/next-auth';

// interface AddUserFormProps {
//   onClose: () => void;
//   organizations: Organization[];
// }

// export default function AddUserForm({ onClose, organizations }: AddUserFormProps) {
//   const createUser = useCreateUser();
//   const { data: roles } = useRoles();
//   const [formData, setFormData] = useState<CreateUserDto>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     nid: '',
//     gender: 'Male',
//     dob: '',
//     role: '',
//     organizationId: '',
//     streetAddress: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
//     if (!formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//     }
//     if (!formData.nid.trim()) {
//       newErrors.nid = 'National ID is required';
//     }
//     if (!formData.dob.trim()) {
//       newErrors.dob = 'Date of birth is required';
//     }
//     if (!formData.role.trim()) {
//       newErrors.role = 'Role is required';
//     }
//     if (!formData.organizationId.trim()) {
//       newErrors.organizationId = 'Organization is required';
//     }
//     if (!formData.streetAddress.trim()) {
//       newErrors.streetAddress = 'Street address is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     try {
//       await createUser.mutateAsync(formData);
      
//       toast.success('User created successfully');
//       onClose();
//     } catch (error) {
//       console.error('Create user error:', error);
//       if (error instanceof AxiosError) {
//         toast.error(error.response?.data?.message || 'Failed to create user');
//       } else {
//         toast.error('Failed to create user');
//       }
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
//       >
//         {/* Header */}
//         <div className="bg-[#0872b3] text-white p-6 sticky top-0 z-10">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold">Create New User</h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
//             >
//               <FontAwesomeIcon icon={faTimes} />
//             </button>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* First Name */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faUser} className="mr-2 text-[#0872b3]" />
//                 First Name *
//               </label>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.firstName ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.firstName && (
//                 <p className="text-sm text-red-500">{errors.firstName}</p>
//               )}
//             </div>

//             {/* Last Name */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faUser} className="mr-2 text-[#0872b3]" />
//                 Last Name *
//               </label>
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.lastName ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.lastName && (
//                 <p className="text-sm text-red-500">{errors.lastName}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-[#0872b3]" />
//                 Email *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.email ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-500">{errors.email}</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faPhone} className="mr-2 text-[#0872b3]" />
//                 Phone *
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 placeholder="+250788000111"
//                 className={`w-full px-4 py-2 border ${
//                   errors.phone ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.phone && (
//                 <p className="text-sm text-red-500">{errors.phone}</p>
//               )}
//             </div>

//             {/* National ID */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faIdCard} className="mr-2 text-[#0872b3]" />
//                 National ID *
//               </label>
//               <input
//                 type="text"
//                 name="nid"
//                 value={formData.nid}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.nid ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.nid && (
//                 <p className="text-sm text-red-500">{errors.nid}</p>
//               )}
//             </div>

//             {/* Gender */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-[#0872b3]" />
//                 Gender *
//               </label>
//               <select
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.gender ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               >
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//               {errors.gender && (
//                 <p className="text-sm text-red-500">{errors.gender}</p>
//               )}
//             </div>

//             {/* Date of Birth */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#0872b3]" />
//                 Date of Birth *
//               </label>
//               <input
//                 type="date"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.dob ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.dob && (
//                 <p className="text-sm text-red-500">{errors.dob}</p>
//               )}
//             </div>

//             {/* Role */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-[#0872b3]" />
//                 Role *
//               </label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.role ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               >
//                 <option value="">Select Role</option>
//                 {roles?.map((role: any) => (
//                   <option key={role.id} value={role.id}>
//                     {role.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.role && (
//                 <p className="text-sm text-red-500">{errors.role}</p>
//               )}
//             </div>

//             {/* Organization */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faBuilding} className="mr-2 text-[#0872b3]" />
//                 Organization *
//               </label>
//               <select
//                 name="organizationId"
//                 value={formData.organizationId}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-2 border ${
//                   errors.organizationId ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               >
//                 <option value="">Select Organization</option>
//                 {organizations.map((org) => (
//                   <option key={org.id} value={org.id}>
//                     {org.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.organizationId && (
//                 <p className="text-sm text-red-500">{errors.organizationId}</p>
//               )}
//             </div>

//             {/* Street Address */}
//             <div className="col-span-2 space-y-2">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#0872b3]" />
//                 Street Address *
//               </label>
//               <input
//                 type="text"
//                 name="streetAddress"
//                 value={formData.streetAddress}
//                 onChange={handleChange}
//                 placeholder="KG 541 St, Kigali"
//                 className={`w-full px-4 py-2 border ${
//                   errors.streetAddress ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:ring-2 focus:ring-[#0872b3] focus:border-transparent`}
//               />
//               {errors.streetAddress && (
//                 <p className="text-sm text-red-500">{errors.streetAddress}</p>
//               )}
//             </div>
//           </div>

//           {/* Submit Buttons */}
//           <div className="mt-8 flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={createUser.isPending}
//               className="px-6 py-2 bg-[#0872b3] text-white rounded-lg hover:bg-[#065d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               {createUser.isPending ? (
//                 <>
//                   <FontAwesomeIcon icon={faSpinner} spin />
//                   Creating...
//                 </>
//               ) : (
//                 'Create User'
//               )}
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }
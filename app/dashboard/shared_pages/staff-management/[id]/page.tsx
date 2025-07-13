import React from 'react'

export default function ReqMan() {
  return (
    <div>
      ertg
    </div>
  )
}


// 'use client';
// import { useRouter, useParams } from 'next/navigation';
// import { useHrUser } from '@/lib/queries';


// export default function StaffDetails() {
//   const router = useRouter();
//   const params = useParams();
//   const userId = params?.id as string;
//   const { data: user, isLoading, isError } = useHrUser(userId);

//   // Status badge
//   const getStatusBadge = (status: string) => {
//     const statusStyles: Record<string, string> = {
//       active: 'bg-green-100 text-green-800',
//       inactive: 'bg-red-100 text-red-800',
//       suspended: 'bg-yellow-100 text-yellow-800',
//     };
//     return (
//       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
//     );
//   };

//   if (isLoading) {
//     return <div className="min-h-screen flex items-center justify-center">
//         <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//         <span className="ml-4 text-gray-600"></span>
//     </div>;
//   }
//   if (isError || !user) {
//     return <div className="min-h-screen flex items-center justify-center text-red-600">User not found</div>;
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-0 overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b px-6 py-4">
//           <h1 className="text-xl font-bold text-gray-900">Staff Details</h1>
//           <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
//             <span className="sr-only">Close</span>
//             &times;
//           </button>
//         </div>
//         {/* Profile */}
//         <div className="flex flex-col items-center py-6">
//           <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
//             <span className="text-3xl text-gray-500 font-bold">{user.firstName[0]}{user.lastName[0]}</span>
//           </div>
//           <div className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
//           <div className="text-sm text-gray-500">Staff ID: {user.id}</div>
//           <div className="mt-2">{getStatusBadge(user.status)}</div>
//         </div>
//         <hr />
//         {/* Personal Information */}
//         <div className="px-6 py-4">
//           <h2 className="text-md font-semibold text-gray-800 mb-2">Personal Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <div>
//               <div className="text-gray-500">Full Name</div>
//               <div className="text-gray-900 font-medium">{user.firstName} {user.lastName}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Email</div>
//               <div className="text-gray-900 font-medium">{user.email}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Phone Number</div>
//               <div className="text-gray-900 font-medium">{user.phone}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Gender</div>
//               <div className="text-gray-900 font-medium">{user.gender}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Date of Birth</div>
//               <div className="text-gray-900 font-medium">{user.dob}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">National ID</div>
//               <div className="text-gray-900 font-medium">{user.nid}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Role</div>
//               <div className="text-gray-900 font-medium">{user.role}</div>
//             </div>
//             <div>
//               <div className="text-gray-500">Organization</div>
//               <div className="text-gray-900 font-medium">{user.organizationName}</div>
//             </div>
//           </div>
//         </div>
//         <hr />
//         {/* Additional Information */}
//         <div className="px-6 py-4">
//           <h2 className="text-md font-semibold text-gray-800 mb-2">Additional Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <div>
//               <div className="text-gray-500">Street Address</div>
//               <div className="text-gray-900 font-medium">{user.streetAddress}</div>
//             </div>
//             {/* Add more fields as needed */}
//           </div>
//         </div>
//         <hr />
//         {/* Actions */}
//         <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
//           <button onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Close</button>
//           <button onClick={() => router.push(`/dashboard/hr/staff-management/${user.id}/edit`)} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Edit User</button>
//           <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Deactivate User</button>
//         </div>
//       </div>
//     </div>
//   );
// }
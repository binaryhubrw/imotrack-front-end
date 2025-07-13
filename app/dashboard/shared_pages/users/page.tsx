import React from 'react'

export default function Uzsa() {
  return (
    <div>er
      
    </div>
  )
}


// 'use client';

// import { useState } from 'react';
// import { useUsers, useDeleteUser, useOrganizations } from '@/lib/queries';
// import { UserListItem } from '@/types/next-auth';
// import AddUserForm from './AddUserForm';
// import EditUserForm from './EditUserForm';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faUserPlus,
//   faSearch,
//   faFilter,
//   faEdit,
//   faTrash,
//   faEye,
//   faExclamationTriangle,
// } from '@fortawesome/free-solid-svg-icons';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function UsersPage() {
//   const { data: users, isLoading } = useUsers();
//   const { data: organizations } = useOrganizations();
//   const deleteUser = useDeleteUser();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedRole, setSelectedRole] = useState<string>('all');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//   const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; userId: string | null }>({
//     isOpen: false,
//     userId: null,
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0872b3]"></div>
//       </div>
//     );
//   }

//   const filteredUsers = (users as unknown as UserListItem[])?.filter((user: UserListItem) => {
//     if (!user) return false;
    
//     const searchTermLower = searchTerm.toLowerCase();
//     const matchesSearch = 
//       (user.firstName?.toLowerCase() || '').includes(searchTermLower) ||
//       (user.lastName?.toLowerCase() || '').includes(searchTermLower) ||
//       (user.email?.toLowerCase() || '').includes(searchTermLower) ||
//       (user.orgName?.toLowerCase() || '').includes(searchTermLower);
    
//     const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
//     return matchesSearch && matchesRole;
//   }) || [];

//   const handleDelete = async (id: string) => {
//     setDeleteConfirmModal({ isOpen: true, userId: id });
//   };

//   const confirmDelete = async () => {
//     if (!deleteConfirmModal.userId) return;
    
//     try {
//       await deleteUser.mutateAsync(deleteConfirmModal.userId);
//       setDeleteConfirmModal({ isOpen: false, userId: null });
//     } catch (error: unknown) {
//       console.error('Delete error:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
//           <h1 className="text-2xl font-bold text-[#0872b3]">Users Management</h1>
//           <Button 
//             className="bg-[#0872b3] text-white hover:bg-[#065d8f] w-full sm:w-auto"
//             onClick={() => setIsAddModalOpen(true)}
//           >
//             <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
//             Add New User
//           </Button>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 min-w-0">
//               <div className="relative">
//                 <FontAwesomeIcon
//                   icon={faSearch}
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search users..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0872b3] focus:border-transparent text-sm"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="w-full md:w-48">
//               <div className="relative">
//                 <FontAwesomeIcon
//                   icon={faFilter}
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 />
//                 <select
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0872b3] focus:border-transparent appearance-none text-sm"
//                   value={selectedRole}
//                   onChange={(e) => setSelectedRole(e.target.value)}
//                 >
//                   <option value="all">All Roles</option>
//                   <option value="admin">Admin</option>
//                   <option value="hr">HR</option>
//                   <option value="fleetmanager">Fleet Manager</option>
//                   <option value="staff">Staff</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Users Table */}
//         <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//           <div className="min-w-[600px]">
//             <table className="min-w-full divide-y divide-gray-200 text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Organization</th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
//                   <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredUsers.map((user: UserListItem) => (
//                   <motion.tr
//                     key={user.id}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="hover:bg-gray-50"
//                   >
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-10 w-10 bg-[#0872b3] rounded-full flex items-center justify-center text-white">
//                           {user.firstName?.[0] || ''}
//                           {user.lastName?.[0] || ''}
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {user.firstName} {user.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">{user.phone}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{user.email}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{user.orgName}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                         {user.role}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           user.status === 'active'
//                             ? 'bg-green-100 text-green-800'
//                             : user.status === 'inactive'
//                             ? 'bg-red-100 text-red-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {user.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex justify-end space-x-2">
//                         <Link
//                           href={`/dashboard/admin/users/${user.id}`}
//                           className="text-[#0872b3] hover:text-[#065d8f] transition duration-200 hover:scale-110 hover:translate-x-1"
//                         >
//                           <FontAwesomeIcon icon={faEye} />
//                         </Link>
//                         <button
//                           onClick={() => setSelectedUserId(user.id)}
//                           className="text-[#0872b3] hover:text-[#065d8f] transition duration-200 hover:scale-110 hover:translate-x-1"
//                         >
//                           <FontAwesomeIcon icon={faEdit} />
//                         </button>
//                         <button
//                           className="text-red-600 hover:text-red-900 transition duration-200 hover:scale-110 hover:translate-x-1"
//                           onClick={() => handleDelete(user.id)}
//                         >
//                           <FontAwesomeIcon icon={faTrash} />
//                         </button>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Empty State */}
//           {filteredUsers.length === 0 && !isLoading && (
//             <div className="text-center py-12">
//               <div className="text-gray-500 text-lg mb-2">No users found</div>
//               <div className="text-gray-400 text-sm">
//                 {searchTerm || selectedRole !== 'all' 
//                   ? 'Try adjusting your search or filter criteria'
//                   : 'Get started by adding your first user'
//                 }
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Add User Modal */}
//       {isAddModalOpen && (
//         <AddUserForm
//           onClose={() => setIsAddModalOpen(false)}
//           organizations={organizations || []}
//         />
//       )}

//       {/* Edit User Modal */}
//       {selectedUserId && (
//         <EditUserForm
//           userId={selectedUserId}
//           onClose={() => setSelectedUserId(null)}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {deleteConfirmModal.isOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
//             >
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="p-3 bg-red-100 rounded-full">
//                   <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">Delete User</h3>
//               </div>
              
//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete this user? This action cannot be undone.
//               </p>

//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null })}
//                   className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDelete}
//                   disabled={deleteUser.isPending}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                 >
//                   {deleteUser.isPending ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Deleting...
//                     </>
//                   ) : (
//                     'Delete User'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
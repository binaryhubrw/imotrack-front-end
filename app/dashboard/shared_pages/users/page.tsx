import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Using basic table structure instead of shadcn table
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Fake data
const fakeUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    orgName: 'Tech Corp',
    role: 'admin',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1234567891',
    orgName: 'Tech Corp',
    role: 'hr',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@logistics.com',
    phone: '+1234567892',
    orgName: 'Logistics Ltd',
    role: 'fleetmanager',
    status: 'inactive'
  },
  {
    id: '4',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@company.com',
    phone: '+1234567893',
    orgName: 'Tech Corp',
    role: 'staff',
    status: 'active'
  },
  {
    id: '5',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@transport.com',
    phone: '+1234567894',
    orgName: 'Transport Inc',
    role: 'fleetmanager',
    status: 'pending'
  },
  {
    id: '6',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+1234567895',
    orgName: 'Tech Corp',
    role: 'hr',
    status: 'active'
  }
];


export default function UsersPage() {
  const [users] = useState(fakeUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({
    isOpen: false,
    userId: null,
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTermLower) ||
        user.lastName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.orgName.toLowerCase().includes(searchTermLower);
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleDelete = (id: string) => {
    setDeleteConfirmModal({ isOpen: true, userId: id });
  };

  const confirmDelete = () => {
    console.log('Deleting user:', deleteConfirmModal.userId);
    setDeleteConfirmModal({ isOpen: false, userId: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'fleetmanager':
        return 'bg-indigo-100 text-indigo-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Users Management</h1>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="fleetmanager">Fleet Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.orgName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserId(user.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No users found</div>
              <div className="text-gray-400 text-sm">
                {searchTerm || selectedRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first user'
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the form below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">Add user form would go here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">Edit user form would go here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUserId(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedUserId(null)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmModal.isOpen} onOpenChange={(open) => 
        setDeleteConfirmModal({ isOpen: open, userId: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
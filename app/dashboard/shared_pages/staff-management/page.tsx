import React from 'react'

export default function SRM() {
  return (
    <div>
      df
    </div>
  )
}


// "use client";
// import React, { useState } from "react";
// import {
//   Plus,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Search,
//   ChevronDown,
//   Users,
//   X,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import {
//   useHrUsers,
//   useHrRoles,
//   useCreateHrUser,
//   useUpdateHrUser,
//   useDeleteHrUser,
//   useHrUser,
// } from "@/lib/queries";
// import {
//   CreateHrUserDto,
//   HrRole,
//   HrUser,
//   UpdateHrUserDto,
// } from "@/types/next-auth";

// export default function StaffManagement() {
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filterRole, setFilterRole] = useState<string>("All");
//   const [filterStatus, setFilterStatus] = useState<string>("All");
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingUserId, setEditingUserId] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [userToDelete, setUserToDelete] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   const [formData, setFormData] = useState<CreateHrUserDto>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     nid: "",
//     gender: "MALE",
//     dob: "",
//     streetAddress: "",
//     roleId: "",
//   });

//   const router = useRouter();

//   // API hooks
//   const { data: hrUsers = [], isError, refetch } = useHrUsers();
//   const { data: hrRoles = [] } = useHrRoles();
//   const createUserMutation = useCreateHrUser();
//   const updateUserMutation = useUpdateHrUser();
//   const deleteUserMutation = useDeleteHrUser();
//   const { data: editingUserData, isLoading } = useHrUser(editingUserId || "");

//   const statuses: string[] = ["All", "active", "inactive"];
//   const roles = ["All", ...hrRoles.map((role: HrRole) => role.name)];

//   const filteredStaff = hrUsers.filter((user: HrUser) => {
//     const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
//     const matchesSearch =
//       fullName.includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.nid.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesRole = filterRole === "All" || user.role === filterRole;
//     const matchesStatus =
//       filterStatus === "All" || user.status === filterStatus;

//     return matchesSearch && matchesRole && matchesStatus;
//   });

//   const getStatusBadge = (status: string): string => {
//     const statusStyles: Record<string, string> = {
//       active: "bg-green-100 text-green-800",
//       inactive: "bg-red-100 text-red-800",
//     };
//     return `px-3 py-1 rounded-full text-xs font-medium ${
//       statusStyles[status] || "bg-gray-100 text-gray-800"
//     }`;
//   };

//   const getRoleBadge = (role: string): string => {
//     const roleStyles: Record<string, string> = {
//       staff: "bg-blue-100 text-blue-800",
//       fleetmanager: "bg-purple-100 text-purple-800",
//     };
//     return `px-3 py-1 rounded-full text-xs font-medium ${
//       roleStyles[role] || "bg-gray-100 text-gray-800"
//     }`;
//   };

//   // When entering edit mode, prefill form
//   React.useEffect(() => {
//     if (isEditMode && editingUserId && editingUserData) {
//       setFormData({
//         firstName: editingUserData.firstName,
//         lastName: editingUserData.lastName,
//         email: editingUserData.email,
//         phone: editingUserData.phone,
//         nid: editingUserData.nid,
//         gender: editingUserData.gender,
//         dob: editingUserData.dob,
//         streetAddress: editingUserData.streetAddress,
//         roleId: editingUserData.roleId,
//       });
//     }
//     if (!isEditMode) {
//       setFormData({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phone: "",
//         nid: "",
//         gender: "MALE",
//         dob: "",
//         streetAddress: "",
//         roleId: "",
//       });
//     }
//   }, [isEditMode, editingUserId, editingUserData]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (isEditMode && editingUserId) {
//         await updateUserMutation.mutateAsync({
//           id: editingUserId,
//           updates: formData as UpdateHrUserDto,
//         });
//       } else {
//         await createUserMutation.mutateAsync(formData);
//       }
//       setIsModalOpen(false);
//       setIsEditMode(false);
//       setEditingUserId(null);
//       setFormData({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phone: "",
//         nid: "",
//         gender: "MALE",
//         dob: "",
//         streetAddress: "",
//         roleId: "",
//       });
//       refetch();
//     } catch (error) {
//       console.error("Error saving user:", error);
//     }
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Staff Management
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Manage and monitor all staff members
//             </p>
//           </div>

//           <button
//             className="bg-[#0872B3] hover:bg-[0872C1] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
//             onClick={() => {
//               setIsModalOpen(true);
//               setIsEditMode(false);
//               setEditingUserId(null);
//             }}
//           >
//             <Plus className="w-5 h-5" />
//             <span>Add Staff</span>
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <Users className="w-6 h-6 text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Total Staff</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {hrUsers.length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                 <Users className="w-6 h-6 text-green-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">
//                   Active Staff
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {
//                     hrUsers.filter((user: HrUser) => user.status === "active")
//                       .length
//                   }
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                 <Users className="w-6 h-6 text-purple-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">
//                   Fleet Managers
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {
//                     hrUsers.filter(
//                       (user: HrUser) => user.role === "fleetmanager"
//                     ).length
//                   }
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search staff..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
//               />
//             </div>

//             {/* Role Filter */}
//             <div className="relative">
//               <select
//                 value={filterRole}
//                 onChange={(e) => setFilterRole(e.target.value)}
//                 className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
//               >
//                 {roles.map((role) => (
//                   <option key={role} value={role}>
//                     {role === "All"
//                       ? "All Roles"
//                       : role.charAt(0).toUpperCase() + role.slice(1)}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>

//             {/* Status Filter */}
//             <div className="relative">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
//               >
//                 {statuses.map((status) => (
//                   <option key={status} value={status}>
//                     {status === "All"
//                       ? "All Status"
//                       : status.charAt(0).toUpperCase() + status.slice(1)}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>

//             {/* Clear Filters */}
//             <button
//               onClick={() => {
//                 setSearchTerm("");
//                 setFilterRole("All");
//                 setFilterStatus("All");
//               }}
//               className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
//             >
//               <Filter className="w-4 h-4" />
//               <span>Clear</span>
//             </button>
//           </div>
//         </div>

//         {/* Staff Table */}
//         <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//           {isLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               <span className="ml-2">Loading staff...</span>
//             </div>
//           ) : isError ? (
//             <div className="text-center py-12">
//               <p className="text-red-600">Error loading staff data</p>
//               <button
//                 onClick={() => refetch()}
//                 className="mt-2 text-blue-600 hover:underline"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Name
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Email
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Phone
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       NID
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Role
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredStaff.map((user: HrUser) => (
//                     <tr
//                       key={user.id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-6 py-4">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {user.firstName} {user.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {user.organizationName}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {user.email}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {user.phone}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {user.nid}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={getRoleBadge(user.role)}>
//                           {user.role === "fleetmanager"
//                             ? "Fleet Manager"
//                             : "Staff"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={getStatusBadge(user.status)}>
//                           {user.status.charAt(0).toUpperCase() +
//                             user.status.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() =>
//                               router.push(
//                                 `/dashboard/hr/staff-management/${user.id}`
//                               )
//                             }
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="View Details"
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>

//                           <button
//                             onClick={() => {
//                               setIsEditMode(true);
//                               setEditingUserId(user.id);
//                               setIsModalOpen(true);
//                             }}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                             title="Edit Staff"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>

//                           <button
//                             onClick={() => {
//                               setUserToDelete({
//                                 id: user.id,
//                                 name: `${user.firstName} ${user.lastName}`,
//                               });
//                               setIsDeleteModalOpen(true);
//                             }}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete Staff"
//                             disabled={deleteUserMutation.isPending}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Empty State */}
//           {!isLoading && !isError && filteredStaff.length === 0 && (
//             <div className="text-center py-12">
//               <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//               <p className="text-lg font-medium text-gray-900">
//                 No staff members found
//               </p>
//               <p className="text-sm text-gray-500">
//                 Try adjusting your search or filter criteria
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Results Summary */}
//         {!isLoading && filteredStaff.length > 0 && (
//           <div className="mt-4 text-sm text-gray-600">
//             Showing {filteredStaff.length} of {hrUsers.length} staff members
//           </div>
//         )}

//         {/* Add/Edit Staff Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-white/70 backdrop-blur-sm">
//             <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
//               <div className="flex items-center justify-between p-6 border-b">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setIsModalOpen(false);
//                     setIsEditMode(false);
//                     setEditingUserId(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone *
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       required
//                       placeholder="+250788123456"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       National ID *
//                     </label>
//                     <input
//                       type="text"
//                       name="nid"
//                       value={formData.nid}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Gender *
//                     </label>
//                     <select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     >
//                       <option value="MALE">Male</option>
//                       <option value="FEMALE">Female</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Date of Birth *
//                     </label>
//                     <input
//                       type="date"
//                       name="dob"
//                       value={formData.dob}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Role *
//                     </label>
//                     <select
//                       name="roleId"
//                       value={formData.roleId}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     >
//                       <option value="">Select Role</option>
//                       {hrRoles.map((role: HrRole) => (
//                         <option key={role.id} value={role.id}>
//                           {role.name === "fleetmanager"
//                             ? "Fleet Manager"
//                             : role.name.charAt(0).toUpperCase() +
//                               role.name.slice(1)}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     name="streetAddress"
//                     value={formData.streetAddress}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="KN 7 Ave, Kigali"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setIsModalOpen(false);
//                       setIsEditMode(false);
//                       setEditingUserId(null);
//                     }}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={
//                       createUserMutation.isPending ||
//                       updateUserMutation.isPending
//                     }
//                     className="px-4 py-2 bg-[#0872B3] hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {createUserMutation.isPending ||
//                     updateUserMutation.isPending
//                       ? isEditMode
//                         ? "Updating..."
//                         : "Adding..."
//                       : isEditMode
//                       ? "Update Staff Member"
//                       : "Add Staff Member"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {isDeleteModalOpen && userToDelete && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="p-3 bg-red-100 rounded-full">
//                   <Trash2 className="text-red-600 text-xl w-6 h-6" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">Delete Staff Member</h3>
//               </div>
//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
//               </p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setIsDeleteModalOpen(false)}
//                   className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                   disabled={deleteUserMutation.isPending}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={async () => {
//                     try {
//                       await deleteUserMutation.mutateAsync(userToDelete.id);
//                       refetch();
//                       setIsDeleteModalOpen(false);
//                       setUserToDelete(null);
//                     } catch (error) {
//                       console.error("Error deleting user:", error);
//                     }
//                   }}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                   disabled={deleteUserMutation.isPending}
//                 >
//                   {deleteUserMutation.isPending ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Deleting...
//                     </>
//                   ) : (
//                     'Delete'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

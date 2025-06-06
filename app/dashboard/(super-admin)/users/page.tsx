'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';


const USERS = [
  { id: '2058', firstName: 'Pacifique', lastName: 'Uwamarie', email: 'pacifique@ur.ac.rw', organization: 'University of Rwanda', role: 'Admin', dob: '1992', phone: '+250-788-900-500', status: 'Active' },
  // Add more placeholder user data here
  { id: '2059', firstName: 'Jean', lastName: 'Hakizimana', email: 'jean@uniondart.com', organization: 'Union Dartment', role: 'Staff', dob: '1995', phone: '+250-788-123-456', status: 'Active' },
  { id: '2060', firstName: 'Sarah', lastName: 'Mukamana', email: 'sarah@unitesecurity.com', organization: 'Unite Security', role: 'Admin', dob: '1990', phone: '+250-788-789-012', status: 'Active' },
];

function statusBadge(status: string) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (status) {
    case 'Active':
      return <span className={base + ' bg-green-400 text-white'}>Active</span>;
    case 'Inactive':
      return <span className={base + ' bg-red-400 text-white'}>Inactive</span>;
    default:
      return <span className={base + ' bg-gray-200 text-gray-700'}>{status}</span>;
  }
}

export default function AddUserStaffPage() {
  const [users, setUsers] = useState(USERS);
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const handleDeleteClick = (id: string) => {
    setSelectedUserId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter(user => user.id !== selectedUserId));
    setShowDeleteConfirm(false);
    setSelectedUserId(null);
  };

  const handleAddClick = () => {
    setCurrentUser(null);
    setShowAddModal(true);
  };

  const handleEditClick = (user: any) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = (userData: any) => {
    if (userData.id) {
      // Edit existing user
      setUsers(users.map(user => user.id === userData.id ? userData : user));
      setShowEditModal(false);
    } else {
      // Add new user
      const newUser = { ...userData, id: `${Date.now().toString().slice(-4)}` }; // Simple ID generation
      setUsers([...users, newUser]);
      setShowAddModal(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (!statusFilter || user.status === statusFilter) &&
    (!roleFilter || user.role === roleFilter) &&
    (!nameFilter || user.firstName.toLowerCase().includes(nameFilter.toLowerCase()) || user.lastName.toLowerCase().includes(nameFilter.toLowerCase()))
    // Note: Date of birth filter is not implemented yet as it requires date comparisons
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">Organization Users</h1>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#0872B3] text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add New user
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
            >
              <option value="">All Time</option>
              {/* Add time filter options if needed */}
            </select>
             <select
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All role</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              {/* Add other role options as needed */}
            </select>
            <input
              type="text"
              placeholder="Name"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-2 text-left font-semibold">User Id</th>
                <th className="px-4 py-2 text-left font-semibold">First Name</th>
                <th className="px-4 py-2 text-left font-semibold">Last Name</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-left font-semibold">Organization</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">DOB</th>
                <th className="px-4 py-2 text-left font-semibold">Phone</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr onClick={() => router.push(`/dashboard/users/${user.id}`)} key={user.id} className={idx % 2 === 0 ? 'bg-white cursor-pointer' : 'bg-gray-50 cursor-pointer '}>
                  <td className="px-4 py-2 font-mono">{user.id}</td>
                  <td className="px-4 py-2">{user.firstName}</td>
                  <td className="px-4 py-2">{user.lastName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.organization}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.dob}</td>
                  <td className="px-4 py-2">{user.phone}</td>
                  <td className="px-4 py-2">{statusBadge(user.status)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      onClick={e => { e.stopPropagation(); handleEditClick(user); }}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="Edit" 
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); handleDeleteClick(user.id); }}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="Delete" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <UserModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <UserModal 
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveUser}
          user={currentUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUserId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white/90 backdrop-blur-md rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 my-8 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0872B3]">Confirm Delete</h2>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-8">
              <p className="text-gray-600 text-lg">Are you sure you want to delete user <span className="font-semibold text-gray-900">{selectedUserId}</span>? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded shadow hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 text-sm font-medium text-white bg-[#0872B3] rounded shadow hover:bg-blue-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

// User Modal Component (for Add and Edit)
function UserModal({ onClose, onSave, user }: { onClose: () => void; onSave: (user: any) => void; user?: any }) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nid: user?.nid || '',
    gender: user?.gender || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    role: user?.role || '',
    startDate: user?.startDate || '',
    password: user?.password || '',
    streetAddress: user?.streetAddress || '',
    dob: user?.dob || '',
    status: user?.status || 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.nid || !formData.gender || !formData.email || !formData.phone || !formData.organization || !formData.role || !formData.startDate || !formData.password) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md rounded-xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 my-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8 pb-2">
          <h2 className="text-2xl font-bold text-[#0872B3]">{user ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NID <span className="text-red-500">*</span></label>
              <input type="text" name="nid" value={formData.nid} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
              <input type="text" name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Organization <span className="text-red-500">*</span></label>
              <select name="organization" value={formData.organization} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required>
                 <option value="">Select Organization</option>
                 {/* Populate with organizations */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Role <span className="text-red-500">*</span></label>
               <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required>
                <option value="">Select Role of User</option>
                {/* Populate with roles */}
               </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
              <input type="text" name="startDate" value={formData.startDate} onChange={handleChange} placeholder="mm/dd/yyyy" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DOB</label>
              <input type="text" name="dob" value={formData.dob} onChange={handleChange} placeholder="mm/dd/yyyy" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded shadow hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-[#0872B3] rounded shadow hover:bg-blue-700 transition-colors"
            >
              {user ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
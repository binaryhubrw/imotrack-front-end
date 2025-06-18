/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from '@/lib/queries';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '@/types/next-auth';
import { toast } from 'sonner';

export default function OrganizationsPage() {
  const { data: organizations, isLoading: isLoadingOrganizations, isError: isErrorOrganizations, error: organizationsError } = useOrganizations();
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const router = useRouter();

  const handleDeleteClick = (id: string) => {
    setSelectedOrgId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrgId) return;
    try {
      await deleteOrganizationMutation.mutateAsync(selectedOrgId);
      toast.success('Organization deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedOrgId(null);
    } catch (error: any) {
      console.error('Failed to delete organization:', error);
      toast.error(error.message || 'Failed to delete organization.');
    }
  };

  const handleAddClick = () => {
    setCurrentOrganization(null);
    setShowAddModal(true);
  };

  const handleEditClick = (org: Organization) => {
    setCurrentOrganization(org);
    setShowEditModal(true);
  };

  const handleSaveOrganization = async (orgData: CreateOrganizationDto | (UpdateOrganizationDto & { id: string })) => {
    try {
      if ('id' in orgData && orgData.id) {
        // Update existing organization
        const { id, ...updates } = orgData;
        await updateOrganizationMutation.mutateAsync({ id, updates });
        toast.success('Organization updated successfully!');
        setShowEditModal(false);
      } else {
        // Create new organization
        await createOrganizationMutation.mutateAsync(orgData as CreateOrganizationDto);
        toast.success('Organization created successfully!');
        setShowAddModal(false);
      }
    } catch (error: any) {
      console.error('Failed to save organization:', error);
      toast.error(error.message || 'Failed to save organization.');
    }
  };

  const filteredOrganizations = organizations?.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoadingOrganizations) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0872B3]" />
      </div>
    );
  }

  if (isErrorOrganizations) {
    return (
      <div className="flex h-full items-center justify-center text-red-600">
        Error loading organizations: {organizationsError?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#0872B3] to-blue-600 bg-clip-text text-transparent">
            Organizations
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-64 rounded-lg border border-gray-200 px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white/80 backdrop-blur-sm transition-all duration-200 group-hover:bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0872B3] to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Organization
            </motion.button>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr className="text-gray-600">
                  <th className="px-6 py-5 text-left font-semibold">ID</th>
                  <th className="px-6 py-5 text-left font-semibold">Name</th>
                  <th className="px-6 py-5 text-left font-semibold">Email</th>
                  <th className="px-6 py-5 text-left font-semibold">Phone</th>
                  <th className="px-6 py-5 text-left font-semibold">Address</th>
                  <th className="px-6 py-5 text-left font-semibold">Status</th>
                  <th className="px-6 py-5 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((org, idx) => (
                    <motion.tr 
                      onClick={() => router.push(`/dashboard/admin/organizations/${org.id}`)}
                      key={org.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-gray-50/50 cursor-pointer transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-mono text-gray-600">{org.customId}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                      <td className="px-6 py-4 text-gray-600">{org.email}</td>
                      <td className="px-6 py-4 text-gray-600">{org.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{org.address}</td>
                      <td className="px-6 py-4 text-gray-600">{org.status}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={e => { e.stopPropagation(); handleEditClick(org); }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" 
                            aria-label="Edit" 
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={e => { e.stopPropagation(); handleDeleteClick(org.id); }}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" 
                            aria-label="Delete" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {/* Add Organization Modal */}
        {showAddModal && (
          <OrganizationModal 
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveOrganization}
            isLoading={createOrganizationMutation.isPending}
          />
        )}

        {/* Edit Organization Modal */}
        {showEditModal && currentOrganization && (
          <OrganizationModal 
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveOrganization}
            organization={currentOrganization}
            isLoading={updateOrganizationMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedOrgId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 my-12"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-[#0872B3]">Confirm Delete</h2>
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-8">
                <p className="text-gray-600 text-lg">Are you sure you want to delete organization <span className="font-semibold text-gray-900">{selectedOrgId}</span>? This action cannot be undone.</p>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConfirm}
                  disabled={deleteOrganizationMutation.isPending}
                  className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {deleteOrganizationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Organization Modal Component (for Add and Edit)
function OrganizationModal({
  onClose,
  onSave,
  organization,
  isLoading
}: {
  onClose: () => void;
  onSave: (org: CreateOrganizationDto | (UpdateOrganizationDto & { id: string })) => void;
  organization?: Organization;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateOrganizationDto | UpdateOrganizationDto & { id?: string }>(
    organization ? 
      { id: organization.id, name: organization.name, email: organization.email, phone: organization.phone, address: organization.address } :
      { name: '', email: '', phone: '', address: '' } 
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CreateOrganizationDto | (UpdateOrganizationDto & { id: string }));
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
      className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-6 md:my-12 overflow-y-auto max-h-[90vh]"
    >
      <div className="flex justify-between items-center mb-8 pb-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {organization ? 'Edit organization' : 'Add organization'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872B3]" 
              required 
            />
          </div>
        </div>
  
        {/* Organization Admin Section - Removed as it's not part of CreateOrganizationDto/UpdateOrganizationDto for now */}
        {/* Note: Admin creation might be a separate API call or handled implicitly on organization creation */}
        
        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded shadow hover:bg-red-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-[#0872B3] rounded shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : organization ? 'Edit' : 'Save'}
          </button>
        </div>
      </form>
    </motion.div>
  </motion.div>
  );
}
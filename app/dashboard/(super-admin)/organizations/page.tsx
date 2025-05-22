'use client';
import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';

const ORGANIZATIONS = [
  { id: 'UN-202', name: 'University of Rwanda', email: 'ur@ur.rw', phone: '+250-790-323-567', status: 'Active', address: 'Kigali,Nyarugenge' },
  { id: 'UD-202', name: 'Union Dartment', email: 'info@ud.com', phone: '+250-790-323-567', status: 'Active', address: 'Butare' },
  { id: 'US-KA2', name: 'Unite Security', email: 'info@us.com', phone: '+250-790-323-567', status: 'Active', address: 'Rusizi' },
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

export default function AddOrganizationPage() {
  const [organizations, setOrganizations] = useState(ORGANIZATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedOrgId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setOrganizations(organizations.filter(org => org.id !== selectedOrgId));
    setShowDeleteConfirm(false);
    setSelectedOrgId(null);
  };

  const handleAddClick = () => {
    setCurrentOrganization(null);
    setShowAddModal(true);
  };

  const handleEditClick = (org: any) => {
    setCurrentOrganization(org);
    setShowEditModal(true);
  };

  const handleSaveOrganization = (orgData: any) => {
    if (orgData.id) {
      // Edit existing organization
      setOrganizations(organizations.map(org => org.id === orgData.id ? orgData : org));
      setShowEditModal(false);
    } else {
      // Add new organization
      const newOrg = { ...orgData, id: `ORG-${Date.now().toString().slice(-4)}` }; // Simple ID generation
      setOrganizations([...organizations, newOrg]);
      setShowAddModal(false);
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#e6f2fa] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0872B3]">Organizations</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search organizations"
                className="rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0872B3] bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#0872B3] text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add organisations
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-2 text-left font-semibold">Organization ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-left font-semibold">Phone</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Adress</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org, idx) => (
                <tr key={org.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 font-mono">{org.id}</td>
                  <td className="px-4 py-2">{org.name}</td>
                  <td className="px-4 py-2">{org.email}</td>
                  <td className="px-4 py-2">{org.phone}</td>
                  <td className="px-4 py-2">{statusBadge(org.status)}</td>
                  <td className="px-4 py-2">{org.address}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      onClick={() => handleEditClick(org)}
                      className="p-1 rounded hover:bg-gray-100" 
                      aria-label="Edit" 
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(org.id)}
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

      {/* Add Organization Modal */}
      {showAddModal && (
        <OrganizationModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveOrganization}
        />
      )}

      {/* Edit Organization Modal */}
      {showEditModal && currentOrganization && (
        <OrganizationModal 
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveOrganization}
          organization={currentOrganization}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedOrgId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#0872B3]">Confirm Delete</h2>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete organization {selectedOrgId}? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Organization Modal Component (for Add and Edit)
function OrganizationModal({ onClose, onSave, organization }: { onClose: () => void; onSave: (org: any) => void; organization?: any }) {
  const [formData, setFormData] = useState({
    id: organization?.id || '',
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
    status: organization?.status || 'Active', // Default status
    address: organization?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0872B3]" >{organization ? 'Edit Organization' : 'Add Organization'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0872B3] focus:ring-[#0872B3]">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0872B3] rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
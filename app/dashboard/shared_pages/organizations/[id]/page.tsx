'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Loader2, Edit3, Trash2, X } from 'lucide-react';
import { useOrganization, useDeleteOrganization, useOrganizationUnits, useUpdateOrganization } from '@/lib/queries';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SkeletonEntityDetails } from '@/components/ui/skeleton';

export default function OrganizationIdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Fetch organization details
  const { data: org, isLoading, isError, error, refetch } = useOrganization(id);
  // Prepare delete, update, and units hooks
  const deleteOrganization = useDeleteOrganization();
  const updateOrganization = useUpdateOrganization();
  const { data: units, isLoading: unitsLoading } = useOrganizationUnits();
  
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    organization_name: '',
    organization_email: '',
    organization_phone: '',
    organization_logo: '',
    street_address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!org) return;
    setEditForm({
      organization_name: org.organization_name || '',
      organization_email: org.organization_email || '',
      organization_phone: org.organization_phone || '',
      organization_logo: org.organization_logo || '',
      street_address: org.street_address || '',
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateOrganization.mutateAsync({
        organization_id: id,
        updates: editForm,
      });
      setShowEdit(false);
      refetch();
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteOrganization.mutateAsync({ organization_id: id });
      setShowDeleteConfirm(false);
      router.back();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError('Failed to delete organization.');
      }
      setDeleting(false);
    }
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEdit(false);
        setShowDeleteConfirm(false);
      }
    };

    if (showEdit || showDeleteConfirm) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showEdit, showDeleteConfirm]);

  if (isLoading) {
    return (
        <SkeletonEntityDetails/>
    )
  }

  if (isError) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-red-600">
        <p className="text-lg">Error loading organization: {error?.message || 'Unknown error'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#0872B3] text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>
    );
  }

  if (!org) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Organization not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#0872B3] text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-10 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0872B3] to-blue-600 px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide flex-1">
            Organization Details
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Info */}
        <div className="px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-8 h-8 text-[#0872B3]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{org.organization_name}</h2>
                <div className="text-sm text-gray-500 font-mono">ID: {org.organization_id}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Custom ID</div>
                <div className="font-medium text-gray-900">{org.organization_customId || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                <div className="font-medium text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    String(org.organization_status) === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {org.organization_status}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Created</div>
                <div className="font-medium text-gray-900">
                  {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-[#0872B3] mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-gray-900">{org.organization_email || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-[#0872B3] mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Phone</div>
                  <div className="text-gray-900">{org.organization_phone || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-[#0872B3] mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">{org.street_address || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 mt-0.5 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#0872B3]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Logo</div>
                  <div className="mt-2">
                    {org.organization_logo ? (
                      <Image 
                        width={48} 
                        height={48} 
                        src={org.organization_logo} 
                        alt="Logo" 
                        className="h-12 w-12 object-contain bg-white rounded-lg border border-gray-200" 
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Units List */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0872B3]" />
              Units
            </h3>
            {unitsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading units...
              </div>
            ) : units && units.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {units.map(unit => (
                  <div key={unit.unit_id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="font-medium text-gray-900">{unit.unit_name}</div>
                    <div className="text-sm text-gray-500">ID: {unit.unit_id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No units found for this organization.</div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit Organization</h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleEditSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.organization_name}
                    onChange={e => setEditForm(f => ({ ...f, organization_name: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.organization_email}
                    onChange={e => setEditForm(f => ({ ...f, organization_email: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.organization_phone}
                    onChange={e => setEditForm(f => ({ ...f, organization_phone: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.organization_logo}
                    onChange={e => setEditForm(f => ({ ...f, organization_logo: e.target.value }))}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.street_address}
                    onChange={e => setEditForm(f => ({ ...f, street_address: e.target.value }))}
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowEdit(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Organization</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{org.organization_name}</strong>? 
                  This action cannot be undone.
                </p>
                {deleteError && (
                  <div className="mb-4 text-red-600 text-sm">{deleteError}</div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
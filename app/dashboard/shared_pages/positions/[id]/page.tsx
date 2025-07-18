'use client'

import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { usePosition, useUpdatePosition } from '@/lib/queries';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SkeletonEntityDetails } from '@/components/ui/skeleton';

// Helper type guard
function isUserWithAuth(user: unknown): user is { first_name: string; last_name: string; auth: { email?: string } } {
  return (
    typeof user === 'object' &&
    user !== null &&
    'auth' in user &&
    typeof (user as { auth?: unknown }).auth === 'object' &&
    (user as { auth?: unknown }).auth !== null
  );
}

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: position, isLoading, isError, refetch } = usePosition(id);
  const updatePosition = useUpdatePosition();
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    position_name: '',
    position_description: '',
    position_status: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Open edit modal and prefill form
  const handleEdit = () => {
    if (!position) return;
    setEditForm({
      position_name: position.position_name || '',
      position_description: position.position_description || '',
      position_status: position.position_status || '',
    });
    setShowEdit(true);
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePosition.mutateAsync({
        position_id: id,
        updates: editForm,
      });
      setShowEdit(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <SkeletonEntityDetails/>
    )
        
  }
  if (isError || !position) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-red-500">Error loading position details</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" className="text-[#0872b3] hover:text-[#065d8f]" onClick={() => router.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
          <Button className="bg-[#0872b3] text-white hover:bg-[#065d8f]" onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Position
          </Button>
        </div>
        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <form
              onSubmit={handleEditSave}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold mb-2">Edit Position</h2>
              <label className="text-sm font-medium">Position Name
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.position_name}
                  onChange={e => setEditForm(f => ({ ...f, position_name: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium">Description
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.position_description}
                  onChange={e => setEditForm(f => ({ ...f, position_description: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium">Status
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={editForm.position_status}
                  onChange={e => setEditForm(f => ({ ...f, position_status: e.target.value }))}
                  required
                />
              </label>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEdit(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#0872b3] text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Position Details</h1>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {position.position_status}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Position ID</div>
                <div className="font-medium text-gray-900">{position.position_id}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Position Name</div>
                <div className="font-medium text-gray-900">{position.position_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Description</div>
                <div className="font-medium text-gray-900">{position.position_description}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="font-medium text-gray-900">{position.position_status}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Created At</div>
                <div className="font-medium text-gray-900">{position.created_at ? new Date(position.created_at).toLocaleString() : 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Unit ID</div>
                <div className="font-medium text-gray-900">{position.unit_id}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase">Assigned User</div>
                <div className="font-medium text-gray-900">
                  {position.user ? (
                    <>
                      {position.user.first_name} {position.user.last_name}
                      {isUserWithAuth(position.user) && position.user.auth.email ? (
                        <span className="text-gray-500"> ({position.user.auth.email})</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
            {/* Permissions List */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">Permissions</h2>
              {position.position_access && typeof position.position_access === 'object' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(position.position_access as Record<string, Record<string, boolean>>).map(([module, perms]) => {
                    const activePerms = Object.entries(perms).filter(([, val]) => val);
                    if (activePerms.length === 0) return null;
                    return (
                      <div key={module} className="bg-blue-50 rounded p-2 border border-blue-100">
                        <div className="font-semibold text-blue-700 mb-1 capitalize">{module}</div>
                        <div className="flex flex-wrap gap-1">
                          {activePerms.map(([perm]) => (
                            <span key={perm} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Briefcase, Clock, Pencil, X, Trash2, Save } from 'lucide-react';
import { useStaffRequest, useUpdateStaffRequest, useCancelStaffRequest } from '@/lib/queries';
import type { StaffRequestStatus, StaffRequestUpdate } from '@/types/next-auth';

function statusBadge(status: StaffRequestStatus) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
  switch (status) {
    case "PENDING":
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    case "APPROVED":
      return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
    case "ACTIVE":
      return <span className={`${base} bg-purple-100 text-purple-800`}>Active</span>;
    case "COMPLETED":
      return <span className={`${base} bg-blue-100 text-blue-800`}>Completed</span>;
    case "REJECTED":
      return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
    default:
      return <span className={base}>{status}</span>;
  }
}

export default function VehicleRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: request, isLoading, isError } = useStaffRequest(id);
  const updateRequest = useUpdateStaffRequest();
  const cancelRequest = useCancelStaffRequest();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<StaffRequestUpdate>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => router.back();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (isError || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-6">The vehicle request with ID {id} could not be found.</p>
          <button 
            onClick={goBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Edit form handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === 'passengers_number' ? Number(value) : value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      await updateRequest.mutateAsync({ id: request.id, updates: editForm });
      setEditMode(false);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await cancelRequest.mutateAsync(request.id);
      setShowCancelModal(false);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  // Only allow editing/cancelling if pending
  const canEditOrCancel = request.status === 'PENDING';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Requests</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{request.trip_purpose}</h1>
                <p className="text-gray-500 font-mono mt-1">ID: {id}</p>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(request.status)}
                {canEditOrCancel && !editMode && (
                  <>
                    <button
                      onClick={() => {
                        setEditForm({
                          trip_purpose: request.trip_purpose,
                          passengers_number: request.passengers_number,
                          comments: request.comments || '',
                        });
                        setEditMode(true);
                      }}
                      className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#065d8f] transition-colors flex items-center gap-2"
                    >
                      <Pencil size={16} /> Edit Request
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Cancel Request
                    </button>
                  </>
                )}
                {editMode && (
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {editMode ? (
              <form onSubmit={handleEditSubmit} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Purpose</label>
                  <input
                    type="text"
                    name="trip_purpose"
                    value={editForm.trip_purpose || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Passengers</label>
                  <input
                    type="number"
                    name="passengers_number"
                    min={1}
                    value={editForm.passengers_number || 1}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#0872B3]">Comments</label>
                  <textarea
                    name="comments"
                    value={editForm.comments || ''}
                    onChange={handleEditChange}
                    className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                  />
                </div>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#065d8f] transition-colors flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    <Save size={16} /> {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Request Details</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Request Date</p>
                          <p className="font-medium">{new Date(request.requested_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Purpose</p>
                          <p className="font-medium">{request.trip_purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Number of Passengers</p>
                          <p className="font-medium">{request.passengers_number}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Start Location</p>
                          <p className="font-medium">{request.start_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">End Location</p>
                          <p className="font-medium">{request.end_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Trip Duration</p>
                          <p className="font-medium">
                            {new Date(request.start_date).toLocaleString()} - {new Date(request.end_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {request.comments && (
                        <div className="flex items-start gap-3">
                          <Pencil className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Comments</p>
                            <p className="font-medium">{request.comments}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Requester Info</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{request.full_name}</p>
                        </div>
                      </div>
                      {request.requester && (
                        <>
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Requester</p>
                              <p className="font-medium">{request.requester.first_name} {request.requester.last_name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{request.requester.email}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {request.reviewed_at && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-500 mb-1">Review Info</h2>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Reviewed At</p>
                            <p className="font-medium">{new Date(request.reviewed_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {request.reviewed_by && (
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Reviewed By</p>
                              <p className="font-medium">{request.reviewed_by}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Activity Timeline</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                          <p className="text-xs text-gray-400">{new Date(request.requested_at).toLocaleDateString()}</p>
                          <p className="font-medium text-gray-700">Request Created</p>
                        </div>
                        {request.status !== "PENDING" && (
                          <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="text-xs text-gray-400">{request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : ''}</p>
                            <p className="font-medium text-gray-700">Request {request.status === "REJECTED" ? "Rejected" : "Approved"}</p>
                          </div>
                        )}
                        {request.status === "ACTIVE" && (
                          <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="text-xs text-gray-400">{new Date(request.start_date).toLocaleDateString()}</p>
                            <p className="font-medium text-gray-700">Trip Started</p>
                          </div>
                        )}
                        {request.status === "COMPLETED" && (
                          <>
                            <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
                              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                              <p className="text-xs text-gray-400">{new Date(request.start_date).toLocaleDateString()}</p>
                              <p className="font-medium text-gray-700">Trip Started</p>
                            </div>
                            <div className="relative pl-6 pb-0">
                              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                              <p className="text-xs text-gray-400">{new Date(request.end_date).toLocaleDateString()}</p>
                              <p className="font-medium text-gray-700">Trip Completed</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trash2 className="text-red-600" /> Cancel Request</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this request? This action cannot be undone.</p>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Cancelling...</>) : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

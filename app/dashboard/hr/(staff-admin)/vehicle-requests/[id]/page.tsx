"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Briefcase, Clock, Pencil } from 'lucide-react';
import { useStaffRequest, useCreateIssue } from '@/lib/queries';


export default function VehicleRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: request, isLoading, isError } = useStaffRequest(id);
  const createIssue = useCreateIssue();
  const [showIssueModal, setShowIssueModal] = React.useState(false);
  const [issueDescription, setIssueDescription] = React.useState('');
  const [issueError, setIssueError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emergency, setEmergency] = React.useState(false);

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

  // Only allow editing/cancelling if pending

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setIssueError(null);
    try {
      await createIssue.mutateAsync({ request_id: id, description: issueDescription, emergency });
      setShowIssueModal(false);
      setIssueDescription('');
      setEmergency(false);
      router.push('/dashboard/staff/issue-management');
    } catch (err: unknown) {
      console.error('Error creating issue:', err);
      if (err instanceof Error) {
        setIssueError(err.message);
      } else {
        setIssueError('Failed to create issue');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

        {/* Report Issue Button for Approved Requests */}
        {request.status === 'APPROVED' && (
          <div className="mb-4 flex justify-end">
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
              onClick={() => setShowIssueModal(true)}
            >
              Report Issue
            </button>
          </div>
        )}

        {/* Issue Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Report Issue</h2>
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div>
                  <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="issueDescription"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emergency"
                    checked={emergency}
                    onChange={e => setEmergency(e.target.checked)}
                  />
                  <label htmlFor="emergency" className="text-sm text-gray-700">Mark as Emergency</label>
                </div>
                {issueError && <div className="text-red-600 text-sm">{issueError}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowIssueModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{request.trip_purpose}</h1>
                <p className="text-gray-500 font-mono mt-1">ID: {id}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
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
          </div>
        </div>
      </div>
     
    </main>
  );
}

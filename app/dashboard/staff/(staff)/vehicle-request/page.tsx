"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, X, Pencil, Trash2 } from "lucide-react";
import { useStaffRequests, useCreateStaffRequest, useUpdateStaffRequest, useCancelStaffRequest } from '@/lib/queries';
import type { StaffRequestStatus, StaffRequestResponse, StaffRequest, StaffRequestUpdate } from '@/types/next-auth';

function statusBadge(status: StaffRequestStatus) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
  switch (status) {
    case "PENDING":
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    case "APPROVED":
      return <span className={`${base} bg-green-100 text-green-800`}>Approved <span title="Ready for Issue Submission"><Star className="w-4 h-4 text-blue-500 ml-1" fill="#3b82f6" /></span></span>;
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

export default function VehicleRequestsPage() {
  const router = useRouter();
  const { data: requests = [], isLoading, refetch } = useStaffRequests();
  const createRequest = useCreateStaffRequest();
  const updateRequest = useUpdateStaffRequest();
  const cancelRequest = useCancelStaffRequest();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [time, setTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<StaffRequest>({
    trip_purpose: "",
    start_location: "",
    end_location: "",
    start_date: "",
    end_date: "",
    full_name: "",
    passengers_number: 1,
    comments: "",
  });
  const [editModal, setEditModal] = useState<{ open: boolean; request: StaffRequestResponse | null }>({ open: false, request: null });
  const [editForm, setEditForm] = useState<StaffRequestUpdate>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; requestId: string | null }>({ open: false, requestId: null });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Filtering
  const filtered = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.trip_purpose.toLowerCase().includes(search.toLowerCase()) ||
      req.end_location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "" || req.status === status;
    // For demo, time filter is not implemented
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/staff/vehicle-request/${id}`);
  };

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'passengers_number' ? Number(value) : value }));
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await createRequest.mutateAsync(form);
      setShowModal(false);
      setSuccess(true);
      setForm({
        trip_purpose: "",
        start_location: "",
        end_location: "",
        start_date: "",
        end_date: "",
        full_name: "",
        passengers_number: 1,
        comments: "",
      });
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to create request:", err);
      // Optionally show error
      setSuccess(false);
    }
  }

  // Edit modal handlers
  const openEditModal = (request: StaffRequestResponse) => {
    setEditForm({
      trip_purpose: request.trip_purpose,
      passengers_number: String(request.passengers_number),
      comments: request.comments || '',
    });
    setEditModal({ open: true, request });
  };
  const closeEditModal = () => {
    setEditModal({ open: false, request: null });
    setEditForm({});
    setEditError(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === 'passengers_number' ? Number(value) : value }));
  };
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editModal.request) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await updateRequest.mutateAsync({ id: editModal.request.id, updates: editForm });
      closeEditModal();
      refetch();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message || 'Failed to update request');
      } else {
        setEditError('Failed to update request');
      }
    } finally {
      setEditLoading(false);
    }
  };
  // Cancel modal handlers
  const openCancelModal = (requestId: string) => {
    setCancelModal({ open: true, requestId });
    setCancelError(null);
  };
  const closeCancelModal = () => {
    setCancelModal({ open: false, requestId: null });
    setCancelError(null);
  };
  const handleCancelRequest = async () => {
    if (!cancelModal.requestId) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelRequest.mutateAsync(cancelModal.requestId);
      closeCancelModal();
      refetch();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCancelError(err.message || 'Failed to cancel request');
      } else {
        setCancelError('Failed to cancel request');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0872B3]">
              Vehicle Requests
            </h1>
            <div className="flex gap-2 items-center w-full md:w-auto">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white w-full pl-9"
                />
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ACTIVE">Active</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={() => setShowModal(true)}
                className="ml-2 flex items-center gap-2 cursor-pointer px-6 py-2 text-blue-700 border border-blue-700 rounded-lg shadow-none hover:bg-blue-50 transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[160px] justify-center"
              >
                <span className="inline-flex items-center">
                  <span className="mr-1">+</span> New Request
                </span>
              </button>
            </div>
          </div>
          {/* Success message */}
          {success && (
            <div className="mb-4 text-green-700 bg-green-100 border border-green-200 rounded-lg px-4 py-2 text-center font-semibold transition-all">
              Request submitted successfully!
            </div>
          )}
          <div className="w-full">
  <div className="rounded-1xl shadow-xl border border-gray-100 bg-white 
                  overflow-x-auto sm:overflow-x-auto md:overflow-x-auto lg:overflow-visible">
    <table className="min-w-[800px] w-full text-[14px]">
      <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
        <tr className="text-gray-700">
          <th className="px-6 py-4 text-left font-semibold">Requested</th>
          <th className="px-6 py-4 text-left font-semibold">Purpose</th>
          <th className="px-6 py-4 text-left font-semibold">Destination</th>
          <th className="px-6 py-4 text-left font-semibold">Passengers</th>
          <th className="px-6 py-4 text-left font-semibold">Status</th>
          <th className="px-6 py-4 text-left font-semibold">Start Date</th>
          <th className="px-6 py-4 text-left font-semibold">End Date</th>
          <th className="px-6 py-4 text-left font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={10} className="text-center py-12 text-gray-400 text-lg">Loading...</td>
          </tr>
        ) : filtered.length === 0 ? (
          <tr>
            <td colSpan={10} className="text-center py-12 text-gray-400 text-lg">No requests found.</td>
          </tr>
        ) : (
          filtered.map((req, idx) => (
            <tr
              key={req.id}
              className={`
                ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                hover:bg-blue-50/70 cursor-pointer transition-colors duration-150 rounded-lg
              `}
              style={{ height: "64px" }}
              onClick={() => handleRowClick(req.id)}
            >
              <td className="px-6 py-4">{new Date(req.requested_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">{req.trip_purpose}</td>
              <td className="px-6 py-4">{req.end_location}</td>
              <td className="px-6 py-4 text-center">{req.passengers_number}</td>
              <td className="px-6 py-4">{statusBadge(req.status)}</td>
              <td className="px-6 py-4">{new Date(req.start_date).toLocaleDateString()}</td>
              <td className="px-6 py-4">{new Date(req.end_date).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                {req.status === 'PENDING' && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={e => { e.stopPropagation(); openEditModal(req); }}
                      className="px-3 py-1 bg-[#0872B3] text-white rounded hover:bg-[#065d8f] text-xs flex items-center gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); openCancelModal(req.id); }}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

        </div>
      </div>
      {/* Modal for New Request */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 overflow-y-auto max-h-[90vh] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#0872B3" }}>
              Vehicle Request
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Reason
                    </label>
                    <input
                      type="text"
                      name="trip_purpose"
                      value={form.trip_purpose}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Reason"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Destination
                    </label>
                    <input
                      type="text"
                      name="end_location"
                      value={form.end_location}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Destination"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Passengers
                    </label>
                    <input
                      type="number"
                      name="passengers_number"
                      min={1}
                      value={form.passengers_number}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Passengers"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleFormChange}
                        required
                        className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                        placeholder="Start Date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleFormChange}
                        required
                        className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Start Location
                    </label>
                    <input
                      type="text"
                      name="start_location"
                      value={form.start_location}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Start Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "#0872B3" }}>
                      Comments
                    </label>
                    <textarea
                      name="comments"
                      value={form.comments}
                      onChange={handleFormChange}
                      className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring"
                      placeholder="Comments (optional)"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 rounded font-bold text-white text-base"
                style={{ background: "#0872B3" }}
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && editModal.request && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Pencil className="text-blue-600" /> Edit Request</h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
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
              {editError && <div className="text-red-600 text-sm mb-2">{editError}</div>}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#065d8f] transition-colors flex items-center gap-2"
                  disabled={editLoading}
                >
                  {editLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trash2 className="text-red-600" /> Cancel Request</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this request? This action cannot be undone.</p>
            {cancelError && <div className="text-red-600 text-sm mb-2">{cancelError}</div>}
            <div className="flex justify-end gap-4">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={cancelLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Cancelling...</>) : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

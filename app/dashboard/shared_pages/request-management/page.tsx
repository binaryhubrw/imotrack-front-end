'use client'
import { Check, X, User, MapPin, Users, Car } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { useFmRequests, useFMApproveRequest, useFMRejectRequest, useFMVehicles } from '@/lib/queries';
import { toast } from 'sonner';
import type { Vehicle } from '@/types/next-auth';

export default function VehicleRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const { data: requests = [], isLoading } = useFmRequests();
  const approveRequest = useFMApproveRequest();
  const rejectRequest = useFMRejectRequest();
  const { data: vehicles = [] } = useFMVehicles();
  const [comment, setComment] = useState('');
  const [actioned, setActioned] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Find the request by ID
  const request = useMemo(() => requests.find(r => r.id === requestId), [requests, requestId]);

  const handleApprove = async () => {
    if (!request) return;
    setLoadingAction('approve');
    try {
      const vehicleId = selectedVehicleId;
      if (!vehicleId) {
        toast.error('Please select a vehicle to assign.');
        setLoadingAction(null);
        return;
      }
      await approveRequest.mutateAsync({ requestId: request.id, vehicleId });
      toast.success('Request approved!');
      setActioned(true);
      setTimeout(() => router.push('/dashboard/fleet-manager/request-overview'), 1000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        // @ts-expect-error: dynamic error shape from backend
        toast.error(err.response.data.message || 'Failed to approve request');
      } else {
        toast.error('Failed to approve request');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setLoadingAction('reject');
    try {
      await rejectRequest.mutateAsync({ requestId: request.id, comment });
      toast.success('Request rejected!');
      setActioned(true);
      setTimeout(() => router.push('/dashboard/fleet-manager/request-overview'), 1000);
    } catch {
      toast.error('Failed to reject request');
    } finally {
      setLoadingAction(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  if (!request) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Request not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-2">
      {/* Main Request Card */}
      <section className="bg-white rounded-2xl border shadow-lg p-2 sm:p-4 w-full max-w-4xl mx-auto">

        {/* Request Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Request <span className="text-blue-600">#{request.id}</span></h2>
          <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${request.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : request.status?.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' : request.status?.toUpperCase() === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>{request.status}</span>
        </div>

        {/* Requester & Trip Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-4 h-4" />Requester</p>
              <p className="font-semibold text-gray-800">{request.full_name || (request.requester?.first_name + ' ' + request.requester?.last_name)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p className="font-semibold text-gray-800">{(request.requester as any)?.department || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Reason</p>
              <p className="font-semibold text-gray-800">{request.trip_purpose}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-4 h-4" />Passengers</p>
              <p className="font-semibold text-gray-800">{request.passengers_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" />Destination</p>
              <p className="font-semibold text-gray-800">{request.end_location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Start Location</p>
              <p className="font-semibold text-gray-800">{request.start_location}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-800">{request.start_date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Date</p>
              <p className="font-semibold text-gray-800">{request.end_date}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Car className="w-4 h-4" />Requested Vehicle</p>
          <p className="font-semibold text-gray-800">{request.vehicle?.plate_number ? `${request.vehicle.plate_number} - ${request.vehicle.vehicle_model}` : 'Not assigned'}</p>
        </div>

        {/* Vehicle Selection for Approval */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign Vehicle to Request</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedVehicleId}
            onChange={e => setSelectedVehicleId(e.target.value)}
            disabled={actioned || loadingAction === 'approve'}
          >
            <option value="">Select a vehicle...</option>
            {vehicles.filter((v: Vehicle) => v.status?.toUpperCase() === 'AVAILABLE').map((vehicle: Vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate_number} - {vehicle.vehicle_model} ({vehicle.manufacturer})
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 mt-4">
          <button
            onClick={handleApprove}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition focus:ring-2 focus:ring-green-400 ${actioned ? 'bg-green-200 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'} ${loadingAction === 'approve' ? 'opacity-60' : ''}`}
            title="Approve this request"
            disabled={actioned || loadingAction === 'approve' || !selectedVehicleId}
          >
            <Check className="h-5 w-5" />
            {loadingAction === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          <div className="flex flex-col gap-2">
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Rejection comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={actioned || loadingAction === 'reject'}
            />
            <button
              onClick={handleReject}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition focus:ring-2 focus:ring-red-400 ${actioned ? 'bg-red-200 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} ${loadingAction === 'reject' ? 'opacity-60' : ''}`}
              title="Reject this request"
              disabled={actioned || loadingAction === 'reject'}
            >
              <X className="h-5 w-5" />
              {loadingAction === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
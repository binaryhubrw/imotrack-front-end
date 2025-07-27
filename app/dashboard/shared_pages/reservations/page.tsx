'use client'
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Car, Square,
  User,
  X,
  CheckCircle
} from 'lucide-react';
import { useReservations, useMyReservations, useCreateReservation, useCancelReservation, useUpdateReservation, useCompleteReservation, useVehicles, useReservationVehicleOdometerAssignation, useUpdateReservationReason } from '@/lib/queries';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Reservation, CreateReservationDto, ReservationStatus } from '@/types/next-auth';
import { SkeletonReservationCard } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { Vehicle } from '@/types/next-auth';
import ErrorUI from '@/components/ErrorUI';
import { useRouter } from 'next/navigation';

// Status enum for better type safety
const RESERVATION_STATUSES: Record<ReservationStatus, string> = {
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  CANCELED: 'Cancelled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

function CreateReservationModal({ open, onClose, onCreate, isLoading }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateReservationDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateReservationDto>({
    reservation_purpose: '',
    start_location: '',
    reservation_destination: '',
    departure_date: '',
    expected_returning_date: '',
    description: '',
    passengers: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.reservation_purpose.trim()) newErrors.reservation_purpose = 'Purpose is required';
    if (!form.start_location.trim()) newErrors.start_location = 'Start location is required';
    if (!form.reservation_destination.trim()) newErrors.reservation_destination = 'Destination is required';
    if (!form.departure_date) newErrors.departure_date = 'Departure date is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.passengers || form.passengers < 1) newErrors.passengers = 'Passengers must be at least 1';
    if (!form.expected_returning_date) newErrors.expected_returning_date = 'Expected return date is required';
    // Validate dates
    if (form.departure_date && form.expected_returning_date) {
      const departure = new Date(form.departure_date);
      const returnDate = new Date(form.expected_returning_date);
      if (departure >= returnDate) {
        newErrors.expected_returning_date = 'Return date must be after departure date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'passengers' ? Number(value) : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ reservation_purpose: true, start_location: true, reservation_destination: true, departure_date: true, expected_returning_date: true, description: true, passengers: true });
    if (!validateForm()) return;
    await onCreate(form);
    setForm({ reservation_purpose: '', start_location: '', reservation_destination: '', departure_date: '', description: '', passengers: 1, expected_returning_date: '' });
    setTouched({});
    setErrors({});
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300 border border-blue-100">
    <div className="p-6">
      <button className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-blue-50 z-10" onClick={onClose}>&times;</button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0872b3] mb-2">Create Reservation</h2>
        <p className="text-sm text-gray-600">Fill in the details to create a new reservation</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Row - Purpose and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Purpose</label>
            <Input 
              name="reservation_purpose" 
              value={form.reservation_purpose} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.reservation_purpose && touched.reservation_purpose ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.reservation_purpose && touched.reservation_purpose && <p className="text-xs text-red-500 mt-1">{errors.reservation_purpose}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Description</label>
            <Input 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.description && touched.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.description && touched.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Second Row - Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Start Location</label>
            <Input 
              name="start_location" 
              value={form.start_location} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.start_location && touched.start_location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.start_location && touched.start_location && <p className="text-xs text-red-500 mt-1">{errors.start_location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Destination</label>
            <Input 
              name="reservation_destination" 
              value={form.reservation_destination} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.reservation_destination && touched.reservation_destination ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.reservation_destination && touched.reservation_destination && <p className="text-xs text-red-500 mt-1">{errors.reservation_destination}</p>}
          </div>
        </div>

        {/* Third Row - Passengers and Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Passengers</label>
            <Input 
              name="passengers" 
              type="number"
              min="1"
              value={form.passengers} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.passengers && touched.passengers ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.passengers && touched.passengers && <p className="text-xs text-red-500 mt-1">{errors.passengers}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Departure Date</label>
            <Input 
              name="departure_date" 
              type="datetime-local" 
              value={form.departure_date} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.departure_date && touched.departure_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.departure_date && touched.departure_date && <p className="text-xs text-red-500 mt-1">{errors.departure_date}</p>}
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Expected Return Date</label>
            <Input 
              name="expected_returning_date" 
              type="datetime-local" 
              value={form.expected_returning_date} 
              onChange={handleChange} 
              className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.expected_returning_date && touched.expected_returning_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
            />
            {errors.expected_returning_date && touched.expected_returning_date && <p className="text-xs text-red-500 mt-1">{errors.expected_returning_date}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full h-9 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold text-sm rounded-lg transition-colors duration-200" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Reservation'}
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}

function AssignVehicleModal({ open, onClose, reservation }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startingOdometer, setStartingOdometer] = useState<string>('');
  const [fuelProvided, setFuelProvided] = useState<string>('');
  const { data: vehicles } = useVehicles();
  const assignVehicleOdometer = useReservationVehicleOdometerAssignation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get available vehicles with sufficient capacity
  const suitableVehicles: Vehicle[] = useMemo(() => {
    if (!vehicles || !reservation) return [];
    return vehicles.filter((vehicle: Vehicle) => {
      const capacity = vehicle.vehicle_capacity || 0;
      const passengers = reservation.passengers || 0;
      return vehicle.vehicle_status === 'AVAILABLE' && capacity >= passengers;
    });
  }, [vehicles, reservation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedVehicle || !startingOdometer || !fuelProvided || !reservation) {
      setError('Please fill in all fields');
      return;
    }

    const odometer = Number(startingOdometer);
    const fuel = Number(fuelProvided);
    
    if (odometer <= 0 || fuel < 0) {
      setError('Please enter valid values');
      return;
    }

    setSubmitting(true);
    try {
      await assignVehicleOdometer.mutateAsync({
        id: reservation.reservation_id,
        dto: {
          vehicle_id: selectedVehicle,
          starting_odometer: odometer,
          fuel_provided: fuel,
        },
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle('');
    setStartingOdometer('');
    setFuelProvided('');
    setError(null);
    onClose();
  };

  if (!open || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Assign Vehicle</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Passenger info */}
          <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Passengers:</strong> {reservation.passengers || 0}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle *
              </label>
              <select
                id="vehicle"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a vehicle</option>
                {suitableVehicles.length === 0 ? (
                  <option disabled>No suitable vehicles available</option>
                ) : (
                  suitableVehicles.map((vehicle: Vehicle) => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.plate_number} - {vehicle.vehicle_model?.vehicle_model_name || 'Unknown'} (Capacity: {vehicle.vehicle_capacity || 0})
                    </option>
                  ))
                )}
              </select>
              {suitableVehicles.length === 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  No vehicles available for {reservation.passengers || 0} passengers
                </p>
              )}
            </div>

            {/* Odometer */}
            <div>
              <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 mb-1">
                Starting Odometer *
              </label>
              <input
                id="odometer"
                type="number"
                min="1"
                value={startingOdometer}
                onChange={(e) => setStartingOdometer(e.target.value)}
                placeholder="Enter odometer reading"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Fuel */}
            <div>
              <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Provided (L) *
              </label>
              <input
                id="fuel"
                type="number"
                min="0"
                step="0.1"
                value={fuelProvided}
                onChange={(e) => setFuelProvided(e.target.value)}
                placeholder="Enter fuel amount"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || suitableVehicles.length === 0}
                className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Assigning...' : 'Assign Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



function CompleteReservationModal({ open, onClose, reservation, onComplete, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onComplete: (returnedOdometer: number) => void;
  isLoading: boolean;
}) {
  const [returnedOdometer, setReturnedOdometer] = useState<string>('');
  const [touched, setTouched] = useState(false);
  
  const odometerNum = Number(returnedOdometer);
  const valid = !isNaN(odometerNum) && odometerNum > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    await onComplete(odometerNum);
    setReturnedOdometer('');
    setTouched(false);
    onClose();
  };

  // Get the reserved vehicle for this reservation
  const reservedVehicle = reservation?.reserved_vehicles?.[0];
  const startingOdometer = reservedVehicle?.starting_odometer || 0;

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Complete Journey</h2>
              <p className="text-sm text-gray-500">Enter final odometer reading</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{reservation.passengers || 1} passenger{(reservation.passengers || 1) !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{startingOdometer.toLocaleString()} km start</span>
            </div>
          </div>

          {/* Odometer Input */}
          <div className="space-y-2">
            <label htmlFor="returnedOdometer" className="block text-sm font-medium text-gray-700">
              Final Odometer Reading (km)
            </label>
            <input
              id="returnedOdometer"
              type="number"
              min={startingOdometer + 1}
              value={returnedOdometer}
              onChange={(e) => setReturnedOdometer(e.target.value)}
              placeholder={`Min: ${startingOdometer + 1}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
              required
            />
            {touched && !valid && (
              <p className="text-xs text-red-600">
                Must be greater than {startingOdometer}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !valid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? 'Completing...' : 'Complete Journey'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelReservationModal({ open, onClose, reservation, onCancel, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onCancel: (rejectionComment: string) => void;
  isLoading: boolean;
}) {
  const [rejectionComment, setRejectionComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCancel(rejectionComment);
    setRejectionComment('');
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Cancel Reservation</h2>
        <p className="text-sm text-gray-600 mb-4">Provide a reason for cancellation</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cancellation Reason</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              value={rejectionComment} 
              onChange={(e) => setRejectionComment(e.target.value)} 
              placeholder="Enter cancellation reason..."
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#0872b3] text-white" disabled={isLoading || !rejectionComment.trim()}>
            {isLoading ? 'Cancelling...' : 'Cancel Reservation'}
          </Button>
        </form>
      </div>
    </div>
  );
}


// Approve/Reject Modal
function ApproveRejectModal({ open, onClose, reservation, onSubmit, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onSubmit: (action: 'APPROVED' | 'REJECTED', reason: string) => void;
  isLoading: boolean;
}) {
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const isReject = action === 'REJECTED';
  const valid = action === 'APPROVED' || (action === 'REJECTED' && reason.trim());

  React.useEffect(() => {
    setReason('');
    setTouched(false);
  }, [action, open]);

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            onSubmit(action, reason);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Select Action</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={action}
              onChange={e => setAction(e.target.value as 'APPROVED' | 'REJECTED')}
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason {isReject && <span className="text-red-500">*</span>}</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={isReject ? "Enter reason for rejection" : "Optional reason for approval"}
              required={isReject}
            />
            {touched && isReject && !reason.trim() && (
              <div className="text-xs text-red-500 mt-1">Reason is required for rejection.</div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isLoading || !valid}>
              {isLoading ? (action === 'APPROVED' ? 'Approving...' : 'Rejecting...') : (action === 'APPROVED' ? 'Approve' : 'Reject')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const reservationAccess = user?.position?.position_access?.reservations;
  const orgAccess = user?.position?.position_access?.organizations;

  // Enhanced permission logic with more granular checks
  const canViewAll = reservationAccess?.view || orgAccess?.view;
  const canViewOwn = reservationAccess?.viewOwn;
  const canCreate = reservationAccess?.create;
  const canUpdate = reservationAccess?.update;
  const canCancel = reservationAccess?.cancel;
  const canApprove = reservationAccess?.approve;
  const canAssignVehicle = reservationAccess?.assignVehicle;
  const canUpdateReason = reservationAccess?.updateReason;
  const canStart = reservationAccess?.start;
  const canComplete = reservationAccess?.complete;
  const canViewPage = canViewAll || canViewOwn || canCreate || canCancel || canApprove || canAssignVehicle || canUpdate || canStart || canComplete;

  // Always call hooks
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignVehicle, setShowAssignVehicle] = useState(false);
  const [showCompleteReservation, setShowCompleteReservation] = useState(false);
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const updateReservationReason = useUpdateReservationReason();
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [editReasonValue, setEditReasonValue] = useState('');
  const [editReasonReservation, setEditReasonReservation] = useState<Reservation | null>(null);
  
  // Enhanced data fetching based on permissions
  const { data: allReservations, isLoading: isLoadingAll, isError: isErrorAll } = useReservations();
  const { data: myReservations, isLoading: isLoadingMy, isError: isErrorMy } = useMyReservations();

  const router = useRouter();
  
  // Choose which data to use based on permissions - wrapped in useMemo to prevent unnecessary re-renders
  const reservations = useMemo(() => {
    if (canViewAll) {
      return allReservations || [];
    } else if (canViewOwn) {
      return myReservations
        ? Array.isArray(myReservations) ? myReservations : [myReservations]
        : [];
    }
    return [];
  }, [canViewAll, canViewOwn, allReservations, myReservations]);

  const isLoading = canViewAll ? isLoadingAll : canViewOwn ? isLoadingMy : false;
  const isError = canViewAll ? isErrorAll : canViewOwn ? isErrorMy : false;

  const createReservation = useCreateReservation();
  const completeReservation = useCompleteReservation();
  const cancelReservation = useCancelReservation();
  const updateReservation = useUpdateReservation();
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [approveRejectReservation, setApproveRejectReservation] = useState<Reservation | null>(null);

  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter((reservation: Reservation) =>
      reservation.reservation_purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.reservation_destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservations, searchTerm]);

  if (!canViewPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg font-semibold">You do not have permission to access reservations.</div>
      </div>
    );
  }

  const handleCreate = async (form: CreateReservationDto) => {
    if (!canCreate) {
      toast.error('You do not have permission to create reservations');
      return;
    }
    
    try {
      // Format dates to ISO string for backend
      const formattedForm = {
        ...form,
        departure_date: new Date(form.departure_date).toISOString(),
        expected_returning_date: new Date(form.expected_returning_date).toISOString(),
      };
      console.log('Submitting reservation form:', formattedForm);
      await createReservation.mutateAsync(formattedForm);
    } catch {
      // error handled by mutation
    }
  };

  

  const handleCompleteReservation = async (returnedOdometer: number) => {
    if (!canComplete) {
      toast.error('You do not have permission to complete reservations');
      return;
    }
    
    if (!selectedReservation) return;
    
    // Get the reserved vehicle ID
    const reservedVehicleId = selectedReservation.reserved_vehicles && selectedReservation.reserved_vehicles.length > 0
      ? selectedReservation.reserved_vehicles[0].reserved_vehicle_id
      : undefined;
      
    if (!reservedVehicleId) {
      toast.error('No vehicle assigned to this reservation');
      return;
    }
    
    try {
      await completeReservation.mutateAsync({ 
        reservedVehicleId: reservedVehicleId, 
        dto: { returned_odometer: returnedOdometer } 
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleCancelReservation = async (rejectionComment: string) => {
    if (!canCancel) {
      toast.error('You do not have permission to cancel reservations');
      return;
    }
    
    if (!selectedReservation) return;
    try {
      await cancelReservation.mutateAsync({ 
        id: selectedReservation.reservation_id, 
        dto: { reason: rejectionComment } 
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleUpdateReservationReason = async () => {
    if (!canUpdateReason) {
      toast.error('You do not have permission to update reservation reasons');
      return;
    }
    
    if (!editReasonReservation) return;
    try {
      await updateReservationReason.mutateAsync({
        id: editReasonReservation.reservation_id,
        reason: editReasonValue,
      });
      setShowEditReasonModal(false);
      setEditReasonReservation(null);
      setEditReasonValue('');
    } catch {
      // error handled by mutation
    }
  };

  const handleApproveReject = async (action: 'APPROVED' | 'REJECTED', reason: string) => {
    if (!canApprove) {
      toast.error('You do not have permission to approve/reject reservations');
      return;
    }
    
    if (!approveRejectReservation) return;
    try {
      await updateReservation.mutateAsync({
        id: approveRejectReservation.reservation_id,
        dto: { status: action, reason },
      });
      setShowApproveRejectModal(false);
      setApproveRejectReservation(null);
    } catch {
      // error handled by mutation
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'CANCELED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAssignVehicleToReservation = (reservation: Reservation) => {
    return canAssignVehicle && reservation.reservation_status === 'APPROVED' && 
           (!reservation.reserved_vehicles || reservation.reserved_vehicles.length === 0);
  };

  const canCompleteReservation = (reservation: Reservation) => {
    return canComplete && reservation.reservation_status === 'IN_PROGRESS';
  };


  const canApproveRejectReservation = (reservation: Reservation) => {
    return canApprove && reservation.reservation_status === 'UNDER_REVIEW';
  };

  const canCancelReservation = (reservation: Reservation) => {
    return canCancel && (reservation.reservation_status === 'UNDER_REVIEW' || reservation.reservation_status === 'APPROVED');
  };

  const canEditReason = (reservation: Reservation) => {
    return canUpdateReason && (reservation.reservation_status === 'REJECTED' || reservation.reservation_status === 'CANCELED' || reservation.reservation_status === 'CANCELLED');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-bold text-[#0872b3]">Reservations</h1>
        <div className="flex flex-1 gap-3 items-center justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
            />
          </div>
          {/* Only show Add Reservation if user has create permission */}
          {canCreate && (
            <Button className="flex items-center gap-2 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold px-5 py-3 rounded-lg transition-colors duration-200" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Add Reservation
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <SkeletonReservationCard/>
        ) : isError ? (
          <ErrorUI
            resource='reservations'
            onBack={() => router.back()}
            onRetry={() => {window.location.reload()}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((reservation: Reservation) => (
              <div key={reservation.reservation_id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    {reservation.reservation_purpose}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.reservation_status)}`}>
                    {RESERVATION_STATUSES[reservation.reservation_status as ReservationStatus]}
                  </span>
                </div>
                
                <div className="text-gray-600 text-sm">From: {reservation.start_location}</div>
                <div className="text-gray-600 text-sm">To: {reservation.reservation_destination}</div>
                <div className="text-gray-600 text-sm">Departure: {reservation.departure_date ? new Date(reservation.departure_date).toLocaleString() : 'N/A'}</div>
                <div className="text-gray-600 text-sm">Return: {reservation.expected_returning_date ? new Date(reservation.expected_returning_date).toLocaleString() : 'N/A'}</div>
                
                {/* Show rejection comment if reservation is cancelled or rejected */}
                {(reservation.reservation_status === 'CANCELED' || reservation.reservation_status === 'CANCELLED' || reservation.reservation_status === 'REJECTED') && reservation.rejection_comment && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                    <strong>Reason:</strong> {reservation.rejection_comment}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleString() : 'N/A'}</div>
                <div className="text-xs text-gray-500">User: {reservation.user ? `${reservation.user.first_name} ${reservation.user.last_name}` : 'N/A'}</div>

                {/* Action Buttons - Enhanced with proper permission checks */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {/* View Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#0872b3] border-[#0872b3] hover:bg-[#0872b3] hover:text-white"
                    onClick={() => router.push(`/dashboard/shared_pages/reservations/${reservation.reservation_id}`)}
                  >
                    View
                  </Button>

                  {/* Approve/Reject Button */}
                  {canApproveRejectReservation(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        setApproveRejectReservation(reservation);
                        setShowApproveRejectModal(true);
                      }}
                    >
                      Approve/Reject
                    </Button>
                  )}
                
                  {/* Assign Vehicle Button */}
                  {canAssignVehicleToReservation(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowAssignVehicle(true); }}
                    >
                      <Car className="w-3 h-3 mr-1" />
                      Assign Vehicle
                    </Button>
                  )}

                  {/* Complete Button */}
                  {canCompleteReservation(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowCompleteReservation(true); }}
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  )}

                  {/* Cancel Button */}
                  {canCancelReservation(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowCancelReservation(true); }}
                    >
                      Cancel
                    </Button>
                  )}

                  {/* Edit Reason Button */}
                  {canEditReason(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        setEditReasonReservation(reservation);
                        setEditReasonValue(reservation.rejection_comment || '');
                        setShowEditReasonModal(true);
                      }}
                    >
                      Edit Reason
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateReservationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        isLoading={createReservation.isPending}
      />

      <AssignVehicleModal
        open={showAssignVehicle}
        onClose={() => setShowAssignVehicle(false)}
        reservation={selectedReservation}
      />

      

      <CompleteReservationModal
        open={showCompleteReservation}
        onClose={() => setShowCompleteReservation(false)}
        reservation={selectedReservation}
        onComplete={handleCompleteReservation}
        isLoading={completeReservation.isPending}
      />

      <CancelReservationModal
        open={showCancelReservation}
        onClose={() => setShowCancelReservation(false)}
        reservation={selectedReservation}
        onCancel={handleCancelReservation}
        isLoading={cancelReservation.isPending}
      />

      {/* Edit Reason Modal */}
      {showEditReasonModal && editReasonReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowEditReasonModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Reason</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdateReservationReason();
              }}
              className="space-y-4"
            >
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={4}
                value={editReasonValue}
                onChange={e => setEditReasonValue(e.target.value)}
                placeholder="Enter reason for rejection or cancellation"
                required
              />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowEditReasonModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white" disabled={updateReservationReason.isPending}>
                  {updateReservationReason.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ApproveRejectModal
        open={showApproveRejectModal}
        onClose={() => { setShowApproveRejectModal(false); setApproveRejectReservation(null); }}
        reservation={approveRejectReservation}
        onSubmit={handleApproveReject}
        isLoading={updateReservation.isPending}
      />
    </div>
  );
}
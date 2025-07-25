'use client'
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Car, XCircle, Square
} from 'lucide-react';
import { useReservations, useMyReservations, useCreateReservation, useCancelReservation, useUpdateReservation, useVehicleReservationAssignment, useStartReservation, useCompleteReservation, useVehicles, useReservationOdometerFuel, useUpdateReservationReason } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Reservation, CreateReservationDto, ReservationStatus } from '@/types/next-auth';
import { SkeletonReservationCard } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import type { Vehicle } from '@/types/next-auth';

// Status enum for better type safety
const RESERVATION_STATUSES: Record<ReservationStatus, string> = {
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.reservation_purpose.trim()) newErrors.reservation_purpose = 'Purpose is required';
    if (!form.start_location.trim()) newErrors.start_location = 'Start location is required';
    if (!form.reservation_destination.trim()) newErrors.reservation_destination = 'Destination is required';
    if (!form.departure_date) newErrors.departure_date = 'Departure date is required';
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
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ reservation_purpose: true, start_location: true, reservation_destination: true, departure_date: true, expected_returning_date: true });
    if (!validateForm()) return;
    await onCreate(form);
    setForm({ reservation_purpose: '', start_location: '', reservation_destination: '', departure_date: '', expected_returning_date: '' });
    setTouched({});
    setErrors({});
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-in fade-in-0 zoom-in-95 duration-300 border border-blue-100">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-blue-50" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-[#0872b3] mb-2">Create Reservation</h2>
        <p className="text-sm text-gray-600 mb-4">Fill in the details to create a new reservation</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Purpose</label>
            <Input name="reservation_purpose" value={form.reservation_purpose} onChange={handleChange} className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.reservation_purpose && touched.reservation_purpose ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} />
            {errors.reservation_purpose && touched.reservation_purpose && <p className="text-xs text-red-500 mt-1">{errors.reservation_purpose}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Start Location</label>
            <Input name="start_location" value={form.start_location} onChange={handleChange} className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.start_location && touched.start_location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} />
            {errors.start_location && touched.start_location && <p className="text-xs text-red-500 mt-1">{errors.start_location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0872b3] mb-1">Destination</label>
            <Input name="reservation_destination" value={form.reservation_destination} onChange={handleChange} className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.reservation_destination && touched.reservation_destination ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} />
            {errors.reservation_destination && touched.reservation_destination && <p className="text-xs text-red-500 mt-1">{errors.reservation_destination}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-1">Departure Date</label>
              <Input name="departure_date" type="datetime-local" value={form.departure_date} onChange={handleChange} className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.departure_date && touched.departure_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} />
              {errors.departure_date && touched.departure_date && <p className="text-xs text-red-500 mt-1">{errors.departure_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0872b3] mb-1">Expected Return Date</label>
              <Input name="expected_returning_date" type="datetime-local" value={form.expected_returning_date} onChange={handleChange} className={`border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${errors.expected_returning_date && touched.expected_returning_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} />
              {errors.expected_returning_date && touched.expected_returning_date && <p className="text-xs text-red-500 mt-1">{errors.expected_returning_date}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold py-2 rounded-lg transition-colors duration-200" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Reservation'}</Button>
        </form>
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
  const [reservedVehicleId, setReservedVehicleId] = useState<string | null>(null);
  const [startingOdometer, setStartingOdometer] = useState<string>('');
  const [fuelProvided, setFuelProvided] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const { data: vehicles } = useVehicles();
  const assignVehicle = useVehicleReservationAssignment();
  const odometerFuelMutation = useReservationOdometerFuel();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [assignedVehicleInfo, setAssignedVehicleInfo] = useState<Vehicle | null>(null);

  const availableVehicles: Vehicle[] = useMemo(() => {
    return vehicles?.filter((v: Vehicle) => v.vehicle_status === 'AVAILABLE') || [];
  }, [vehicles]);

  // Step 1: Assign vehicle
  const handleAssignVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!selectedVehicle || !reservation) return;
    setSubmitting(true);
    try {
      const assigned: Reservation = await assignVehicle.mutateAsync({
        id: reservation.reservation_id,
        dto: { vehicle_id: selectedVehicle },
      });
      // Type guard for reserved_vehicles
      if (!Array.isArray(assigned.reserved_vehicles) || assigned.reserved_vehicles.length === 0) {
        console.error('Assign vehicle API response:', assigned);
        throw new Error('Could not get reserved vehicle ID');
      }
      const reserved = assigned.reserved_vehicles[0];
      if (!reserved?.reserved_vehicle_id) throw new Error('Could not get reserved vehicle ID');
      setReservedVehicleId(reserved.reserved_vehicle_id);
      setAssignedVehicleInfo(availableVehicles.find((v: Vehicle) => v.vehicle_id === selectedVehicle) || null);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Submit odometer/fuel
  const isOdometerValid = startingOdometer !== '' && !isNaN(Number(startingOdometer)) && Number(startingOdometer) > 0;
  const isFuelValid = fuelProvided !== '' && !isNaN(Number(fuelProvided)) && Number(fuelProvided) >= 0;
  const validOdoFuel = isOdometerValid && isFuelValid;

  const handleOdometerFuel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!reservedVehicleId || !validOdoFuel) return;
    setSubmitting(true);
    try {
      await odometerFuelMutation.mutateAsync({
        reservedVehicleId,
        dto: {
          starting_odometer: Number(startingOdometer),
          fuel_provided: Number(fuelProvided),
        },
      });
      setSelectedVehicle('');
      setReservedVehicleId(null);
      setStartingOdometer('');
      setFuelProvided('');
      setTouched(false);
      setStep(1);
      setAssignedVehicleInfo(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set odometer/fuel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle('');
    setReservedVehicleId(null);
    setStartingOdometer('');
    setFuelProvided('');
    setTouched(false);
    setStep(1);
    setAssignedVehicleInfo(null);
    setError(null);
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Assign Vehicle</h2>
        {step === 1 && (
          <form onSubmit={handleAssignVehicle} className="space-y-5">
            <div>
              <Label htmlFor="vehicle-select">Select Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition shadow-sm">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                  {availableVehicles.map((vehicle: Vehicle) => (
                    <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id} className="hover:bg-blue-50 focus:bg-blue-100 px-3 py-2 cursor-pointer">
                      {vehicle.plate_number} - {vehicle.vehicle_model?.vehicle_model_name || 'Unknown Model'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && !selectedVehicle && <span className="text-xs text-red-500">Please select a vehicle.</span>}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full text-white bg-[#0872b3]" disabled={submitting || !selectedVehicle}>
              {submitting ? 'Assigning...' : 'Assign Vehicle'}
            </Button>
          </form>
        )}
        {step === 2 && reservedVehicleId && (
          <form onSubmit={handleOdometerFuel} className="space-y-5">
            <div className="mb-2 p-2 bg-blue-50 rounded">
              <div className="text-xs text-gray-500">Reserved Vehicle ID:</div>
              <div className="font-mono text-sm text-blue-900">{reservedVehicleId}</div>
              {assignedVehicleInfo && (
                <div className="text-xs text-gray-700 mt-1">
                  Vehicle: {assignedVehicleInfo.plate_number} - {assignedVehicleInfo.vehicle_model?.vehicle_model_name || 'Unknown Model'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="odometer-input">Starting Odometer</Label>
              <Input id="odometer-input" type="number" min={0} value={startingOdometer} onChange={e => setStartingOdometer(e.target.value)} placeholder="Enter starting odometer" required />
              {touched && !isOdometerValid && <span className="text-xs text-red-500">Enter a valid odometer value (must be greater than 0).</span>}
            </div>
            <div>
              <Label htmlFor="fuel-input">Fuel Provided (liters)</Label>
              <Input id="fuel-input" type="number" min={0} value={fuelProvided} onChange={e => setFuelProvided(e.target.value)} placeholder="Enter fuel provided" required />
              {touched && !isFuelValid && <span className="text-xs text-red-500">Enter a valid fuel value (0 or more).</span>}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full text-white bg-[#0872b3]" disabled={submitting || !validOdoFuel}>
              {submitting ? 'Saving...' : 'Save Odometer & Fuel'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function StartReservationModal({ open, onClose, reservation, onStart, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onStart: () => void;
  isLoading: boolean;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onStart();
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Start Reservation</h2>
        <p className="text-sm text-gray-600 mb-4">Click to start the reservation</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Button type="submit" className="w-full p-2 text-white bg-[#0872b3]" disabled={isLoading}>
            {isLoading ? 'Starting...' : 'Start Reservation'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CompleteReservationModal({ open, onClose, reservation, onComplete, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onComplete: () => void;
  isLoading: boolean;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onComplete();
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Complete Reservation</h2>
        <p className="text-sm text-gray-600 mb-4">Click to complete the reservation</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Completing...' : 'Complete Reservation'}
          </Button>
        </form>
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

function OdometerFuelModal({ open, onClose, onSubmit, isLoading }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (odometer: number, fuel: number) => void;
  isLoading: boolean;
}) {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [touched, setTouched] = useState(false);
  const odometerNum = Number(odometer);
  const fuelNum = Number(fuel);
  const valid = !isNaN(odometerNum) && !isNaN(fuelNum) && odometerNum > 0 && fuelNum >= 0;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(odometerNum, fuelNum);
    setOdometer('');
    setFuel('');
    setTouched(false);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Enter Odometer & Fuel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starting Odometer</label>
            <Input type="number" min={0} value={odometer} onChange={e => setOdometer(e.target.value)} className="w-full" required />
            {touched && (isNaN(odometerNum) || odometerNum <= 0) && <span className="text-xs text-red-500">Enter a valid odometer value</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Provided (liters)</label>
            <Input type="number" min={0} value={fuel} onChange={e => setFuel(e.target.value)} className="w-full" required />
            {touched && (isNaN(fuelNum) || fuelNum < 0) && <span className="text-xs text-red-500">Enter a valid fuel value</span>}
          </div>
          <Button type="submit" className="w-full bg-[#0872b3] text-white" disabled={isLoading || !valid}>{isLoading ? 'Saving...' : 'Save & Start'}</Button>
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

  // Permission logic
  const canViewAll = reservationAccess?.view || orgAccess?.view;
  const canViewOwn = reservationAccess?.viewOwn;
  const canViewPage = canViewAll || canViewOwn || (
    reservationAccess?.create ||
    reservationAccess?.cancel ||
    reservationAccess?.approve ||
    reservationAccess?.assignVehicle ||
    reservationAccess?.update ||
    reservationAccess?.start ||
    reservationAccess?.complete
  );

  // Always call hooks
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignVehicle, setShowAssignVehicle] = useState(false);
  const [showStartReservation, setShowStartReservation] = useState(false);
  const [showCompleteReservation, setShowCompleteReservation] = useState(false);
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(false);
  const [odometerVehicleId, setOdometerVehicleId] = useState<string | null>(null);
  const odometerFuelMutation = useReservationOdometerFuel();
  const updateReservationReason = useUpdateReservationReason();
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [editReasonValue, setEditReasonValue] = useState('');
  const [editReasonReservation, setEditReasonReservation] = useState<Reservation | null>(null);
  const { data: allReservations, isLoading: isLoadingAll, isError: isErrorAll } = useReservations();
  const { data: myReservations, isLoading: isLoadingMy, isError: isErrorMy } = useMyReservations();

  // Choose which data to use
  const reservations: Reservation[] = canViewAll
    ? (allReservations || [])
    : canViewOwn
      ? myReservations
        ? Array.isArray(myReservations) ? myReservations : [myReservations]
        : []
      : [];

  const isLoading = canViewAll ? isLoadingAll : canViewOwn ? isLoadingMy : false;
  const isError = canViewAll ? isErrorAll : canViewOwn ? isErrorMy : false;

  const createReservation = useCreateReservation();
  // const assignVehicle = useVehicleReservationAssignment();
  const startReservation = useStartReservation();
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


  // const handleAssignVehicle = async (vehicleId: string) => {
  //   if (!selectedReservation) return;
  //   try {
  //     await assignVehicle.mutateAsync({ 
  //       id: selectedReservation.reservation_id, 
  //       dto: { vehicle_id: vehicleId } 
  //     });
  //   } catch {
  //     // error handled by mutation
  //   }
  // };

  const handleStartReservation = async () => {
    if (!selectedReservation) return;
    const reservedVehicleId = selectedReservation.reserved_vehicles && selectedReservation.reserved_vehicles.length > 0
      ? selectedReservation.reserved_vehicles[0].reserved_vehicle_id
      : undefined;
    if (!reservedVehicleId) {
      // error handled by mutation
      return;
    }
    setOdometerVehicleId(reservedVehicleId);
    setShowOdometerModal(true);
  };

  const handleOdometerFuelSubmit = async (odometer: number, fuel: number) => {
    if (!odometerVehicleId) return;
    try {
      await odometerFuelMutation.mutateAsync({ reservedVehicleId: odometerVehicleId, dto: { starting_odometer: odometer, fuel_provided: fuel } });
      setShowOdometerModal(false);
      setOdometerVehicleId(null);
      // Optionally, you can call startReservation.mutateAsync here if needed for further workflow
    } catch {
      // error handled by mutation
    }
  };

  const handleCompleteReservation = async () => {
    if (!selectedReservation) return;
    try {
      await completeReservation.mutateAsync({ 
        reservationId: selectedReservation.reservation_id, 
        dto: { returned_odometer: 0 } 
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleCancelReservation = async (rejectionComment: string) => {
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

  // const handleApproveReservation = async (reservation: Reservation) => {
  //   try {
  //     await updateReservation.mutateAsync({ 
  //       id: reservation.reservation_id, 
  //       dto: { status: 'APPROVED' } 
  //     });
  //   } catch {
  //     // error handled by mutation
  //   }
  // };

  const handleUpdateReservationReason = async () => {
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
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAssignVehicle = (reservation: Reservation) => {
    return reservation.reservation_status === 'APPROVED' && 
           (!reservation.reserved_vehicles || reservation.reserved_vehicles.length === 0);
  };

  // const canStartReservation = (reservation: Reservation) => {
  //   return reservation.reservation_status === 'APPROVED' && 
  //          reservation.reserved_vehicles && 
  //          reservation.reserved_vehicles.length > 0;
  // };

  const canCompleteReservation = (reservation: Reservation) => {
    return reservation.reservation_status === 'IN_PROGRESS';
  };

  // const canApprove = (reservation: Reservation) => {
  //   return reservation.reservation_status === 'UNDER_REVIEW';
  // };

  const canReject = (reservation: Reservation) => {
    return reservation.reservation_status === 'UNDER_REVIEW';
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
          {reservationAccess?.create && (
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
          <div className="p-8 text-center text-red-500">Failed to load reservations. Please try again.</div>
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
                
               
                
                <div className="text-xs text-gray-500 mt-2">Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleString() : 'N/A'}</div>
                <div className="text-xs text-gray-500">User: {reservation.user ? `${reservation.user.first_name} ${reservation.user.last_name}` : 'N/A'}</div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {/* Approve/Reject Button */}
                  {(reservationAccess?.approve || reservationAccess?.cancel) && reservation.reservation_status === 'UNDER_REVIEW' && (
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
                
                  {/* Only show Reject/Cancel if user has cancel permission */}
                  {reservationAccess?.cancel && canReject(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowCancelReservation(true); }}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                  {/* Only show Assign Vehicle if user has assignVehicle permission */}
                  {reservationAccess?.assignVehicle && canAssignVehicle(reservation) && (
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
                  {/* Only show Complete if user has complete permission */}
                  {reservationAccess?.complete && canCompleteReservation(reservation) && (
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
                  {/* Only show Edit Reason if user has updateReason permission */}
                  {reservationAccess?.updateReason && (
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

      <StartReservationModal
        open={showStartReservation}
        onClose={() => setShowStartReservation(false)}
        reservation={selectedReservation}
        onStart={handleStartReservation}
        isLoading={startReservation.isPending}
      />
      <OdometerFuelModal
        open={showOdometerModal}
        onClose={() => { setShowOdometerModal(false); setOdometerVehicleId(null); }}
        onSubmit={handleOdometerFuelSubmit}
        isLoading={odometerFuelMutation.isPending}
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
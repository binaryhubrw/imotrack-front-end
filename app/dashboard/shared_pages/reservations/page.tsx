'use client'
import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Search, Car, CheckCircle, XCircle, Play, Square
} from 'lucide-react';
import { useReservations, useCreateReservation, useCancelReservation, useUpdateReservation, useVehicleReservationAssignment, useStartReservation, useCompleteReservation, useDeleteReservation, useVehicles } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Reservation, CreateReservationDto, ReservationStatus } from '@/types/next-auth';
import { SkeletonReservationCard } from '@/components/ui/skeleton';

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

function AssignVehicleModal({ open, onClose, reservation, onAssign, isLoading }: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onAssign: (vehicleId: string) => void;
  isLoading: boolean;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const { data: vehicles } = useVehicles();

  const availableVehicles = useMemo(() => {
    return vehicles?.filter(v => v.vehicle_status === 'AVAILABLE') || [];
  }, [vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    await onAssign(selectedVehicle);
    setSelectedVehicle('');
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Assign Vehicle</h2>
        <p className="text-sm text-gray-600 mb-4">Select a vehicle to assign to this reservation</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Available Vehicles</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0872b3] focus:border-[#0872b3] transition shadow-sm">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id} className="hover:bg-blue-50 focus:bg-blue-100 px-3 py-2 cursor-pointer">
                    {vehicle.plate_number} - {vehicle.vehicle_model?.vehicle_model_name || 'Unknown Model'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full text-white bg-[#0872b3]" disabled={isLoading || !selectedVehicle}>
            {isLoading ? 'Assigning...' : 'Assign Vehicle'}
          </Button>
        </form>
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
          <Button type="submit" className="w-full" disabled={isLoading || !rejectionComment.trim()}>
            {isLoading ? 'Cancelling...' : 'Cancel Reservation'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignVehicle, setShowAssignVehicle] = useState(false);
  const [showStartReservation, setShowStartReservation] = useState(false);
  const [showCompleteReservation, setShowCompleteReservation] = useState(false);
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reservations, isLoading, isError } = useReservations();
  const createReservation = useCreateReservation();
  const deleteReservation = useDeleteReservation();
  const assignVehicle = useVehicleReservationAssignment();
  const startReservation = useStartReservation();
  const completeReservation = useCompleteReservation();
  const cancelReservation = useCancelReservation();
  const updateReservation = useUpdateReservation();

  // Filter reservations based on search term
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter(reservation =>
      reservation.reservation_purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.reservation_destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservations, searchTerm]);

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

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReservation.mutateAsync({ id: deleteId });
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleAssignVehicle = async (vehicleId: string) => {
    if (!selectedReservation) return;
    try {
      await assignVehicle.mutateAsync({ 
        id: selectedReservation.reservation_id, 
        dto: { vehicle_id: vehicleId } 
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleStartReservation = async () => {
    if (!selectedReservation) return;
    try {
      const reservedVehicleId = selectedReservation.reserved_vehicles && selectedReservation.reserved_vehicles.length > 0
        ? selectedReservation.reserved_vehicles[0].reserved_vehicle_id
        : undefined;
      if (!reservedVehicleId) {
        throw new Error('No reserved vehicle found for this reservation.');
      }
      await startReservation.mutateAsync({ 
        reservedVehicleId,
        dto: { starting_odometer: 0, fuel_provided: 0 } 
      });
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

  const handleApproveReservation = async (reservation: Reservation) => {
    try {
      await updateReservation.mutateAsync({ 
        id: reservation.reservation_id, 
        dto: { status: 'APPROVED' } 
      });
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

  const canStartReservation = (reservation: Reservation) => {
    return reservation.reservation_status === 'APPROVED' && 
           reservation.reserved_vehicles && 
           reservation.reserved_vehicles.length > 0;
  };

  const canCompleteReservation = (reservation: Reservation) => {
    return reservation.reservation_status === 'IN_PROGRESS';
  };

  const canApprove = (reservation: Reservation) => {
    return reservation.reservation_status === 'UNDER_REVIEW';
  };

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
          <Button className="flex items-center gap-2 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold px-5 py-3 rounded-lg transition-colors duration-200" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Add Reservation
          </Button>
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
            {filteredReservations.map((reservation) => (
              <div key={reservation.reservation_id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    {reservation.reservation_purpose}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.reservation_status)}`}>
                    {RESERVATION_STATUSES[reservation.reservation_status]}
                  </span>
                </div>
                
                <div className="text-gray-600 text-sm">From: {reservation.start_location}</div>
                <div className="text-gray-600 text-sm">To: {reservation.reservation_destination}</div>
                <div className="text-gray-600 text-sm">Departure: {reservation.departure_date ? new Date(reservation.departure_date).toLocaleString() : 'N/A'}</div>
                <div className="text-gray-600 text-sm">Return: {reservation.expected_returning_date ? new Date(reservation.expected_returning_date).toLocaleString() : 'N/A'}</div>
                
                                 {reservation.reserved_vehicles && reservation.reserved_vehicles.length > 0 && (
                   <div className="text-gray-600 text-sm">
                     Vehicle ID: {reservation.reserved_vehicles[0].vehicle_id}
                   </div>
                 )}
                
                <div className="text-xs text-gray-500 mt-2">Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleString() : 'N/A'}</div>
                <div className="text-xs text-gray-500">User: {reservation.user ? `${reservation.user.first_name} ${reservation.user.last_name}` : 'N/A'}</div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {canApprove(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={(e) => { e.stopPropagation(); handleApproveReservation(reservation); }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {canReject(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowCancelReservation(true); }}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  )}
                  
                  {canAssignVehicle(reservation) && (
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
                  
                  {canStartReservation(reservation) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); setShowStartReservation(true); }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
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
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); handleDelete(reservation.reservation_id); }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
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
        onAssign={handleAssignVehicle}
        isLoading={assignVehicle.isPending}
      />

      <StartReservationModal
        open={showStartReservation}
        onClose={() => setShowStartReservation(false)}
        reservation={selectedReservation}
        onStart={handleStartReservation}
        isLoading={startReservation.isPending}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Delete Reservation</h2>
            <p>Are you sure you want to delete this reservation? This action cannot be undone.</p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation, useCreateVehicleIssue, useCompleteReservation, useUpdateReservation, useCancelReservation, useReservationVehiclesOdometerAssignation, useUpdateReservationReason, useVehicles } from "@/lib/queries";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateVehicleIssueDto, ReservedVehicle } from "@/types/next-auth";
import ErrorUI from "@/components/ErrorUI";

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: reservation, isLoading, isError } = useReservation(id);
  const { user, isLoading: authLoading } = useAuth();
  const createIssue = useCreateVehicleIssue();
  const completeReservation = useCompleteReservation();
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();
  const assignVehicleOdometer = useReservationVehiclesOdometerAssignation();
  const updateReservationReason = useUpdateReservationReason();
  const { data: vehicles = [] } = useVehicles();

  // Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<ReservedVehicle | null>(null);
  const [issueForm, setIssueForm] = useState({
    issue_title: "",
    issue_description: "",
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [returnedOdometer, setReturnedOdometer] = useState<number | null>(null);

  // Modal state for new actions
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [approveRejectReason, setApproveRejectReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showAssignVehicleModal, setShowAssignVehicleModal] = useState(false);
  const [vehicleAssignments, setVehicleAssignments] = useState<Array<{
    vehicle_id: string;
    starting_odometer: string;
    fuel_provided: string;
  }>>([{ vehicle_id: '', starting_odometer: '', fuel_provided: '' }]);
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [editReason, setEditReason] = useState('');

  // Permission checks
  const canView = !!user?.position?.position_access?.reservations?.view;
  const canReportIssue =
    !!user?.position?.position_access?.vehicleIssues?.report;
  const canCompleteReservation =
    !!user?.position?.position_access?.reservations?.complete;
  const canApprove = !!user?.position?.position_access?.reservations?.approve;
  const canCancel = !!user?.position?.position_access?.reservations?.cancel;
  const canAssignVehicle = !!user?.position?.position_access?.reservations?.assignVehicle;
  const canUpdateReason = !!user?.position?.position_access?.reservations?.updateReason;

  // Helper: is reservation assigned a vehicle?
  const hasAssignedVehicle = reservation?.reserved_vehicles && reservation.reserved_vehicles.length > 0;

  const handleReportIssue = (vehicle: ReservedVehicle) => {
    setSelectedVehicle(vehicle);
    setShowReportModal(true);
  };

  const handleSubmitIssue = async () => {
    if (
      !selectedVehicle ||
      !issueForm.issue_title.trim() ||
      !issueForm.issue_description.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const issueData: CreateVehicleIssueDto = {
      issue_title: issueForm.issue_title,
      issue_description: issueForm.issue_description,
      reserved_vehicle_id: selectedVehicle.reserved_vehicle_id,
      issue_date: new Date().toISOString(),
    };

    createIssue.mutate(issueData, {
      onSuccess: () => {
        setShowReportModal(false);
        setIssueForm({ issue_title: "", issue_description: "" });
        setSelectedVehicle(null);

        // Redirect to vehicle issues page
        router.push("/dashboard/shared_pages/vehicle-issues");
      },
      onError: (error) => {
        console.error("Error creating issue:", error);
        // Error toast is already handled by the hook
      },
    });
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setIssueForm({ issue_title: "", issue_description: "" });
    setSelectedVehicle(null);
  };

  const handleCompleteReservation = async () => {
    if (!selectedVehicle || returnedOdometer === null) {
      toast.error("Please fill in all fields");
      return;
    }

    const completeData = {
      reservedVehicleId: selectedVehicle.reserved_vehicle_id,
      dto: {
        returned_odometer: returnedOdometer,
      },
    };

    completeReservation.mutate(completeData, {
      onSuccess: () => {
        setShowCompleteModal(false);
        setReturnedOdometer(null);
        // Redirect to reservation details or refresh
        router.refresh();
      },
      onError: (error) => {
        console.error("Error completing reservation:", error);
        // Error toast is already handled by the hook
      },
    });
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    setReturnedOdometer(null);
  };

  // Action handlers
  const handleApproveReject = async () => {
    if (!reservation) return;
    await updateReservation.mutateAsync({
      id: reservation.reservation_id,
      dto: { status: approveRejectAction, reason: approveRejectReason },
    });
    setShowApproveRejectModal(false);
    setApproveRejectReason('');
    setApproveRejectAction('APPROVED');
    router.refresh();
  };
  const handleCancel = async () => {
    if (!reservation) return;
    await cancelReservation.mutateAsync({
      id: reservation.reservation_id,
      dto: { reason: cancelReason },
    });
    setShowCancelModal(false);
    setCancelReason('');
    router.refresh();
  };
  // Helper functions for vehicle assignments
  const addVehicleAssignment = () => {
    setVehicleAssignments(prev => [...prev, { vehicle_id: '', starting_odometer: '', fuel_provided: '' }]);
  };

  const removeVehicleAssignment = (index: number) => {
    setVehicleAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const updateVehicleAssignment = (index: number, field: string, value: string) => {
    setVehicleAssignments(prev => 
      prev.map((assignment, i) => 
        i === index ? { ...assignment, [field]: value } : assignment
      )
    );
  };

  const handleAssignVehicle = async () => {
    if (!reservation) return;
    
    // Validate that all assignments have required fields
    const validAssignments = vehicleAssignments.filter(
      assignment => assignment.vehicle_id && assignment.starting_odometer && assignment.fuel_provided
    );
    
    if (validAssignments.length === 0) {
      toast.error("Please fill in all required fields for at least one vehicle");
      return;
    }
    
    await assignVehicleOdometer.mutateAsync({
      id: reservation.reservation_id,
      dto: {
        vehicles: validAssignments.map(assignment => ({
          vehicle_id: assignment.vehicle_id,
          starting_odometer: Number(assignment.starting_odometer),
          fuel_provided: Number(assignment.fuel_provided),
        })),
      },
    });
    setShowAssignVehicleModal(false);
    setVehicleAssignments([{ vehicle_id: '', starting_odometer: '', fuel_provided: '' }]);
    router.refresh();
  };
  const handleEditReason = async () => {
    if (!reservation) return;
    await updateReservationReason.mutateAsync({
      id: reservation.reservation_id,
      reason: editReason,
    });
    setShowEditReasonModal(false);
    setEditReason('');
    router.refresh();
  };

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="reservations" />;
  }

  if (isLoading) {
    return <SkeletonEntityDetails />;
  }

  if (isError || !reservation) {
    return (
     <ErrorUI
             resource={`reservation ${reservation?.reservation_purpose}`}
             onRetry={() => {
               // re-fetch your data
               router.refresh();
             }}
             onBack={() => {
               router.back();
             }}
           />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
      case "CANCELED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "UNDER_REVIEW":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-[#0872b3] hover:text-[#065d8f]"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>
        </div>
        {/* Actions Section */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Approve/Reject */}
          {canApprove && reservation.reservation_status === 'UNDER_REVIEW' && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowApproveRejectModal(true)}
              disabled={updateReservation.isPending}
            >
              {updateReservation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approve / Reject
                </div>
              )}
            </Button>
          )}
          {/* Cancel */}
          {canCancel &&
            (reservation.reservation_status === 'UNDER_REVIEW' || reservation.reservation_status === 'APPROVED') && (
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelReservation.isPending}
              >
                {cancelReservation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Canceling...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Cancel Reservation
                  </div>
                )}
              </Button>
            )}
          {/* Assign Vehicle */}
          {canAssignVehicle &&
            reservation.reservation_status === 'APPROVED' &&
            !hasAssignedVehicle && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowAssignVehicleModal(true)}
                disabled={assignVehicleOdometer.isPending}
              >
                {assignVehicleOdometer.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Assign Vehicle
                  </div>
                )}
              </Button>
            )}
          {/* Edit Reason */}
          {canUpdateReason &&
            ['REJECTED', 'CANCELED', 'CANCELLED'].includes(reservation.reservation_status) && (
              <Button
                className="bg-yellow-600 text-white hover:bg-yellow-700"
                onClick={() => setShowEditReasonModal(true)}
                disabled={updateReservationReason.isPending}
              >
                {updateReservationReason.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Edit Reason
                  </div>
                )}
              </Button>
            )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Main Reservation Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#0872b3] text-white p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reservation Details</h1>
                <Badge
                  className={`${getStatusColor(
                    reservation.reservation_status
                  )} flex items-center gap-1 text-sm px-3 py-1`}
                >
                  {getStatusIcon(reservation.reservation_status)}
                  {reservation.reservation_status}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              {/* Purpose and Description - Full Width */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                    Purpose
                  </div>
                  <div className="font-medium text-gray-900">
                    {reservation.reservation_purpose}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                    Description
                  </div>
                  <div className="font-medium text-gray-900">
                    {reservation.description}
                  </div>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Start Location
                  </div>
                  <div className="font-medium text-gray-900">
                    {reservation.start_location}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Destination
                  </div>
                  <div className="font-medium text-gray-900">
                    {reservation.reservation_destination}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Passengers
                  </div>
                  <div className="font-medium text-gray-900">
                    {reservation.passengers}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Departure Date
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(reservation.departure_date)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expected Return
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(reservation.expected_returning_date)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(reservation.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-[#0872b3]" />
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Name
                </div>
                <div className="font-medium text-gray-900">
                  {reservation.user.first_name} {reservation.user.last_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <div className="font-medium text-gray-900">
                  {reservation.user.auth.email}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  User Telephone
                </div>
                <div className="font-medium text-gray-900 text-sm">
                  {reservation.user.user_phone}
                </div>
              </div>
            </div>
          </div>

          {/* Reserved Vehicles Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Car className="w-6 h-6 text-[#0872b3]" />
                Reserved Vehicles ({reservation.reserved_vehicles.length})
              </h2>
            </div>

            {reservation.reserved_vehicles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reservation.reserved_vehicles.map((reservedVehicle) => {
                  const isOccupied =
                    reservedVehicle.vehicle.vehicle_status === "OCCUPIED";
                  const cardColor = isOccupied
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200";
                  const canReportIssueForThisVehicle =
                    canReportIssue &&
                    reservation.reservation_status === "APPROVED";
                  const canCompleteThisReservation =
                    canCompleteReservation &&
                    isOccupied &&
                    (reservation.reservation_status === "IN_PROGRESS" || 
                     reservation.reservation_status === "APPROVED");

                  return (
                    <div
                      key={reservedVehicle.reserved_vehicle_id}
                      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${cardColor}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">
                          {reservedVehicle.vehicle.vehicle_name}
                        </h4>
                        <Badge
                          className={`text-xs ${
                            isOccupied
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {reservedVehicle.vehicle.vehicle_status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plate Number:</span>
                          <span className="font-medium text-gray-900">
                            {reservedVehicle.vehicle.plate_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium text-gray-900">
                            {reservedVehicle.vehicle.vehicle_capacity}
                          </span>
                        </div>
                        {reservedVehicle.starting_odometer && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Start Odometer:
                            </span>
                            <span className="font-medium text-gray-900">
                              {reservedVehicle.starting_odometer} km
                            </span>
                          </div>
                        )}
                        {reservedVehicle.fuel_provided && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Fuel Provided:
                            </span>
                            <span className="font-medium text-gray-900">
                              {reservedVehicle.fuel_provided} L
                            </span>
                          </div>
                        )}
                        {reservedVehicle.returned_odometer && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Return Odometer:
                            </span>
                            <span className="font-medium text-gray-900">
                              {reservedVehicle.returned_odometer} km
                            </span>
                          </div>
                        )}
                        {reservedVehicle.returned_date && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600 text-xs">
                              Returned:
                            </span>
                            <div className="font-medium text-gray-900 text-xs">
                              {formatDate(reservedVehicle.returned_date)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Report Issue Button */}
                      {canReportIssueForThisVehicle && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleReportIssue(reservedVehicle)}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Report Issue
                          </Button>
                        </div>
                      )}

                      {/* Complete Reservation Button */}
                      {canCompleteThisReservation && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                            onClick={() => {
                              setSelectedVehicle(reservedVehicle);
                              setShowCompleteModal(true);
                            }}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Return Vehicle
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No Vehicles Assigned</p>
                <p className="text-sm">
                  No vehicles have been assigned to this reservation yet.
                </p>
              </div>
            )}
          </div>

          {/* Additional Information Card */}
          {(reservation.reviewed_at || reservation.rejection_comment) && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <AlertTriangle className="w-6 h-6 text-[#0872b3]" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservation.reviewed_at && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Reviewed At
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatDate(reservation.reviewed_at)}
                    </div>
                  </div>
                )}
                {reservation.rejection_comment && (
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <div className="text-xs text-cyan-600 uppercase font-medium mb-1">
                      Approve/Reject Reason
                    </div>
                    <div className="font-medium text-orange-900">
                      {reservation.rejection_comment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Report Vehicle Issue
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {selectedVehicle && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Vehicle Details
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Vehicle:</span>{" "}
                    {selectedVehicle.vehicle.vehicle_name}
                  </p>
                  <p>
                    <span className="font-medium">Plate Number:</span>{" "}
                    {selectedVehicle.vehicle.plate_number}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="issue_title"
                className="text-sm font-medium text-gray-700"
              >
                Issue Title *
              </Label>
              <Input
                id="issue_title"
                placeholder="Brief description of the issue"
                value={issueForm.issue_title}
                onChange={(e) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    issue_title: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="issue_description"
                className="text-sm font-medium text-gray-700"
              >
                Issue Description *
              </Label>
              <Textarea
                id="issue_description"
                placeholder="Detailed description of the issue..."
                rows={4}
                value={issueForm.issue_description}
                onChange={(e) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    issue_description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitIssue}
              disabled={
                createIssue.isPending ||
                !issueForm.issue_title.trim() ||
                !issueForm.issue_description.trim()
              }
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {createIssue.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Reporting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Report Issue
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Reservation Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <CheckSquare className="w-6 h-6 text-green-500" />
              Return Vehicle
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {selectedVehicle && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-green-600" />
                  Vehicle Details
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Vehicle:</span>{" "}
                    {selectedVehicle.vehicle.vehicle_name}
                  </p>
                  <p>
                    <span className="font-medium">Plate Number:</span>{" "}
                    {selectedVehicle.vehicle.plate_number}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="returned_odometer"
                className="text-sm font-medium text-gray-700"
              >
                Returned Odometer (km) *
              </Label>
              <Input
                id="returned_odometer"
                type="number"
                placeholder="Enter returned odometer reading"
                value={returnedOdometer || ""}
                onChange={(e) => setReturnedOdometer(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCloseCompleteModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteReservation}
              disabled={
                completeReservation.isPending ||
                returnedOdometer === null
              }
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {completeReservation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Returning...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Return Vehicle
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${showApproveRejectModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Approve or Reject Reservation
            </h2>
            <button
              onClick={() => setShowApproveRejectModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleApproveReject(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action *
                </label>
                <select
                  value={approveRejectAction}
                  onChange={e => setApproveRejectAction(e.target.value as 'APPROVED' | 'REJECTED')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason {approveRejectAction === 'REJECTED' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={approveRejectReason}
                  onChange={e => setApproveRejectReason(e.target.value)}
                  rows={3}
                  required={approveRejectAction === 'REJECTED'}
                  placeholder={approveRejectAction === 'REJECTED' ? 'Enter reason for rejection' : 'Optional reason for approval'}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowApproveRejectModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateReservation.isPending || (approveRejectAction === 'REJECTED' && !approveRejectReason.trim())}
                  className="flex-1 px-4 py-2 text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateReservation.isPending ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Cancel Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${showCancelModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Cancel Reservation
            </h2>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleCancel(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter reason for cancellation"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cancelReservation.isPending || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelReservation.isPending ? 'Canceling...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Assign Vehicle Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${showAssignVehicleModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Assign Vehicles
            </h2>
            <button
              onClick={() => setShowAssignVehicleModal(false)}
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
                <strong>Passengers:</strong> {reservation?.passengers || 0}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Available Vehicles:</strong> {vehicles.filter(v => v.vehicle_status === 'AVAILABLE' && v.vehicle_capacity >= (reservation?.passengers || 1)).length}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssignVehicle(); }} className="space-y-4">
              {/* Vehicle Assignments */}
              {vehicleAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Vehicle {index + 1}
                    </h3>
                    {vehicleAssignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicleAssignment(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Vehicle Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle *
                      </label>
                      <select
                        value={assignment.vehicle_id}
                        onChange={(e) =>
                          updateVehicleAssignment(
                            index,
                            "vehicle_id",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.filter(v => v.vehicle_status === 'AVAILABLE' && v.vehicle_capacity >= (reservation?.passengers || 1)).length === 0 ? (
                          <option disabled>No suitable vehicles available</option>
                        ) : (
                          vehicles
                            .filter(v => v.vehicle_status === 'AVAILABLE' && v.vehicle_capacity >= (reservation?.passengers || 1))
                            .map((vehicle) => (
                              <option
                                key={vehicle.vehicle_id}
                                value={vehicle.vehicle_id}
                              >
                                {vehicle.plate_number} -{" "}
                                {vehicle.vehicle_model?.vehicle_model_name ||
                                  "Unknown"}{" "}
                                (Capacity: {vehicle.vehicle_capacity || 0})
                              </option>
                            ))
                        )}
                      </select>
                    </div>

                    {/* Odometer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Odometer *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={assignment.starting_odometer}
                        onChange={(e) =>
                          updateVehicleAssignment(
                            index,
                            "starting_odometer",
                            e.target.value
                          )
                        }
                        placeholder="Odometer reading"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Fuel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuel Provided (L) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={assignment.fuel_provided}
                        onChange={(e) =>
                          updateVehicleAssignment(
                            index,
                            "fuel_provided",
                            e.target.value
                          )
                        }
                        placeholder="Fuel amount"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Vehicle Button */}
              {vehicles.filter(v => v.vehicle_status === 'AVAILABLE' && v.vehicle_capacity >= (reservation?.passengers || 1)).length > vehicleAssignments.length && (
                <button
                  type="button"
                  onClick={addVehicleAssignment}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Another Vehicle
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignVehicleModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignVehicleOdometer.isPending || vehicles.filter(v => v.vehicle_status === 'AVAILABLE' && v.vehicle_capacity >= (reservation?.passengers || 1)).length === 0}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignVehicleOdometer.isPending
                    ? "Assigning..."
                    : `Assign ${vehicleAssignments.length} Vehicle${
                        vehicleAssignments.length > 1 ? "s" : ""
                      }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Edit Reason Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${showEditReasonModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Reason
            </h2>
            <button
              onClick={() => setShowEditReasonModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleEditReason(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter new reason"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditReasonModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateReservationReason.isPending || !editReason.trim()}
                  className="flex-1 px-4 py-2 text-white bg-yellow-600 border border-yellow-600 rounded-md hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateReservationReason.isPending ? 'Updating...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

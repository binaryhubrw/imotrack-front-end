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
  User,
  Mail,
  AlertCircle,
  CheckSquare,
  Minus,
  Plus,
  PersonStanding,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useReservation,
  useUpdateReservation,
  useCancelReservation,
  useUpdateReservationReason,
  useReservationVehiclesOdometerAssignation,
  useCompleteReservation,
  useAssignMultipleVehicles,
  useVehicles,
  useCreateVehicleIssue,
  useAddVehicleToReservation,
  useRemoveVehicleFromReservation,
} from "@/lib/queries";
import {
  SkeletonEntityDetails,
  SkeletonReservationDetailPage,
} from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ReservedVehicle } from "@/types/next-auth";
import ErrorUI from "@/components/ErrorUI";
import ReservationActions from "./components/ReservationActions";
import ReservationModals from "./components/ReservationModals";

export default function ReservationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  // Data fetching
  const { data: reservation, isLoading, isError } = useReservation(id);
  const { user, isLoading: authLoading } = useAuth();
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();
  const addVehicleToReservation = useAddVehicleToReservation();
  const removeVehicleFromReservation = useRemoveVehicleFromReservation();
  const assignVehicleOdometer = useReservationVehiclesOdometerAssignation();
  const updateReservationReason = useUpdateReservationReason();
  const completeReservation = useCompleteReservation();
  const assignMultipleVehicles = useAssignMultipleVehicles();
  const createVehicleIssue = useCreateVehicleIssue();
  const { data: vehicles = [] } = useVehicles();

  // Modal states - must be before early returns
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState(false);
  const [showAssignVehiclesModal, setShowAssignVehiclesModal] = useState(false);
  const [showApproveWithOdometerModal, setShowApproveWithOdometerModal] =
    useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  // Add this near your other modal states:
  const [showRemoveVehicleModal, setShowRemoveVehicleModal] = useState(false);
  // ADD this state near other modal states:
  const [selectedVehicleToRemove, setSelectedVehicleToRemove] = useState("");
  const [selectedVehicle, setSelectedVehicle] =
    useState<ReservedVehicle | null>(null);
  const [vehicleToComplete, setVehicleToComplete] =
    useState<ReservedVehicle | null>(null);

  // Show loading state while data is being fetched
  if (isLoading || authLoading) {
    return <SkeletonReservationDetailPage />;
  }

  // Show error state if data fetch failed
  if (isError || !reservation) {
    return (
      <ErrorUI
        resource="users"
        onRetry={() => {
          // re-fetch your data
          window.location.reload();
        }}
        onBack={() => {
          router.back();
        }}
      />
    );
  }

  // Permission checks
  //User//requester checks
  const canCreate = !!user?.position?.position_access?.reservations?.create;
  const canViewOwn = !!user?.position?.position_access?.reservations?.viewOwn;
  const canCancel = !!user?.position?.position_access?.reservations?.cancel;
  const canUpdateReason =
    !!user?.position?.position_access?.reservations?.updateReason;

  //Fleet-manager//Approver checks
  const canView = !!user?.position?.position_access?.reservations?.view;
  const canUpdate = !!user?.position?.position_access?.reservations?.update;
  const canComplete = !!user?.position?.position_access?.reservations?.complete;

  // Check if user can access this reservation
  const isOwner =
    reservation?.user?.user_id === user?.user?.email ||
    reservation?.user?.auth?.email === user?.user?.email;
  const canAccessReservation =
    canView || // Fleet manager can view all
    (canViewOwn && isOwner) || // Requester can view own
    canCreate; // Anyone who can create can view

  // Early return if user cannot access this reservation
  if (!canAccessReservation) {
    return <NoPermissionUI resource="reservations" />;
  }

  const shouldShowComplete =
    reservation?.reservation_status === "APPROVED" &&
    (canComplete || canUpdate);

  const shouldShowReportIssue =
    reservation?.reservation_status === "APPROVED" &&
    isOwner &&
    (canViewOwn || canCancel || canUpdateReason || canCreate);

  // Action handlers
  const handleAcceptReject = async (
    action: "ACCEPT" | "REJECT",
    reason: string,
    selectedVehicleIds?: string[]
  ) => {
    if (!reservation) return;

    try {
      if (action === "ACCEPT") {
        // Assign vehicles which automatically sets status to ACCEPTED
        if (selectedVehicleIds && selectedVehicleIds.length > 0) {
          await assignMultipleVehicles.mutateAsync({
            reservationId: reservation.reservation_id,
            vehicleIds: selectedVehicleIds,
          });
        } else {
          // If no vehicles selected, just update status to ACCEPTED
          await updateReservation.mutateAsync({
            id: reservation.reservation_id,
            dto: {
              status: "ACCEPTED",
              reason: reason || "Reservation accepted",
            },
          });
        }
      } else {
        // For rejection, just update the status
        await updateReservation.mutateAsync({
          id: reservation.reservation_id,
          dto: {
            status: "REJECTED",
            reason: reason,
          },
        });
      }

      // Close modal immediately after success
      setShowAcceptRejectModal(false);
    } catch (error) {
      console.error("Error handling accept/reject:", error);
    }
  };

  const handleAddVehicle = async (vehicleId: string) => {
    if (!reservation) return;

    try {
      await addVehicleToReservation.mutateAsync({
        id: reservation.reservation_id,
        dto: { vehicle_id: vehicleId },
      });
      setShowAddVehicleModal(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    if (!reservation) return;

    try {
      await removeVehicleFromReservation.mutateAsync({
        id: reservation.reservation_id,
        dto: { vehicle_id: vehicleId },
      });
      setShowRemoveVehicleModal(false);
    } catch (error) {
      console.error("Error removing vehicle:", error);
    }
  };

  const handleAssignVehicles = async (
    vehicles: Array<{
      vehicle_id: string;
      starting_odometer: number;
      fuel_provided: number;
    }>
  ) => {
    if (!reservation) return;

    try {
      // Update vehicles with odometer and fuel data (this should also update status to ACCEPTED)
      await assignVehicleOdometer.mutateAsync({
        id: reservation.reservation_id,
        dto: { vehicles },
      });

      // Close modal immediately after success
      setShowAssignVehiclesModal(false);
    } catch (error) {
      console.error("Error assigning vehicles:", error);
    }
  };

  const handleApproveWithOdometer = async (
    vehicles: Array<{
      vehicle_id: string;
      starting_odometer: number;
      fuel_provided: number;
    }>
  ) => {
    if (!reservation) return;

    try {
      // Update vehicles with odometer and fuel data (this should also update status to APPROVED)
      await assignVehicleOdometer.mutateAsync({
        id: reservation.reservation_id,
        dto: { vehicles },
      });

      // Close modal immediately after success
      setShowApproveWithOdometerModal(false);
    } catch (error) {
      console.error("Error approving with odometer:", error);
    }
  };
  const onCloseAddVehicle = () => setShowAddVehicleModal(false);
  const onCloseRemoveVehicle = () => setShowRemoveVehicleModal(false);

  const handleCompleteReservation = async (
    reservedVehicleId: string,
    returnedOdometer: number
  ) => {
    if (!reservation) return;

    try {
      await completeReservation.mutateAsync({
        reservedVehicleId,
        dto: { returned_odometer: returnedOdometer },
      });

      // Close modal immediately after success
      setShowCompleteModal(false);
      setVehicleToComplete(null);
    } catch (error) {
      console.error("Error completing reservation:", error);
    }
  };

  const handleCancelReservation = async (reason: string) => {
    if (!reservation) return;

    try {
      await cancelReservation.mutateAsync({
        id: reservation.reservation_id,
        dto: { reason },
      });

      // Close modal immediately after success
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    }
  };

  const handleEditReason = async (reason: string) => {
    if (!reservation) return;

    try {
      await updateReservationReason.mutateAsync({
        id: reservation.reservation_id,
        dto: { reason },
      });

      // Close modal immediately after success
      setShowEditReasonModal(false);
    } catch (error) {
      console.error("Error updating reason:", error);
    }
  };

  const handleReportIssue = async (issueData: {
    issue_title: string;
    issue_description: string;
    reserved_vehicle_id: string;
    issue_date: string;
  }) => {
    try {
      await createVehicleIssue.mutateAsync(issueData);
      setShowReportIssueModal(false);
      setSelectedVehicle(null);
      router.push("/dashboard/shared_pages/vehicle-issues");
    } catch (error) {
      console.error("Error reporting issue:", error);
    }
  };

  // Modal close handlers
  const onCloseAcceptReject = () => setShowAcceptRejectModal(false);
  const onCloseAssignVehicles = () => setShowAssignVehiclesModal(false);
  const onCloseApproveWithOdometer = () =>
    setShowApproveWithOdometerModal(false);
  const onCloseComplete = () => {
    setShowCompleteModal(false);
    setVehicleToComplete(null);
  };
  const onCloseCancel = () => setShowCancelModal(false);
  const onCloseEditReason = () => setShowEditReasonModal(false);
  const onCloseReportIssue = () => {
    setShowReportIssueModal(false);
    setSelectedVehicle(null);
  };

  if (isLoading) {
    return <SkeletonEntityDetails />;
  }

  if (isError || !reservation) {
    return (
      <ErrorUI
        resource={`reservation ${reservation?.reservation_purpose}`}
        onRetry={() => {
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
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CANCELLED":
      case "CANCELED":
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "UNDER_REVIEW":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "CANCELLED":
      case "CANCELED":
        return <XCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
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
              Requester Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Name
                </div>
                <div className="font-medium text-gray-900">
                  {reservation.user?.first_name} {reservation.user?.last_name}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <div className="font-medium text-gray-900">
                  {reservation.user?.auth?.email || "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  User Telephone
                </div>
                <div className="font-medium text-gray-900 text-sm">
                  {reservation.user?.user_phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <PersonStanding className="w-6 h-6 text-[#0872b3]" />
               Reservation Status Overview
            </h2>

            {/* Action Timeline */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Reviewed */}
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-medium">
      <UserCheck className="w-4 h-4 text-blue-600" />
      Reviewed At
    </div>
    <div className="font-medium text-gray-900 text-sm">
      {reservation.reviewed_at ? formatDate(reservation.reviewed_at) : "N/A"}
    </div>
    {reservation.reviewer && (
      <div className="text-xs text-gray-600 mt-1">
        by {reservation.reviewer.first_name} {reservation.reviewer.last_name}
      </div>
    )}
  </div>

  {/* Approved */}
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-medium">
      <CheckCircle className="w-4 h-4 text-green-600" />
      Approved At
    </div>
    <div className="font-medium text-gray-900 text-sm">
      {reservation.approved_at ? formatDate(reservation.approved_at) : "Pending"}
    </div>
    {reservation.approver && (
      <div className="text-xs text-gray-600 mt-1">
        by {reservation.approver.first_name} {reservation.approver.last_name}
      </div>
    )}
  </div>

  {/* Completed */}
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-medium">
      <Clock className="w-4 h-4 text-purple-600" />
      Completed At
    </div>
    <div className="font-medium text-gray-900 text-sm">
      {reservation.completed_at ? formatDate(reservation.completed_at) : "Not completed"}
    </div>
    {reservation.completer && (
      <div className="text-xs text-gray-600 mt-1">
        by {reservation.completer.first_name} {reservation.completer.last_name}
      </div>
    )}
  </div>

  {/* Canceled */}
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-medium">
      <XCircle className="w-4 h-4 text-red-600" />
      Canceled At
    </div>
    <div className="font-medium text-gray-900 text-sm">
      {reservation.canceled_at ? formatDate(reservation.canceled_at) : "Not canceled"}
    </div>
    {reservation.canceler && (
      <div className="text-xs text-gray-600 mt-1">
        by {reservation.canceler.first_name} {reservation.canceler.last_name}
      </div>
    )}
  </div>
</div>

          </div>

          {/* Reserved Vehicles Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Car className="w-6 h-6 text-[#0872b3]" />
                Reserved Vehicles ({reservation.reserved_vehicles?.length || 0})
              </h2>

              {/* Add vehicle or other top-level actions can go here */}
              {reservation?.reservation_status === "ACCEPTED" && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => setShowAddVehicleModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              )}
            </div>

            {reservation.reserved_vehicles &&
            reservation.reserved_vehicles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reservation.reserved_vehicles.map(
                  (reservedVehicle: ReservedVehicle) => {
                    const isOccupied =
                      reservedVehicle.vehicle.vehicle_status === "OCCUPIED";
                    const cardColor = isOccupied
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200";
                    const canReportIssueForThisVehicle = shouldShowReportIssue;
                    const canCompleteThisReservation = shouldShowComplete;

                    return (
                      <div
                        key={reservedVehicle.reserved_vehicle_id}
                        className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${cardColor}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900">
                            {reservedVehicle.vehicle.vehicle_model.vehicle_model_name}
                          </h4>
                          <Badge
                            className={`text-xs ${
                              isOccupied
                                ? "bg-orange-100 text-orange-800"
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
                              {reservedVehicle.vehicle.vehicle_model.vehicle_capacity}
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

                        {/* Remove Vehicle */}
                        {reservation?.reservation_status === "ACCEPTED" && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedVehicleToRemove(
                                  reservedVehicle.vehicle.vehicle_id
                                );
                                setShowRemoveVehicleModal(true);
                              }}
                              disabled={removeVehicleFromReservation.isPending}
                            >
                              {removeVehicleFromReservation.isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  Removing...
                                </div>
                              ) : (
                                <>
                                  <Minus className="w-4 h-4 mr-2" />
                                  Remove This Vehicle
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Report Issue */}
                        {canReportIssueForThisVehicle && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => {
                                setSelectedVehicle(reservedVehicle);
                                setShowReportIssueModal(true);
                              }}
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Report Issue
                            </Button>
                          </div>
                        )}

                        {/* Complete Reservation */}
                        {canCompleteThisReservation && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-[#0872b3] border-green-200 hover:bg-green-50 hover:border-blue-500"
                              onClick={() => {
                                setVehicleToComplete(reservedVehicle);
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
                  }
                )}
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

        </div>
      </div>

      {/* Modals */}
      <ReservationModals
        reservation={reservation}
        vehicles={vehicles}
        showAcceptRejectModal={showAcceptRejectModal}
        showAssignVehiclesModal={showAssignVehiclesModal}
        showApproveWithOdometerModal={showApproveWithOdometerModal}
        showCompleteModal={showCompleteModal}
        selectedVehicleToRemove={selectedVehicleToRemove}
        showAddVehicleModal={showAddVehicleModal}
        showRemoveVehicleModal={showRemoveVehicleModal}
        showCancelModal={showCancelModal}
        showEditReasonModal={showEditReasonModal}
        showReportIssueModal={showReportIssueModal}
        selectedVehicle={selectedVehicle}
        vehicleToComplete={vehicleToComplete}
        onCloseAcceptReject={onCloseAcceptReject}
        onCloseAssignVehicles={onCloseAssignVehicles}
        onCloseApproveWithOdometer={onCloseApproveWithOdometer}
        onCloseComplete={onCloseComplete}
        onCloseCancel={onCloseCancel}
        onCloseEditReason={onCloseEditReason}
        onCloseReportIssue={onCloseReportIssue}
        onAcceptReject={handleAcceptReject}
        onAssignVehicles={handleAssignVehicles}
        onApproveWithOdometer={handleApproveWithOdometer}
        onCompleteReservation={handleCompleteReservation}
        onCancelReservation={handleCancelReservation}
        onEditReason={handleEditReason}
        onRemoveVehicle={handleRemoveVehicle}
        onReportIssue={handleReportIssue}
        isAcceptRejectLoading={updateReservation.isPending}
        isAssignVehiclesLoading={assignVehicleOdometer.isPending}
        isApproveWithOdometerLoading={assignVehicleOdometer.isPending}
        isCompleteLoading={
          completeReservation.isPending || updateReservation.isPending
        }
        isCancelLoading={cancelReservation.isPending}
        isEditReasonLoading={updateReservationReason.isPending}
        isReportIssueLoading={createVehicleIssue.isPending}
        onCloseAddVehicle={onCloseAddVehicle}
        onCloseRemoveVehicle={onCloseRemoveVehicle}
        onAddVehicle={handleAddVehicle}
        isAddVehicleLoading={addVehicleToReservation.isPending}
        isRemoveVehicleLoading={removeVehicleFromReservation.isPending}
      />

      <div className="bg-white flex items-center justify-between m-3 p-4 rounded-xl">
        <p></p>
        <ReservationActions
          reservation={reservation}
          onOpenAcceptRejectModal={() => setShowAcceptRejectModal(true)}
          onOpenAssignVehiclesModal={() => setShowAssignVehiclesModal(true)}
          onOpenApproveWithOdometerModal={() =>
            setShowApproveWithOdometerModal(true)
          }
          onOpenCancelModal={() => setShowCancelModal(true)}
          onOpenEditReasonModal={() => setShowEditReasonModal(true)}
          onOpenAddVehicleModal={() => setShowAddVehicleModal(true)} // ADD THIS
          onOpenRemoveVehicleModal={() => setShowRemoveVehicleModal(true)} // ADD THIS
          isApproveRejectLoading={updateReservation.isPending}
          isAssignVehiclesLoading={assignVehicleOdometer.isPending}
          isApproveWithOdometerLoading={assignVehicleOdometer.isPending}
          isCancelLoading={cancelReservation.isPending}
          isEditReasonLoading={updateReservationReason.isPending}
          isAddVehicleLoading={addVehicleToReservation.isPending} // ADD THIS
          isRemoveVehicleLoading={removeVehicleFromReservation.isPending} // ADD THIS
        />
      </div>
    </div>
  );
}

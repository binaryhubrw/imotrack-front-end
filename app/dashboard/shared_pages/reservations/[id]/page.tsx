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
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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
  const canViewVehicles = !!user?.position?.position_access?.vehicles?.view;
  const canAssignVehicle = !!user?.position?.position_access?.reservations?.assignVehicle;
  const { data: vehicles = [] } = useVehicles(undefined, { enabled: canViewVehicles || canAssignVehicle });

  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState(false);
  const [showAssignVehiclesModal, setShowAssignVehiclesModal] = useState(false);
  const [showApproveWithOdometerModal, setShowApproveWithOdometerModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditReasonModal, setShowEditReasonModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<ReservedVehicle | null>(null);
  const [vehicleToComplete, setVehicleToComplete] = useState<ReservedVehicle | null>(null);

  if (isLoading || authLoading) return <SkeletonReservationDetailPage />;

  if (isError || !reservation) {
    return (
      <ErrorUI resource="reservation" onRetry={() => window.location.reload()} onBack={() => router.back()} />
    );
  }

  const canCreate = !!user?.position?.position_access?.reservations?.create;
  const canViewOwn = !!user?.position?.position_access?.reservations?.viewOwn;
  const canCancel = !!user?.position?.position_access?.reservations?.cancel;
  const canUpdateReason = !!user?.position?.position_access?.reservations?.updateReason;
  const canView = !!user?.position?.position_access?.reservations?.view;
  const canUpdate = !!user?.position?.position_access?.reservations?.update;
  const canComplete = !!user?.position?.position_access?.reservations?.complete;

  const isOwner = reservation?.user?.auth?.email === user?.user?.email;
  const canAccessReservation = canView || (canViewOwn && isOwner) || canCreate;

  if (!canAccessReservation) return <NoPermissionUI resource="reservations" />;

  const shouldShowComplete = reservation?.reservation_status === "APPROVED" && (canComplete || canUpdate);
  const isFleetManager = canView && canUpdate;
  const shouldShowReportIssue = reservation?.reservation_status === "APPROVED" && isOwner && (canViewOwn || canCancel || canUpdateReason || canCreate);

  const handleAcceptReject = async (action: "ACCEPT" | "REJECT", reason: string, selectedVehicleIds?: string[]) => {
    if (!reservation) return;
    try {
      if (action === "ACCEPT") {
        if (selectedVehicleIds && selectedVehicleIds.length > 0) {
          await assignMultipleVehicles.mutateAsync({ reservationId: reservation.reservation_id, vehicleIds: selectedVehicleIds });
        } else {
          await updateReservation.mutateAsync({ id: reservation.reservation_id, dto: { status: "ACCEPTED", reason: reason || "Reservation accepted" } });
        }
      } else {
        await updateReservation.mutateAsync({ id: reservation.reservation_id, dto: { status: "REJECTED", reason } });
      }
      setShowAcceptRejectModal(false);
    } catch (error) { console.error("Error handling accept/reject:", error); }
  };

  const handleAddVehicle = async (vehicleId: string) => {
    if (!reservation) return;
    try {
      await addVehicleToReservation.mutateAsync({ id: reservation.reservation_id, dto: { vehicle_id: vehicleId } });
      setShowAddVehicleModal(false);
    } catch (error) { console.error("Error adding vehicle:", error); }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    if (!reservation) return;
    try {
      await removeVehicleFromReservation.mutateAsync({ id: reservation.reservation_id, dto: { vehicle_id: vehicleId } });
    } catch (error) { console.error("Error removing vehicle:", error); }
  };

  const handleAssignVehicles = async (vehicles: Array<{ vehicle_id: string; starting_odometer: number; fuel_provided: number }>) => {
    if (!reservation) return;
    try {
      await assignVehicleOdometer.mutateAsync({ id: reservation.reservation_id, dto: { vehicles } });
      setShowAssignVehiclesModal(false);
    } catch (error) { console.error("Error assigning vehicles:", error); }
  };

  const handleApproveWithOdometer = async (vehicles: Array<{ vehicle_id: string; starting_odometer: number; fuel_provided: number }>) => {
    if (!reservation) return;
    try {
      await assignVehicleOdometer.mutateAsync({ id: reservation.reservation_id, dto: { vehicles } });
      setShowApproveWithOdometerModal(false);
    } catch (error) { console.error("Error approving with odometer:", error); }
  };

  const handleCompleteReservation = async (reservedVehicleId: string, returnedOdometer: number) => {
    if (!reservation) return;
    try {
      await completeReservation.mutateAsync({ reservedVehicleId, dto: { returned_odometer: returnedOdometer } });
      setShowCompleteModal(false);
      setVehicleToComplete(null);
      setTimeout(() => { queryClient.refetchQueries({ queryKey: ['reservation', id] }); }, 100);
    } catch (error) { console.error("Error completing reservation:", error); }
  };

  const handleCancelReservation = async (reason: string) => {
    if (!reservation) return;
    try {
      await cancelReservation.mutateAsync({ id: reservation.reservation_id, dto: { reason } });
      setShowCancelModal(false);
    } catch (error) { console.error("Error cancelling reservation:", error); }
  };

  const handleEditReason = async (reason: string) => {
    if (!reservation) return;
    try {
      await updateReservationReason.mutateAsync({ id: reservation.reservation_id, dto: { reason } });
      setShowEditReasonModal(false);
    } catch (error) { console.error("Error updating reason:", error); }
  };

  const handleReportIssue = async (issueData: { issue_title: string; issue_description: string; reserved_vehicle_id: string; issue_date: string; message: string }) => {
    try {
      await createVehicleIssue.mutateAsync(issueData);
      setShowReportIssueModal(false);
      setSelectedVehicle(null);
      router.push("/dashboard/shared_pages/vehicle-issues");
    } catch (error) { console.error("Error reporting issue:", error); }
  };

  const onCloseAcceptReject = () => setShowAcceptRejectModal(false);
  const onCloseAssignVehicles = () => setShowAssignVehiclesModal(false);
  const onCloseApproveWithOdometer = () => setShowApproveWithOdometerModal(false);
  const onCloseComplete = () => { setShowCompleteModal(false); setVehicleToComplete(null); };
  const onCloseCancel = () => setShowCancelModal(false);
  const onCloseEditReason = () => setShowEditReasonModal(false);
  const onCloseReportIssue = () => { setShowReportIssueModal(false); setSelectedVehicle(null); };
  const onCloseAddVehicle = () => setShowAddVehicleModal(false);

  if (isLoading) return <SkeletonEntityDetails />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":   return "bg-green-100 text-green-800 border-green-200";
      case "ACCEPTED":   return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED":   return "bg-orange-100 text-orange-800 border-orange-200";
      case "CANCELLED":
      case "CANCELED":   return "bg-gray-100 text-gray-800 border-gray-200";
      case "COMPLETED":  return "bg-purple-100 text-purple-800 border-purple-200";
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:           return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "ACCEPTED":
      case "COMPLETED":  return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
      case "CANCELLED":
      case "CANCELED":   return <XCircle className="w-4 h-4" />;
      default:           return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 py-6">
      <div className="max-w-screen-xl mx-auto px-4 space-y-5">

        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-[#0872b3] hover:text-[#065d8f] -ml-2" onClick={() => router.back()}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
          </Button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2">
            <ReservationActions
              reservation={reservation}
              onOpenAcceptRejectModal={() => setShowAcceptRejectModal(true)}
              onOpenAssignVehiclesModal={() => setShowAssignVehiclesModal(true)}
              onOpenApproveWithOdometerModal={() => setShowApproveWithOdometerModal(true)}
              onOpenCancelModal={() => setShowCancelModal(true)}
              onOpenEditReasonModal={() => setShowEditReasonModal(true)}
              onOpenAddVehicleModal={() => setShowAddVehicleModal(true)}
              isApproveRejectLoading={updateReservation.isPending}
              isAssignVehiclesLoading={assignVehicleOdometer.isPending}
              isApproveWithOdometerLoading={assignVehicleOdometer.isPending}
              isCancelLoading={cancelReservation.isPending}
              isEditReasonLoading={updateReservationReason.isPending}
              isAddVehicleLoading={addVehicleToReservation.isPending}
            />
          </div>
        </div>

        {/* Header strip */}
        <div className="bg-[#0872b3] rounded-2xl px-8 py-5 text-white flex items-center justify-between shadow-lg">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Reservation Details</p>
            <h1 className="text-2xl font-bold">{reservation.reservation_purpose}</h1>
            <p className="text-white/70 text-sm mt-0.5">{reservation.description}</p>
          </div>
          <Badge className={`${getStatusColor(reservation.reservation_status)} flex items-center gap-1 text-sm px-4 py-1.5 shrink-0`}>
            {getStatusIcon(reservation.reservation_status)}
            {reservation.reservation_status}
          </Badge>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — trip + requester + vehicles */}
          <div className="lg:col-span-2 space-y-5">

            {/* Trip info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0872b3]" /> Trip Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: "From", value: reservation.start_location },
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: "To", value: reservation.reservation_destination },
                  { icon: <Users className="w-3.5 h-3.5" />, label: "Passengers", value: String(reservation.passengers) },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: "Departure", value: formatDate(reservation.departure_date) },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: "Expected Return", value: formatDate(reservation.expected_returning_date) },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: "Created", value: formatDate(reservation.created_at) },
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 uppercase font-medium mb-1 flex items-center gap-1">{f.icon} {f.label}</div>
                    <div className="font-semibold text-gray-900 text-sm">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requester */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0872b3]" /> Requester
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Name", value: `${reservation.user?.first_name} ${reservation.user?.last_name}` },
                  { label: "Email", value: (reservation.user as any)?.auth?.email || "N/A" },
                  { label: "Phone", value: reservation.user?.user_phone || "N/A" },
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 uppercase font-medium mb-1">{f.label}</div>
                    <div className="font-semibold text-gray-900 text-sm">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicles */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#0872b3]" /> Vehicles ({reservation.reserved_vehicles?.length || 0})
                </h2>
                {reservation?.reservation_status === "ACCEPTED" && isFleetManager && (
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                    onClick={() => setShowAddVehicleModal(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Vehicle
                  </Button>
                )}
              </div>

              {reservation.reserved_vehicles && reservation.reserved_vehicles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reservation.reserved_vehicles.map((rv: ReservedVehicle) => {
                    const isOccupied = rv.vehicle.vehicle_status === "OCCUPIED";
                    const isReturned = !!rv.returned_odometer;
                    return (
                      <div key={rv.reserved_vehicle_id}
                        className={`rounded-xl border p-4 ${isOccupied ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-sm">{rv.vehicle.vehicle_model.vehicle_model_name}</h4>
                          <Badge className={`text-xs ${isOccupied ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                            {rv.vehicle.vehicle_status}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Plate:</span><span className="font-medium">{rv.vehicle.plate_number}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Capacity:</span><span className="font-medium">{rv.vehicle.vehicle_model.vehicle_capacity}</span></div>
                          {rv.fuel_provided ? <div className="flex justify-between"><span className="text-gray-500">Fuel:</span><span className="font-medium">{rv.fuel_provided} L</span></div> : null}
                          {rv.returned_odometer ? <div className="flex justify-between"><span className="text-gray-500">Return Odometer:</span><span className="font-medium">{rv.returned_odometer} km</span></div> : null}
                          {rv.returned_date ? <div className="flex justify-between"><span className="text-gray-500">Returned:</span><span className="font-medium text-xs">{formatDate(rv.returned_date)}</span></div> : null}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
                          {reservation?.reservation_status === "ACCEPTED" && isFleetManager && (
                            <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs"
                              onClick={() => handleRemoveVehicle(rv.vehicle.vehicle_id)} disabled={removeVehicleFromReservation.isPending}>
                              <Minus className="w-3 h-3 mr-1" />{removeVehicleFromReservation.isPending ? "Removing..." : "Remove"}
                            </Button>
                          )}
                          {shouldShowReportIssue && !isReturned && (
                            <Button variant="outline" size="sm" className="w-full text-orange-500 border-orange-200 hover:bg-orange-50 text-xs"
                              onClick={() => { setSelectedVehicle(rv); setShowReportIssueModal(true); }}>
                              <AlertCircle className="w-3 h-3 mr-1" /> Report Issue
                            </Button>
                          )}
                          {shouldShowComplete && !isReturned && (
                            <Button variant="outline" size="sm" className="w-full text-[#0872b3] border-blue-200 hover:bg-blue-50 text-xs"
                              onClick={() => { setVehicleToComplete(rv); setShowCompleteModal(true); }}>
                              <CheckSquare className="w-3 h-3 mr-1" /> Return Vehicle
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Car className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No vehicles assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — status timeline */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <PersonStanding className="w-4 h-4 text-[#0872b3]" /> Status Timeline
              </h2>
              <div className="space-y-3">
                {[
                  { icon: <UserCheck className="w-4 h-4 text-blue-500" />,    label: "Reviewed",  date: reservation.reviewed_at,  by: reservation.reviewer,  fallback: "Pending" },
                  { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: "Approved",  date: reservation.approved_at,  by: reservation.approver,  fallback: "Pending" },
                  { icon: <Clock className="w-4 h-4 text-purple-500" />,      label: "Completed", date: reservation.completed_at, by: reservation.completer, fallback: "Not completed" },
                  { icon: <XCircle className="w-4 h-4 text-red-500" />,       label: "Cancelled", date: reservation.canceled_at,  by: reservation.canceler,  fallback: "Not cancelled" },
                ].map((s) => (
                  <div key={s.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="mt-0.5 shrink-0">{s.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400 uppercase font-medium">{s.label}</div>
                      <div className="text-sm font-semibold text-gray-900 mt-0.5">{s.date ? formatDate(s.date) : s.fallback}</div>
                      {s.by && <div className="text-xs text-gray-500 mt-0.5">by {(s.by as any).first_name} {(s.by as any).last_name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationModals
        reservation={reservation}
        vehicles={vehicles}
        showAcceptRejectModal={showAcceptRejectModal}
        showAssignVehiclesModal={showAssignVehiclesModal}
        showApproveWithOdometerModal={showApproveWithOdometerModal}
        showCompleteModal={showCompleteModal}
        showAddVehicleModal={showAddVehicleModal}
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
        onReportIssue={handleReportIssue}
        isAcceptRejectLoading={updateReservation.isPending}
        isAssignVehiclesLoading={assignVehicleOdometer.isPending}
        isApproveWithOdometerLoading={assignVehicleOdometer.isPending}
        isCompleteLoading={completeReservation.isPending || updateReservation.isPending}
        isCancelLoading={cancelReservation.isPending}
        isEditReasonLoading={updateReservationReason.isPending}
        isReportIssueLoading={createVehicleIssue.isPending}
        onCloseAddVehicle={onCloseAddVehicle}
        onAddVehicle={handleAddVehicle}
        isAddVehicleLoading={addVehicleToReservation.isPending}
      />
    </div>
  );
}

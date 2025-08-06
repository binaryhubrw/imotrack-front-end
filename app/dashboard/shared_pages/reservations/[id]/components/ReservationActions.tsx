"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Car, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Reservation } from "@/types/next-auth";

interface ReservationActionsProps {
  reservation: Reservation;
  // Modal trigger handlers
  onOpenAcceptRejectModal: () => void;
  onOpenAssignVehiclesModal: () => void;
  onOpenApproveWithOdometerModal: () => void;
  onOpenCancelModal: () => void;
  onOpenEditReasonModal: () => void;
  // Loading states
  isApproveRejectLoading: boolean;
  isAssignVehiclesLoading: boolean;
  isApproveWithOdometerLoading: boolean;
  isCancelLoading: boolean;
  isEditReasonLoading: boolean;
}

export default function ReservationActions({
  reservation,
  onOpenAcceptRejectModal,
  onOpenAssignVehiclesModal,
  onOpenApproveWithOdometerModal,
  onOpenCancelModal,
  onOpenEditReasonModal,
  isApproveRejectLoading,
  isAssignVehiclesLoading,
  isApproveWithOdometerLoading,
  isCancelLoading,
  isEditReasonLoading,
}: ReservationActionsProps) {
  const { user } = useAuth();
  
  // Permission checks
  const canApprove = !!user?.position?.position_access?.reservations?.approve;
  const canCancel = !!user?.position?.position_access?.reservations?.cancel;
  const canAssignVehicle = !!user?.position?.position_access?.reservations?.assignVehicle;
  const canUpdateReason = !!user?.position?.position_access?.reservations?.updateReason;

  // Helper: is reservation assigned a vehicle?
  const hasAssignedVehicle = reservation?.reserved_vehicles && reservation.reserved_vehicles.length > 0;

  // Helper: should show assign vehicle button (only for ACCEPTED status without vehicles)
  const shouldShowAssignVehicle = canAssignVehicle && 
    reservation?.reservation_status === 'ACCEPTED' && 
    !hasAssignedVehicle;

  // Helper: should show approve with odometer button (only for ACCEPTED status with vehicles)
  const shouldShowApproveWithOdometer = canApprove && 
    reservation?.reservation_status === 'ACCEPTED' && 
    hasAssignedVehicle;

  // Helper: should show cancel button (for UNDER_REVIEW, ACCEPTED, APPROVED)
  const shouldShowCancel = canCancel &&
    ['UNDER_REVIEW', 'ACCEPTED', 'APPROVED'].includes(reservation?.reservation_status);

  // Helper: should show edit reason button (for REJECTED, CANCELLED, CANCELED)
  const shouldShowEditReason = canUpdateReason &&
    ['REJECTED', 'CANCELLED', 'CANCELED'].includes(reservation?.reservation_status);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Accept/Reject for UNDER_REVIEW status */}
      {canApprove && reservation.reservation_status === 'UNDER_REVIEW' && (
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={onOpenAcceptRejectModal}
          disabled={isApproveRejectLoading}
        >
          {isApproveRejectLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Accept / Reject
            </div>
          )}
        </Button>
      )}

      {/* Assign Vehicles for ACCEPTED status without vehicles */}
      {shouldShowAssignVehicle && (
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={onOpenAssignVehiclesModal}
          disabled={isAssignVehiclesLoading}
        >
          {isAssignVehiclesLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Assigning...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Assign Vehicles
            </div>
          )}
        </Button>
      )}

      {/* Approve with Odometer for ACCEPTED status with vehicles */}
      {shouldShowApproveWithOdometer && (
        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          onClick={onOpenApproveWithOdometerModal}
          disabled={isApproveWithOdometerLoading}
        >
          {isApproveWithOdometerLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Approving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approve with Odometer
            </div>
          )}
        </Button>
      )}

      {/* Cancel Reservation */}
      {shouldShowCancel && (
        <Button
          className="bg-orange-600 text-white hover:bg-orange-700"
          onClick={onOpenCancelModal}
          disabled={isCancelLoading}
        >
          {isCancelLoading ? (
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

      {/* Edit Reason */}
      {shouldShowEditReason && (
        <Button
          className="bg-yellow-600 text-white hover:bg-yellow-700"
          onClick={onOpenEditReasonModal}
          disabled={isEditReasonLoading}
        >
          {isEditReasonLoading ? (
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
  );
} 
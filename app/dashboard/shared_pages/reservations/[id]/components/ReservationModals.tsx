"use client";

import React, { useState } from "react";
import { Vehicle, ReservedVehicle, Reservation } from "@/types/next-auth";
import { useGetAvailableVehicles } from "@/lib/queries";
import { toast } from "sonner";
import { TruckIcon } from "lucide-react";

interface AvailableVehicle {
  vehicle_id: string;
  plate_number: string;
  vehicle_model: {
    vehicle_model_id: string;
    vehicle_model_name: string;
    vehicle_type: string;
    vehicle_capacity: number;
    manufacturer_name: string;
  };
  vehicle_status: string;
  energy_type: string;
  vehicle_year: number;
  transmission_mode: string;
  last_service_date: string;
}

interface ReservationModalsProps {
  reservation: Reservation;
  vehicles: Vehicle[];
  // Modal visibility states
  showAcceptRejectModal: boolean;
  showAssignVehiclesModal: boolean;
  showApproveWithOdometerModal: boolean;
  showCompleteModal: boolean;
  showCancelModal: boolean;
  showEditReasonModal: boolean;
  showReportIssueModal: boolean;
  selectedVehicle: ReservedVehicle | null;
  vehicleToComplete: ReservedVehicle | null;
  // Modal close handlers
  onCloseAcceptReject: () => void;
  onCloseAssignVehicles: () => void;
  onCloseApproveWithOdometer: () => void;
  onCloseComplete: () => void;
  onCloseCancel: () => void;
  onCloseEditReason: () => void;
  onCloseReportIssue: () => void;
  // Action handlers
  onAcceptReject: (
    action: "ACCEPT" | "REJECT",
    reason: string,
    selectedVehicleIds?: string[]
  ) => Promise<void>;
  onAssignVehicles: (
    vehicles: Array<{
      vehicle_id: string;
      starting_odometer: number;
      fuel_provided: number;
    }>
  ) => Promise<void>;
  onApproveWithOdometer: (
    vehicles: Array<{
      vehicle_id: string;
      starting_odometer: number;
      fuel_provided: number;
    }>
  ) => Promise<void>;
  onCompleteReservation: (
    reservedVehicleId: string,
    returnedOdometer: number
  ) => Promise<void>;
  onCancelReservation: (reason: string) => Promise<void>;
  onEditReason: (reason: string) => Promise<void>;
  onReportIssue: (issueData: {
    issue_title: string;
    issue_description: string;
    reserved_vehicle_id: string;
    issue_date: string;
  }) => Promise<void>;
  // Loading states
  isAcceptRejectLoading: boolean;
  isAssignVehiclesLoading: boolean;
  isApproveWithOdometerLoading: boolean;
  isCompleteLoading: boolean;
  isCancelLoading: boolean;
  isEditReasonLoading: boolean;
  isReportIssueLoading: boolean;
}

export default function ReservationModals({
  reservation,
  vehicles,
  showAcceptRejectModal,
  showAssignVehiclesModal,
  showApproveWithOdometerModal,
  showCompleteModal,
  showCancelModal,
  showEditReasonModal,
  showReportIssueModal,
  selectedVehicle,
  vehicleToComplete,
  onCloseAcceptReject,
  onCloseAssignVehicles,
  onCloseApproveWithOdometer,
  onCloseComplete,
  onCloseCancel,
  onCloseEditReason,
  onCloseReportIssue,
  onAcceptReject,
  onAssignVehicles,
  onApproveWithOdometer,
  onCompleteReservation,
  onCancelReservation,
  onEditReason,
  onReportIssue,
  isAcceptRejectLoading,
  isAssignVehiclesLoading,
  isApproveWithOdometerLoading,
  isCompleteLoading,
  isCancelLoading,
  isEditReasonLoading,
  isReportIssueLoading,
}: ReservationModalsProps) {
  // Form states
  const [acceptRejectAction, setAcceptRejectAction] = useState<
    "ACCEPT" | "REJECT"
  >("ACCEPT");
  const [acceptRejectReason, setAcceptRejectReason] = useState("");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehicleAssignments, setVehicleAssignments] = useState<
    Array<{
      vehicle_id: string;
      starting_odometer: string;
      fuel_provided: string;
    }>
  >([{ vehicle_id: "", starting_odometer: "", fuel_provided: "" }]);
  const [odometerAssignments, setOdometerAssignments] = useState<
    Array<{
      vehicle_id: string;
      starting_odometer: string;
      fuel_provided: string;
    }>
  >([]);
  const [returnedOdometers, setReturnedOdometers] = useState<
    Array<{
      vehicle_id: string;
      returned_odometer: string;
    }>
  >([]);
  const [cancelReason, setCancelReason] = useState("");
  const [editReason, setEditReason] = useState("");
  const [issueForm, setIssueForm] = useState({
    issue_title: "",
    issue_description: "",
  });
  const [vehicleSearch, setVehicleSearch] = useState("");

  // Get available vehicles for the reservation date range
  const { data: availableVehiclesData, isLoading: isLoadingAvailableVehicles } =
    useGetAvailableVehicles(
      reservation?.departure_date || "",
      reservation?.expected_returning_date || ""
    );

  const availableVehicles = availableVehiclesData?.data || [];

  // Helper functions for vehicle assignments
  const addVehicleAssignment = () => {
    setVehicleAssignments((prev) => [
      ...prev,
      { vehicle_id: "", starting_odometer: "", fuel_provided: "" },
    ]);
  };

  const removeVehicleAssignment = (index: number) => {
    setVehicleAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVehicleAssignment = (
    index: number,
    field: string,
    value: string
  ) => {
    setVehicleAssignments((prev) =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
      )
    );
  };

  const updateOdometerAssignment = (
    index: number,
    field: string,
    value: string
  ) => {
    setOdometerAssignments((prev) =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
      )
    );
  };

  const updateReturnedOdometer = (
    index: number,
    field: string,
    value: string
  ) => {
    setReturnedOdometers((prev) =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
      )
    );
  };

  // Initialize odometer assignments when modal opens
  React.useEffect(() => {
    if (showApproveWithOdometerModal && reservation?.reserved_vehicles) {
      setOdometerAssignments(
        reservation.reserved_vehicles.map((vehicle: ReservedVehicle) => ({
          vehicle_id: vehicle.vehicle.vehicle_id,
          starting_odometer: "",
          fuel_provided: "",
        }))
      );
    }
  }, [showApproveWithOdometerModal, reservation]);

  // Initialize returned odometers when modal opens
  React.useEffect(() => {
    if (showCompleteModal && vehicleToComplete) {
      setReturnedOdometers([
        {
          vehicle_id: vehicleToComplete.vehicle.vehicle_id,
          returned_odometer: "",
        },
      ]);
    }
  }, [showCompleteModal, vehicleToComplete]);

  // Initialize selected vehicles when Accept/Reject modal opens
  React.useEffect(() => {
    if (showAcceptRejectModal && acceptRejectAction === "ACCEPT") {
      setSelectedVehicleIds([]);
    }
  }, [showAcceptRejectModal, acceptRejectAction]);

  // Handle form submissions
  const handleAcceptReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (acceptRejectAction === "REJECT" && !acceptRejectReason.trim()) {
      toast.error("Reason is required for rejection");
      return;
    }

    if (acceptRejectAction === "ACCEPT") {
      if (selectedVehicleIds.length === 0) {
        toast.error("Please select at least one vehicle");
        return;
      }

      await onAcceptReject(
        acceptRejectAction,
        acceptRejectReason,
        selectedVehicleIds
      );
    } else {
      await onAcceptReject(acceptRejectAction, acceptRejectReason);
    }

    setAcceptRejectAction("ACCEPT");
    setAcceptRejectReason("");
    setSelectedVehicleIds([]);
  };

  const handleAssignVehicles = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAssignments = vehicleAssignments.filter(
      (assignment) =>
        assignment.vehicle_id &&
        assignment.starting_odometer &&
        assignment.fuel_provided
    );

    if (validAssignments.length === 0) {
      toast.error(
        "Please fill in all required fields for at least one vehicle"
      );
      return;
    }

    await onAssignVehicles(
      validAssignments.map((assignment) => ({
        vehicle_id: assignment.vehicle_id,
        starting_odometer: Number(assignment.starting_odometer),
        fuel_provided: Number(assignment.fuel_provided),
      }))
    );
    setVehicleAssignments([
      { vehicle_id: "", starting_odometer: "", fuel_provided: "" },
    ]);
  };

  const handleApproveWithOdometer = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAssignments = odometerAssignments.filter(
      (assignment) => assignment.starting_odometer && assignment.fuel_provided
    );

    if (validAssignments.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    await onApproveWithOdometer(
      validAssignments.map((assignment) => ({
        vehicle_id: assignment.vehicle_id,
        starting_odometer: Number(assignment.starting_odometer),
        fuel_provided: Number(assignment.fuel_provided),
      }))
    );
  };

  const handleCompleteReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleToComplete) {
      toast.error("No vehicle selected for completion");
      return;
    }

    const returnedOdometer = returnedOdometers.find(
      (odometer) => odometer.vehicle_id === vehicleToComplete.vehicle.vehicle_id
    );

    if (!returnedOdometer?.returned_odometer) {
      toast.error("Please fill in returned odometer");
      return;
    }

    await onCompleteReservation(
      vehicleToComplete.reserved_vehicle_id,
      Number(returnedOdometer.returned_odometer)
    );
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Reason is required for cancellation");
      return;
    }
    await onCancelReservation(cancelReason);
    setCancelReason("");
  };

  const handleEditReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReason.trim()) {
      toast.error("Reason is required");
      return;
    }
    await onEditReason(editReason);
    setEditReason("");
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.issue_title.trim() || !issueForm.issue_description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!selectedVehicle) {
      toast.error("No vehicle selected");
      return;
    }

    await onReportIssue({
      issue_title: issueForm.issue_title,
      issue_description: issueForm.issue_description,
      reserved_vehicle_id: selectedVehicle.reserved_vehicle_id,
      issue_date: new Date().toISOString(),
    });
    setIssueForm({ issue_title: "", issue_description: "" });
  };

  return (
    <>
      {/* Accept/Reject Modal */}
      {showAcceptRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Accept or Reject Reservation
              </h2>
              <button
                onClick={onCloseAcceptReject}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleAcceptReject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action *
                  </label>
                  <select
                    value={acceptRejectAction}
                    onChange={(e) =>
                      setAcceptRejectAction(
                        e.target.value as "ACCEPT" | "REJECT"
                      )
                    }
                    disabled={isAcceptRejectLoading}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="ACCEPT">Accept</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason{" "}
                    {acceptRejectAction === "REJECT" && (
                      <span className="text-orange-500">*</span>
                    )}
                  </label>
                  <textarea
                    value={acceptRejectReason}
                    onChange={(e) => setAcceptRejectReason(e.target.value)}
                    rows={3}
                    required={acceptRejectAction === "REJECT"}
                    disabled={isAcceptRejectLoading}
                    placeholder={
                      acceptRejectAction === "REJECT"
                        ? "Enter reason for rejection"
                        : "Optional reason for acceptance"
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {acceptRejectAction === "ACCEPT" && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Header with icon */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Select Vehicles
                      </h3>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by plate number or model..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        disabled={isAcceptRejectLoading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Vehicle List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableVehicles
                        .filter(
                          (v: AvailableVehicle) =>
                            v.plate_number
                              .toLowerCase()
                              .includes(vehicleSearch.toLowerCase()) ||
                            v.vehicle_model?.vehicle_model_name
                              ?.toLowerCase()
                              .includes(vehicleSearch.toLowerCase())
                        )
                        .map((availableVehicle: AvailableVehicle) => (
                          <div
                            key={availableVehicle.vehicle_id}
                            className={`flex items-center p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                              selectedVehicleIds.includes(
                                availableVehicle.vehicle_id
                              )
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (
                                selectedVehicleIds.includes(
                                  availableVehicle.vehicle_id
                                )
                              ) {
                                setSelectedVehicleIds((prev) =>
                                  prev.filter(
                                    (id) => id !== availableVehicle.vehicle_id
                                  )
                                );
                              } else {
                                setSelectedVehicleIds((prev) => [
                                  ...prev,
                                  availableVehicle.vehicle_id,
                                ]);
                              }
                            }}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedVehicleIds.includes(
                                availableVehicle.vehicle_id
                              )}
                              disabled={isAcceptRejectLoading}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVehicleIds((prev) => [
                                    ...prev,
                                    availableVehicle.vehicle_id,
                                  ]);
                                } else {
                                  setSelectedVehicleIds((prev) =>
                                    prev.filter(
                                      (id) => id !== availableVehicle.vehicle_id
                                    )
                                  );
                                }
                              }}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={(e) => e.stopPropagation()}
                            />

                            {/* Vehicle Icon */}
                            <div
                              className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 ${
                                selectedVehicleIds.includes(
                                  availableVehicle.vehicle_id
                                )
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <TruckIcon
                                className={`w-7 h-7 ${
                                  selectedVehicleIds.includes(
                                    availableVehicle.vehicle_id
                                  )
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>

                            {/* Vehicle Details */}
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {availableVehicle.plate_number}
                                </span>
                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                  {availableVehicle.vehicle_model
                                    ?.vehicle_model_name || "Unknown Model"}
                                </span>
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Capacity:{" "}
                                {availableVehicle.vehicle_model
                                  ?.vehicle_capacity || 0}{" "}
                                passengers
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            {selectedVehicleIds.includes(
                              availableVehicle.vehicle_id
                            ) && (
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {availableVehicles.length === 0 &&
                      !isLoadingAvailableVehicles && (
                        <div className="text-center py-12">
                          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No vehicles available
                          </h3>
                          <p className="text-gray-500">
                            There are currently no vehicles available for
                            selection.
                          </p>
                        </div>
                      )}

                    {/* Loading State */}
                    {isLoadingAvailableVehicles && (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="text-gray-600">
                            Loading vehicles...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Selection Summary */}
                    {selectedVehicleIds.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">
                            {selectedVehicleIds.length} vehicle
                            {selectedVehicleIds.length > 1 ? "s" : ""} selected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseAcceptReject}
                    disabled={isAcceptRejectLoading}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isAcceptRejectLoading ||
                      (acceptRejectAction === "REJECT" &&
                        !acceptRejectReason.trim()) ||
                      (acceptRejectAction === "ACCEPT" &&
                        selectedVehicleIds.length === 0)
                    }
                    className="flex-1 px-4 py-2 text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-green-800"
                  >
                    {isAcceptRejectLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vehicles Modal */}
      {showAssignVehiclesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Assign Vehicles
              </h2>
              <button
                onClick={onCloseAssignVehicles}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Passengers:</strong> {reservation?.passengers || 0}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Available Vehicles:</strong>{" "}
                  {
                    vehicles.filter((v) => v.vehicle_status === "AVAILABLE")
                      .length
                  }
                </p>
              </div>
              <form onSubmit={handleAssignVehicles} className="space-y-4">
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
                          className="text-orange-500 hover:text-orange-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                          disabled={isAssignVehiclesLoading}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="">Select a vehicle</option>
                          {vehicles
                            .filter((v) => v.vehicle_status === "AVAILABLE")
                            .map((vehicle) => (
                              <option
                                key={vehicle.vehicle_id}
                                value={vehicle.vehicle_id}
                              >
                                {vehicle.plate_number} -{" "}
                                {vehicle.vehicle_model?.vehicle_model_name ||
                                  "Unknown"}{" "}
                                (Capacity:{" "}
                                {vehicle.vehicle_model?.vehicle_capacity || 0})
                              </option>
                            ))}
                        </select>
                      </div>
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
                          disabled={isAssignVehiclesLoading}
                          placeholder="Odometer reading"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
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
                          disabled={isAssignVehiclesLoading}
                          placeholder="Fuel amount"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVehicleAssignment}
                  disabled={isAssignVehiclesLoading}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Another Vehicle
                </button>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseAssignVehicles}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssignVehiclesLoading}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isAssignVehiclesLoading
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
      )}

      {/* Approve with Odometer Modal */}
      {showApproveWithOdometerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Approve with Odometer
              </h2>
              <button
                onClick={onCloseApproveWithOdometer}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleApproveWithOdometer} className="space-y-4">
                {odometerAssignments.map((assignment, index) => {
                  const vehicle = reservation?.reserved_vehicles?.find(
                    (v: ReservedVehicle) =>
                      v.vehicle.vehicle_id === assignment.vehicle_id
                  );
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {vehicle?.vehicle.vehicle_name ||
                          `Vehicle ${index + 1}`}{" "}
                        - {vehicle?.vehicle.plate_number}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Starting Odometer *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={assignment.starting_odometer}
                            onChange={(e) =>
                              updateOdometerAssignment(
                                index,
                                "starting_odometer",
                                e.target.value
                              )
                            }
                            disabled={isApproveWithOdometerLoading}
                            placeholder="Odometer reading"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>
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
                              updateOdometerAssignment(
                                index,
                                "fuel_provided",
                                e.target.value
                              )
                            }
                            disabled={isApproveWithOdometerLoading}
                            placeholder="Fuel amount"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseApproveWithOdometer}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApproveWithOdometerLoading}
                    className="flex-1 px-4 py-2 text-white bg-[#0872b3] border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isApproveWithOdometerLoading
                      ? "Approving..."
                      : "Approve Reservation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Reservation Modal */}
      {showCompleteModal && vehicleToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Complete Vehicle Return
              </h2>
              <button
                onClick={onCloseComplete}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Vehicle Details
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Vehicle:</span>{" "}
                    {vehicleToComplete.vehicle.plate_number}
                  </p>
                </div>
              </div>
              <form onSubmit={handleCompleteReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Returned Odometer (km){" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={
                      returnedOdometers.find(
                        (odometer) =>
                          odometer.vehicle_id ===
                          vehicleToComplete.vehicle.vehicle_id
                      )?.returned_odometer || ""
                    }
                    onChange={(e) => {
                      const existingIndex = returnedOdometers.findIndex(
                        (odometer) =>
                          odometer.vehicle_id ===
                          vehicleToComplete.vehicle.vehicle_id
                      );
                      if (existingIndex >= 0) {
                        updateReturnedOdometer(
                          existingIndex,
                          "returned_odometer",
                          e.target.value
                        );
                      } else {
                        setReturnedOdometers((prev) => [
                          ...prev,
                          {
                            vehicle_id: vehicleToComplete.vehicle.vehicle_id,
                            returned_odometer: e.target.value,
                          },
                        ]);
                      }
                    }}
                    disabled={isCompleteLoading}
                    placeholder="Returned odometer reading"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseComplete}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCompleteLoading}
                    className="flex-1 px-4 py-2 text-white bg-[#0872b3] border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCompleteLoading
                      ? "Completing..."
                      : "Complete Vehicle Return"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Cancel Reservation
              </h2>
              <button
                onClick={onCloseCancel}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleCancel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    required
                    placeholder="Enter reason for cancellation"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseCancel}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCancelLoading || !cancelReason.trim()}
                    className="flex-1 px-4 py-2 text-white bg-orange-600 border border-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {isCancelLoading ? "Canceling..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reason Modal */}
      {showEditReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Reason
              </h2>
              <button
                onClick={onCloseEditReason}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleEditReason} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    rows={3}
                    required
                    placeholder="Enter new reason"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseEditReason}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditReasonLoading || !editReason.trim()}
                    className="flex-1 px-4 py-2 text-white bg-yellow-600 border border-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isEditReasonLoading ? "Updating..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportIssueModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Report Vehicle Issue
              </h2>
              <button
                onClick={onCloseReportIssue}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
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
              <form onSubmit={handleReportIssue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Title <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issueForm.issue_title}
                    onChange={(e) =>
                      setIssueForm((prev) => ({
                        ...prev,
                        issue_title: e.target.value,
                      }))
                    }
                    disabled={isReportIssueLoading}
                    placeholder="Brief description of the issue"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={issueForm.issue_description}
                    onChange={(e) =>
                      setIssueForm((prev) => ({
                        ...prev,
                        issue_description: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Detailed description of the issue..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onCloseReportIssue}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isReportIssueLoading ||
                      !issueForm.issue_title.trim() ||
                      !issueForm.issue_description.trim()
                    }
                    className="flex-1 px-4 py-2 text-white bg-orange-600 border border-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {isReportIssueLoading ? "Reporting..." : "Report Issue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

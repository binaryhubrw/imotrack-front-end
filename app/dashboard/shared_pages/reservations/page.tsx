"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Search, Filter, X, ChevronDown } from "lucide-react";
import {
  useReservations,
  useMyReservations,
  useCreateReservation,
  useCancelReservation,
  useUpdateReservation,
} from "@/lib/queries";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Reservation,
  CreateReservationDto,
  ReservationStatus,
} from "@/types/next-auth";
import { SkeletonReservationCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import ErrorUI from "@/components/ErrorUI";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// Status enum for better type safety
const RESERVATION_STATUSES: Record<ReservationStatus, string> = {
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  CANCELED: "Cancelled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

// Searchable Dropdown Component (same as users page)
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: Array<{ [key: string]: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the display field name
  const displayField =
    options.length > 0
      ? Object.keys(options[0]).find((key) => key.includes("name")) ||
        Object.keys(options[0])[0]
      : "";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option[displayField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option name
  const selectedOption = options.find((option) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    return option[idField] === value;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { [key: string]: string }) => {
    const idField =
      Object.keys(option).find((key) => key.includes("id")) ||
      Object.keys(option)[0];
    onChange(option[idField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption[displayField] : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm
                  ? `No ${placeholder.toLowerCase()} found`
                  : `No ${placeholder.toLowerCase()} available`}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const idField =
                  Object.keys(option).find((key) => key.includes("id")) ||
                  Object.keys(option)[0];
                return (
                  <div
                    key={option[idField] || index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                      option[idField] === value
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option[displayField]}
                  </div>
                );
              })
            )}
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredOptions.length} of {options.length}{" "}
              {placeholder.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateReservationModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateReservationDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateReservationDto>({
    reservation_purpose: "",
    start_location: "",
    reservation_destination: "",
    departure_date: "",
    expected_returning_date: "",
    description: "",
    passengers: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.reservation_purpose.trim())
      newErrors.reservation_purpose = "Purpose is required";
    if (!form.start_location.trim())
      newErrors.start_location = "Start location is required";
    if (!form.reservation_destination.trim())
      newErrors.reservation_destination = "Destination is required";
    if (!form.departure_date)
      newErrors.departure_date = "Departure date is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.passengers || form.passengers < 1)
      newErrors.passengers = "Passengers must be at least 1";
    if (!form.expected_returning_date)
      newErrors.expected_returning_date = "Expected return date is required";
    // Validate dates
    if (form.departure_date && form.expected_returning_date) {
      const departure = new Date(form.departure_date);
      const returnDate = new Date(form.expected_returning_date);
      if (departure >= returnDate) {
        newErrors.expected_returning_date =
          "Return date must be after departure date";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "passengers" ? Number(value) : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      reservation_purpose: true,
      start_location: true,
      reservation_destination: true,
      departure_date: true,
      expected_returning_date: true,
      description: true,
      passengers: true,
    });
    if (!validateForm()) return;
    await onCreate(form);
    setForm({
      reservation_purpose: "",
      start_location: "",
      reservation_destination: "",
      departure_date: "",
      description: "",
      passengers: 1,
      expected_returning_date: "",
    });
    setTouched({});
    setErrors({});
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300 border border-blue-100">
        <div className="p-6">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-[#0872b3] transition-colors duration-200 p-1 rounded-full hover:bg-blue-50 z-10"
            onClick={onClose}
          >
            &times;
          </button>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0872b3] mb-2">
              Create Reservation
            </h2>
            <p className="text-sm text-gray-600">
              Fill in the details to create a new reservation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Row - Purpose and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Purpose
                </label>
                <Input
                  name="reservation_purpose"
                  value={form.reservation_purpose}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.reservation_purpose && touched.reservation_purpose
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.reservation_purpose && touched.reservation_purpose && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.reservation_purpose}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Description
                </label>
                <Input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.description && touched.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.description && touched.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Second Row - Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Start Location
                </label>
                <Input
                  name="start_location"
                  value={form.start_location}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.start_location && touched.start_location
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.start_location && touched.start_location && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.start_location}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Destination
                </label>
                <Input
                  name="reservation_destination"
                  value={form.reservation_destination}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.reservation_destination &&
                    touched.reservation_destination
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.reservation_destination &&
                  touched.reservation_destination && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.reservation_destination}
                    </p>
                  )}
              </div>
            </div>

            {/* Third Row - Passengers and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Passengers
                </label>
                <Input
                  name="passengers"
                  type="number"
                  min="1"
                  value={form.passengers}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.passengers && touched.passengers
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.passengers && touched.passengers && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.passengers}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Departure Date
                </label>
                <Input
                  name="departure_date"
                  type="datetime-local"
                  value={form.departure_date}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.departure_date && touched.departure_date
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.departure_date && touched.departure_date && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.departure_date}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Expected Return Date
                </label>
                <Input
                  name="expected_returning_date"
                  type="datetime-local"
                  value={form.expected_returning_date}
                  onChange={handleChange}
                  className={`h-9 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3] ${
                    errors.expected_returning_date &&
                    touched.expected_returning_date
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.expected_returning_date &&
                  touched.expected_returning_date && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.expected_returning_date}
                    </p>
                  )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-9 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold text-sm rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Reservation"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CancelReservationModal({
  open,
  onClose,
  reservation,
  onCancel,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onCancel: (rejectionComment: string) => void;
  isLoading: boolean;
}) {
  const [rejectionComment, setRejectionComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCancel(rejectionComment);
    setRejectionComment("");
    onClose();
  };

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Cancel Reservation</h2>
        <p className="text-sm text-gray-600 mb-4">
          Provide a reason for cancellation
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cancellation Reason
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Enter cancellation reason..."
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0872b3] text-white"
            disabled={isLoading || !rejectionComment.trim()}
          >
            {isLoading ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Approve/Reject Modal
function ApproveRejectModal({
  open,
  onClose,
  reservation,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onSubmit: (action: "APPROVED" | "REJECTED", reason: string) => void;
  isLoading: boolean;
}) {
  const [action, setAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const isReject = action === "REJECTED";
  const valid =
    action === "APPROVED" || (action === "REJECTED" && reason.trim());

  React.useEffect(() => {
    setReason("");
    setTouched(false);
  }, [action, open]);

  if (!open || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            onSubmit(action, reason);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Action
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={action}
              onChange={(e) =>
                setAction(e.target.value as "APPROVED" | "REJECTED")
              }
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason {isReject && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isReject
                  ? "Enter reason for rejection"
                  : "Optional reason for approval"
              }
              required={isReject}
            />
            {touched && isReject && !reason.trim() && (
              <div className="text-xs text-red-500 mt-1">
                Reason is required for rejection.
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white"
              disabled={isLoading || !valid}
            >
              {isLoading
                ? action === "APPROVED"
                  ? "Approving..."
                  : "Rejecting..."
                : action === "APPROVED"
                ? "Approve"
                : "Reject"}
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
  const canStart = reservationAccess?.start;
  const canComplete = reservationAccess?.complete;
  const canViewPage =
    canViewAll ||
    canViewOwn ||
    canCreate ||
    canCancel ||
    canApprove ||
    canAssignVehicle ||
    canUpdate ||
    canStart ||
    canComplete;

  // Always call hooks
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [approveRejectReservation, setApproveRejectReservation] =
    useState<Reservation | null>(null);

  // Enhanced data fetching based on permissions
  const {
    data: allReservations,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useReservations();
  const {
    data: myReservations,
    isLoading: isLoadingMy,
    isError: isErrorMy,
  } = useMyReservations();

  const router = useRouter();

  // Choose which data to use based on permissions - wrapped in useMemo to prevent unnecessary re-renders
  const reservations = useMemo(() => {
    if (canViewAll) {
      return allReservations || [];
    } else if (canViewOwn) {
      return myReservations
        ? Array.isArray(myReservations)
          ? myReservations
          : [myReservations]
        : [];
    }
    return [];
  }, [canViewAll, canViewOwn, allReservations, myReservations]);

  const isLoading = canViewAll
    ? isLoadingAll
    : canViewOwn
    ? isLoadingMy
    : false;
  const isError = canViewAll ? isErrorAll : canViewOwn ? isErrorMy : false;

  const createReservation = useCreateReservation();
  const cancelReservation = useCancelReservation();
  const updateReservation = useUpdateReservation();

  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter((reservation: Reservation) => {
      // Text search filter
      const matchesSearch = 
        reservation.reservation_purpose
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.start_location
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.reservation_destination
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.user?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.user?.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || reservation.reservation_status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all" && reservation.departure_date) {
        const departureDate = new Date(reservation.departure_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case "today":
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            matchesDate = departureDate >= today && departureDate < tomorrow;
            break;
          case "week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            matchesDate = departureDate >= today && departureDate < weekFromNow;
            break;
          case "month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            matchesDate = departureDate >= today && departureDate < monthFromNow;
            break;
          case "custom":
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              matchesDate = departureDate >= start && departureDate <= end;
            }
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, searchTerm, statusFilter, dateFilter, startDate, endDate]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(filteredReservations.length / pageSize);
  const paginatedReservations = filteredReservations.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  if (!canViewPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg font-semibold">
          You do not have permission to access reservations.
        </div>
      </div>
    );
  }

  const handleCreate = async (form: CreateReservationDto) => {
    if (!canCreate) {
      toast.error("You do not have permission to create reservations");
      return;
    }

    try {
      // Format dates to ISO string for backend
      const formattedForm = {
        ...form,
        departure_date: new Date(form.departure_date).toISOString(),
        expected_returning_date: new Date(
          form.expected_returning_date
        ).toISOString(),
      };
      console.log("Submitting reservation form:", formattedForm);
      await createReservation.mutateAsync(formattedForm);
    } catch {
      // error handled by mutation
    }
  };

  const handleCancelReservation = async (rejectionComment: string) => {
    if (!canCancel) {
      toast.error("You do not have permission to cancel reservations");
      return;
    }

    if (!approveRejectReservation) return;
    try {
      await cancelReservation.mutateAsync({
        id: approveRejectReservation.reservation_id,
        dto: { reason: rejectionComment },
      });
      setShowApproveRejectModal(false);
      setApproveRejectReservation(null);
    } catch {
      // error handled by mutation
    }
  };

  const handleApproveReject = async (
    action: "APPROVED" | "REJECTED",
    reason: string
  ) => {
    if (!canApprove) {
      toast.error("You do not have permission to approve/reject reservations");
      return;
    }

    if (!approveRejectReservation) return;
    try {
      // Set status to ACCEPTED when approving, REJECTED when rejecting
      const newStatus = action === 'APPROVED' ? 'ACCEPTED' : 'REJECTED';
      
      await updateReservation.mutateAsync({
        id: approveRejectReservation.reservation_id,
        dto: { status: newStatus, reason },
      });
      setShowApproveRejectModal(false);
      setApproveRejectReservation(null);
    } catch {
      // error handled by mutation
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            {canCreate && (
              <Button
                className="flex items-center gap-2 bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold px-5 py-3 rounded-lg transition-colors duration-200"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="w-4 h-4" /> Add Reservation
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              {/* Status Filter */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <SearchableDropdown
                  options={[
                    { status_id: "all", status_name: "All Statuses" },
                    ...Object.entries(RESERVATION_STATUSES).map(([key, value]) => ({
                      status_id: key,
                      status_name: value,
                    })),
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Statuses"
                  className="w-full"
                />
              </div>

              {/* Date Filter */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <SearchableDropdown
                  options={[
                    { date_id: "all", date_name: "All Dates" },
                    { date_id: "today", date_name: "Today" },
                    { date_id: "week", date_name: "This Week" },
                    { date_id: "month", date_name: "This Month" },
                    { date_id: "custom", date_name: "Custom Range" },
                  ]}
                  value={dateFilter}
                  onChange={setDateFilter}
                  placeholder="All Dates"
                  className="w-full"
                />
              </div>

              {/* Custom Date Range */}
              {dateFilter === "custom" && (
                <>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        )}
        
        {/* Active Filters Summary */}
        {(statusFilter !== "all" || dateFilter !== "all" || searchTerm) && (
          <div className="mt-3 px-4 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-blue-800">Active Filters:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Status: {RESERVATION_STATUSES[statusFilter as ReservationStatus]}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Date: {dateFilter === "custom" ? "Custom Range" : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                  <button
                    onClick={() => {
                      setDateFilter("all");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Search: &ldquo;{searchTerm}&rdquo;
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setSearchTerm("");
                }}
                className="text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <SkeletonReservationCard />
        ) : isError ? (
          <ErrorUI
            resource="reservations"
            onBack={() => router.back()}
            onRetry={() => window.location.reload()}
          />
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-100 shadow-md">
            <svg
              className="w-16 h-16 text-blue-200 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Reservations Found</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">
              There are no reservations. Try searching or create a new reservation if you have permission.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">#</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Purpose</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">User</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Start</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Destination</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Departure</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Return</TableHead>
                  <TableHead className="font-semibold text-gray-900 px-3 py-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.map((reservation, idx) => (
                  <TableRow
                    key={reservation.reservation_id}
                    className="hover:bg-blue-50 border-b border-gray-100 cursor-pointer group"
                    onClick={() => router.push(`/dashboard/shared_pages/reservations/${reservation.reservation_id}`)}
                  >
                    <TableCell className="font-mono text-gray-500 px-3">
                      {pageIndex * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-blue-800 px-3">
                      {reservation.reservation_purpose}
                    </TableCell>
                    <TableCell className="px-3">
                      {reservation.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {reservation.user.first_name} {reservation.user.last_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {reservation.user.auth?.email || "No email"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">{reservation.start_location}</TableCell>
                    <TableCell className="px-3">{reservation.reservation_destination}</TableCell>
                    <TableCell className="px-3">
                      {reservation.departure_date ? new Date(reservation.departure_date).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="px-3">
                      {reservation.expected_returning_date ? new Date(reservation.expected_returning_date).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.reservation_status)}`}>
                        {RESERVATION_STATUSES[reservation.reservation_status as ReservationStatus]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            {filteredReservations.length > pageSize && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex(0)}
                    disabled={pageIndex === 0}
                  >
                    {"<<"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    disabled={pageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    {">>"}
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  Page <strong>{pageIndex + 1} of {pageCount}</strong>
                </span>
                <span className="text-sm text-gray-600">
                  Go to page:{" "}
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      setPageIndex(Math.max(0, Math.min(page, pageCount - 1)));
                    }}
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                >
                  {[10, 20, 30, 40, 50].map(size => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
      <CancelReservationModal
        open={showCancelReservation}
        onClose={() => setShowCancelReservation(false)}
        reservation={approveRejectReservation}
        onCancel={handleCancelReservation}
        isLoading={cancelReservation.isPending}
      />
      {/* Approve/Reject Modal */}
      <ApproveRejectModal
        open={showApproveRejectModal}
        onClose={() => {
          setShowApproveRejectModal(false);
          setApproveRejectReservation(null);
        }}
        reservation={approveRejectReservation}
        onSubmit={handleApproveReject}
        isLoading={updateReservation.isPending}
      />
      {/* Edit Reason, Assign Vehicle, Complete Reservation modals are now handled on [id] page only */}
    </div>
  );
}

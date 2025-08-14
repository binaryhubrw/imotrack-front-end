"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Search, X, ChevronDown, MapPin, CheckCircle, Clock, Car, FileSpreadsheet, Filter, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import {
  useReservations,
  useMyReservations,
  useCreateReservation,

} from "@/lib/queries";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CreateReservationDto,
  ReservationStatus,
  ReservedVehicle,
} from "@/types/next-auth";
import { useAuth } from "@/hooks/useAuth";
import ErrorUI from "@/components/ErrorUI";
import { useRouter } from "next/navigation";
import { SkeletonReservationDetailPage } from "@/components/ui/skeleton";

// Status enum for better type safety
const RESERVATION_STATUSES: Record<ReservationStatus, string> = {
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  CANCELED: "Cancelled",
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.reservation_purpose && touched.reservation_purpose && (
                  <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.description && touched.description && (
                  <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.start_location && touched.start_location && (
                  <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.reservation_destination &&
                  touched.reservation_destination && (
                    <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.passengers && touched.passengers && (
                  <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.departure_date && touched.departure_date && (
                  <p className="text-xs text-orange-500 mt-1">
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
                      ? "border-orange-500 focus:border-orange-500 focus:ring-orange-500"
                      : ""
                  }`}
                />
                {errors.expected_returning_date &&
                  touched.expected_returning_date && (
                    <p className="text-xs text-orange-500 mt-1">
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

  const [showCreate, setShowCreate] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);


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

  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter((reservation) => {
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
        <div className="text-orange-500 text-lg font-semibold">
          You do not have permission to access reservations.
        </div>
      </div>
    );
  }

  const handleCreate = async (form: CreateReservationDto) => {
    if (!canCreate) {
      // toast.error("You do not have permission to create reservations");
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

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status options for filter dropdown
  const statusOptions = [
    { id: "all", name: "All Statuses" },
    { id: "UNDER_REVIEW", name: "Under Review" },
    { id: "ACCEPTED", name: "Accepted" },
    { id: "APPROVED", name: "Approved" },
    { id: "REJECTED", name: "Rejected" },
    { id: "CANCELLED", name: "Cancelled" },
    { id: "COMPLETED", name: "Completed" },
  ];

  // Excel Export Functions
  const exportReservationsToExcel = async (filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    };
  }, selectedColumns: string[]) => {
    try {
      // Apply filters
      let filteredData = filteredReservations;
      if (filters.searchTerm) {
        filteredData = filteredData.filter(reservation =>
          reservation.reservation_purpose.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          reservation.start_location.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          reservation.reservation_destination.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          reservation.user?.first_name?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          reservation.user?.last_name?.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        filteredData = filteredData.filter(reservation => reservation.reservation_status === filters.statusFilter);
      }
      if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
        filteredData = filteredData.filter(reservation => {
          const departureDate = new Date(reservation.departure_date);
          if (filters.dateRange?.startDate && departureDate < filters.dateRange.startDate) return false;
          if (filters.dateRange?.endDate && departureDate > filters.dateRange.endDate) return false;
          return true;
        });
      }

      // Transform data for Excel
      const excelData = filteredData.map(reservation => {
        const row: Record<string, string> = {};
        
        if (selectedColumns.includes('reservation_purpose')) {
          row['Purpose'] = reservation.reservation_purpose;
        }
        if (selectedColumns.includes('user_info')) {
          const userName = reservation.user ? `${reservation.user.first_name} ${reservation.user.last_name}` : 'N/A';
          row['User'] = userName;
        }
        if (selectedColumns.includes('user_phone')) {
          row['User Phone'] = reservation.user?.user_phone || 'N/A';
        }
        if (selectedColumns.includes('start_location')) {
          row['Start Location'] = reservation.start_location;
        }
        if (selectedColumns.includes('destination')) {
          row['Destination'] = reservation.reservation_destination;
        }
        if (selectedColumns.includes('departure_date')) {
          row['Departure Date'] = reservation.departure_date ? format(new Date(reservation.departure_date), 'MMM dd, yyyy HH:mm') : 'N/A';
        }
        if (selectedColumns.includes('return_date')) {
          row['Return Date'] = reservation.expected_returning_date ? format(new Date(reservation.expected_returning_date), 'MMM dd, yyyy HH:mm') : 'N/A';
        }
        if (selectedColumns.includes('status')) {
          row['Status'] = RESERVATION_STATUSES[reservation.reservation_status as ReservationStatus] || reservation.reservation_status;
        }
        if (selectedColumns.includes('passengers')) {
          row['Passengers'] = reservation.passengers.toString();
        }
        if (selectedColumns.includes('description')) {
          row['Description'] = reservation.description;
        }
        if (selectedColumns.includes('created_at')) {
          row['Created Date'] = format(new Date(reservation.created_at), 'MMM dd, yyyy');
        }
        if (selectedColumns.includes('vehicles_count')) {
          row['Vehicles Count'] = reservation.reserved_vehicles?.length?.toString() || '0';
        }
        if (selectedColumns.includes('vehicle_details')) {
          const vehicleDetails = reservation.reserved_vehicles?.map((v: ReservedVehicle) => 
            `${v.vehicle.plate_number} (${v.vehicle.vehicle_model.vehicle_model_name})`
          ).join(', ') || 'No vehicles';
          row['Vehicle Details'] = vehicleDetails;
        }
        if (selectedColumns.includes('reviewed_at')) {
          row['Reviewed Date'] = reservation.reviewed_at ? format(new Date(reservation.reviewed_at), 'MMM dd, yyyy') : 'N/A';
        }
        if (selectedColumns.includes('rejection_comment')) {
          row['Rejection Comment'] = reservation.rejection_comment || 'N/A';
        }
        
        return row;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Apply styling
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563EB" } },
        alignment: { horizontal: "center" as const }
      };

      // Apply header styling
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        worksheet[cellAddress].s = headerStyle;
      }

      // Set column widths
      worksheet['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }));

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `reservations_export_${timestamp}.xlsx`;

      // Save file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);

      // toast.success('Reservations exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      // toast.error('Failed to export reservations');
    }
  };

  // Available columns for export
  const availableColumns = [
    { key: 'reservation_purpose', label: 'Purpose', default: true },
    { key: 'user_info', label: 'User', default: true },
    { key: 'user_phone', label: 'User Phone', default: true },
    { key: 'start_location', label: 'Start Location', default: true },
    { key: 'destination', label: 'Destination', default: true },
    { key: 'departure_date', label: 'Departure Date', default: true },
    { key: 'return_date', label: 'Return Date', default: true },
    { key: 'status', label: 'Status', default: true },
    { key: 'passengers', label: 'Passengers', default: true },
    { key: 'description', label: 'Description', default: false },
    { key: 'created_at', label: 'Created Date', default: true },
    { key: 'vehicles_count', label: 'Vehicles Count', default: true },
    { key: 'vehicle_details', label: 'Vehicle Details', default: false },
    { key: 'reviewed_at', label: 'Reviewed Date', default: false },
    { key: 'rejection_comment', label: 'Rejection Comment', default: false },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Search and Filter Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <SearchableDropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
                className="h-10"
              />
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-48">
              <SearchableDropdown
                options={[
                  { id: "all", name: "All Dates" },
                  { id: "today", name: "Today" },
                  { id: "week", name: "This Week" },
                  { id: "month", name: "This Month" },
                  { id: "custom", name: "Custom Range" },
                ]}
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Filter by date"
                className="h-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canViewPage && (
              <Button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-10"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
            )}
            {canCreate && (
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-[#0872b3] hover:bg-[#065d8f] text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 h-10"
              >
                <Plus className="w-4 h-4" />
                Create Reservation
              </Button>
            )}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === "custom" && (
          <div className="flex gap-3 mt-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
              />
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-sm border-gray-300 focus:border-[#0872b3] focus:ring-[#0872b3]"
              />
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <span>Active filters:</span>
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Search: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Status: {statusOptions.find(s => s.id === statusFilter)?.name}
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Date: {dateFilter === "custom" ? "Custom Range" : dateFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
                setStartDate("");
                setEndDate("");
              }}
              className="text-orange-600 hover:text-orange-800 text-xs underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    
   {/* Stats Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 px-6 pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reservations</p>
              <p className="text-2xl font-bold text-gray-900">{filteredReservations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredReservations.filter(r => r.reservation_status === 'UNDER_REVIEW').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredReservations.filter(r => r.reservation_status === 'APPROVED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredReservations.filter(r => r.reservation_status === 'COMPLETED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
                 {isLoading ? (
           <SkeletonReservationDetailPage />
         ) : isError ? (
          <ErrorUI
            resource="reservations"
            onBack={() => router.back()}
            onRetry={() => window.location.reload()}
          />
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg">
            <div className="bg-white p-6 rounded-full shadow-md mb-6">
              <svg
                className="w-20 h-20 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5zM12 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5zM15.75 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">No Reservations Found</h3>
            <p className="text-lg text-gray-600 mb-6 text-center max-w-md leading-relaxed">
              There are no reservations matching your criteria. Try adjusting your filters or create a new reservation at top right.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Compact Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Purpose</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Departure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Return</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReservations.map((reservation, idx) => (
                    <tr
                      key={reservation.reservation_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => router.push(`/dashboard/shared_pages/reservations/${reservation.reservation_id}`)}
                    >
                      {/* Serial Number */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-gray-500 text-sm">
                          {pageIndex * pageSize + idx + 1}
                        </span>
                      </td>

                      {/* Purpose */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-blue-800 text-sm">
                          {reservation.reservation_purpose}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        {reservation.user ? (
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {reservation.user.first_name} {reservation.user.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              <span>Tel: {reservation.user.user_phone || "No Tel"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">N/A</span>
                        )}
                      </td>

                      {/* Route */}
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-900 mb-1">
                            <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="truncate max-w-32" title={reservation.start_location}>
                              {reservation.start_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <span className="truncate max-w-32" title={reservation.reservation_destination}>
                              {reservation.reservation_destination}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Departure */}
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {reservation.departure_date 
                              ? new Date(reservation.departure_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : "Not set"
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {reservation.departure_date 
                              ? new Date(reservation.departure_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : ""
                            }
                          </div>
                        </div>
                      </td>

                      {/* Return */}
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {reservation.expected_returning_date 
                              ? new Date(reservation.expected_returning_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : "Not set"
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {reservation.expected_returning_date 
                              ? new Date(reservation.expected_returning_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : ""
                            }
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.reservation_status)}`}>
                          {RESERVATION_STATUSES[reservation.reservation_status as ReservationStatus] || reservation.reservation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {filteredReservations.length > pageSize && (
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {pageIndex * pageSize + 1} to{' '}
                    {Math.min((pageIndex + 1) * pageSize, filteredReservations.length)} of{' '}
                    {filteredReservations.length} reservations
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      onClick={() => setPageIndex(0)}
                      disabled={pageIndex === 0}
                    >
                      First
                    </button>
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                    >
                      {pageIndex + 1}
                    </button>
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={pageIndex >= pageCount - 1}
                    >
                      Next
                    </button>
                    <button
                      className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      onClick={() => setPageIndex(pageCount - 1)}
                      disabled={pageIndex >= pageCount - 1}
                    >
                      Last
                    </button>
                    <select
                      className="ml-3 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                        setPageIndex(0);
                      }}
                    >
                      {[10, 20, 30, 40, 50].map(size => (
                        <option key={size} value={size}>
                          {size} per page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportReservationsToExcel}
        data={reservations}
        availableColumns={availableColumns}
        title="Reservations"
      />
      {/* Edit Reason, Assign Vehicle, Complete Reservation modals are now handled on [id] page only */}
    </div>
  );
}

// Export Modal Component
function ExportModal({
  isOpen,
  onClose,
  onExport,
  data,
  availableColumns,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    };
  }, columns: string[]) => Promise<void>;
  data: unknown[];
  availableColumns: { key: string; label: string; default?: boolean }[];
  title: string;
}) {
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all',
    startDate: '',
    endDate: ''
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.filter(col => col.default).map(col => col.key)
  );
  const [exporting, setExporting] = useState(false);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleDeselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      // toast.error('Please select at least one column to export');
      return;
    }

    setExporting(true);
    try {
      await onExport({
        searchTerm: filters.searchTerm || undefined,
        statusFilter: filters.statusFilter === 'all' ? undefined : filters.statusFilter,
        dateRange: {
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        }
      }, selectedColumns);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      startDate: '',
      endDate: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export {title}</h2>
              <p className="text-sm text-gray-600">Configure your export settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={exporting}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Term</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status Filter</label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Column Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Columns</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllColumns}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAllColumns}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableColumns.map((column) => (
                <label key={column.key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-blue-900">Total records:</span>
                <span className="text-blue-700 ml-1">{data.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Selected columns:</span>
                <span className="text-blue-700 ml-1">{selectedColumns.length}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={exporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || selectedColumns.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
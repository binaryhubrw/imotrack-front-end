"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, ChevronDown, MapPin, CheckCircle, Clock, Car, FileSpreadsheet, Filter, Calendar } from "lucide-react";
import { exportToStyledExcel } from "@/lib/excel-export";
import { format } from 'date-fns';
import {
  useReservations,
  useMyReservations,
  useCreateReservation,

} from "@/lib/queries";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type {
  CreateReservationDto,
  ReservationStatus,
  ReservedVehicle,
} from "@/types/next-auth";
import { useAuth } from "@/hooks/useAuth";
import ErrorUI from "@/components/ErrorUI";
import { useRouter } from "next/navigation";
import { SkeletonReservationDetailPage } from "@/components/ui/skeleton";

/* Staggered load animation (match dashboard) */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: (i as number) * 0.05 },
  }),
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/** Decorative circles overlay for gradient stat cards */
const CardDecoration = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute top-1/2 -left-8 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -bottom-4 right-1/3 w-20 h-20 rounded-full bg-white/5" />
  </div>
);

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

const RWANDAN_DISTRICTS = [
  { id: "Nyarugenge", name: "Nyarugenge" },
  { id: "Gasabo", name: "Gasabo" },
  { id: "Kicukiro", name: "Kicukiro" },
  { id: "Musanze", name: "Musanze" },
  { id: "Burera", name: "Burera" },
  { id: "Gicumbi", name: "Gicumbi" },
  { id: "Rulindo", name: "Rulindo" },
  { id: "Gakenke", name: "Gakenke" },
  { id: "Huye", name: "Huye" },
  { id: "Nyanza", name: "Nyanza" },
  { id: "Gisagara", name: "Gisagara" },
  { id: "Nyamagabe", name: "Nyamagabe" },
  { id: "Nyaruguru", name: "Nyaruguru" },
  { id: "Ruhango", name: "Ruhango" },
  { id: "Muhanga", name: "Muhanga" },
  { id: "Kamonyi", name: "Kamonyi" },
  { id: "Rubavu", name: "Rubavu" },
  { id: "Nyabihu", name: "Nyabihu" },
  { id: "Rutsiro", name: "Rutsiro" },
  { id: "Ngororero", name: "Ngororero" },
  { id: "Karongi", name: "Karongi" },
  { id: "Nyamasheke", name: "Nyamasheke" },
  { id: "Rusizi", name: "Rusizi" },
  { id: "Rwamagana", name: "Rwamagana" },
  { id: "Nyagatare", name: "Nyagatare" },
  { id: "Gatsibo", name: "Gatsibo" },
  { id: "Kayonza", name: "Kayonza" },
  { id: "Kirehe", name: "Kirehe" },
  { id: "Ngoma", name: "Ngoma" },
  { id: "Bugesera", name: "Bugesera" },
];

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

const STATUS_OPTIONS = [
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "COMPLETED", label: "Completed" },
];

function StatusMultiSelect({
  statusFilters,
  setStatusFilters,
}: {
  statusFilters: Set<string>;
  setStatusFilters: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggle = (id: string) =>
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div ref={containerRef} className="relative w-full sm:w-56" style={{ zIndex: 50 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer text-gray-700 select-none hover:border-gray-300 transition-colors"
      >
        <span>{statusFilters.size === 0 ? "All Statuses" : `${statusFilters.size} selected`}</span>
        <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl py-1" style={{ zIndex: 9999 }}>
          {STATUS_OPTIONS.map(({ id, label }) => (
            <label
              key={id}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={statusFilters.has(id)}
                onChange={() => toggle(id)}
                className="accent-indigo-600 w-4 h-4"
              />
              {label}
            </label>
          ))}
          {statusFilters.size > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                onClick={() => { setStatusFilters(new Set()); setOpen(false); }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear all
              </button>
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
    // Disallow past dates: departure and return must be present or future
    const now = new Date();
    if (form.departure_date) {
      const departure = new Date(form.departure_date);
      if (departure < now) {
        newErrors.departure_date =
          "Departure date must be today or in the future";
      }
    }
    if (form.expected_returning_date) {
      const returnDate = new Date(form.expected_returning_date);
      if (returnDate < now) {
        newErrors.expected_returning_date =
          "Return date must be today or in the future";
      }
    }
    // Validate return is after departure
    if (form.departure_date && form.expected_returning_date) {
      const departure = new Date(form.departure_date);
      const returnDate = new Date(form.expected_returning_date);
      if (departure >= returnDate && !newErrors.expected_returning_date) {
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

  const minDepartureDate = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const minReturnDate = form.departure_date || minDepartureDate;

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
              Fill in the details to create a new reservation (fields marked with <span className="text-orange-500">*</span> are required)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Row - Purpose and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0872b3] mb-1">
                  Purpose <span className="text-orange-500">*</span>
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
                  Description <span className="text-orange-500">*</span>
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
                  Start Location <span className="text-orange-500">*</span>
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
                  Destination <span className="text-orange-500">*</span>
                </label>
                <SearchableDropdown
                  options={RWANDAN_DISTRICTS}
                  value={form.reservation_destination}
                  onChange={(val) => {
                    setForm({ ...form, reservation_destination: val });
                    if (errors.reservation_destination) {
                      setErrors({ ...errors, reservation_destination: "" });
                    }
                  }}
                  placeholder="Select Destination District"
                  className={`h-9 ${
                    errors.reservation_destination &&
                    touched.reservation_destination
                      ? "border-orange-500"
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
                  Passengers <span className="text-orange-500">*</span>
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
                  Departure Date <span className="text-orange-500">*</span>
                </label>
                <Input
                  name="departure_date"
                  type="datetime-local"
                  min={minDepartureDate}
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
                  Expected Return Date <span className="text-orange-500">*</span>
                </label>
                <Input
                  name="expected_returning_date"
                  type="datetime-local"
                  min={minReturnDate}
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
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);


  // Only fetch when user has permission (avoids 403/400)
  const {
    data: allReservations,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useReservations({ enabled: canViewAll });
  const {
    data: myReservations,
    isLoading: isLoadingMy,
    isError: isErrorMy,
  } = useMyReservations({ enabled: canViewOwn });

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
      const matchesStatus = statusFilters.size === 0 || statusFilters.has(reservation.reservation_status);

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
  }, [reservations, searchTerm, statusFilters, dateFilter, startDate, endDate]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(filteredReservations.length / pageSize);
  const paginatedReservations = filteredReservations.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  if (!canViewPage) {
    return (
      <motion.div
        className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="p-8 text-center border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-gray-100/80">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Access</h3>
            <p className="text-gray-600 text-sm">You do not have permission to access reservations.</p>
          </div>
        </Card>
      </motion.div>
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
        if (selectedColumns.includes('odometer_logic')) {
          const startOdo = reservation.reserved_vehicles?.[0]?.starting_odometer || 'N/A';
          const endOdo = reservation.reserved_vehicles?.[0]?.ending_odometer || 'N/A';
          row['Starting Odometer'] = startOdo.toString();
          row['Ending Odometer'] = endOdo.toString();
          if (typeof startOdo === 'number' && typeof endOdo === 'number') {
            row['Total Distance'] = (endOdo - startOdo).toString();
          }
        }
        if (selectedColumns.includes('fuel_details')) {
          row['Fuel Level (Start)'] = reservation.reserved_vehicles?.[0]?.starting_fuel_level || 'N/A';
          row['Fuel Level (End)'] = reservation.reserved_vehicles?.[0]?.ending_fuel_level || 'N/A';
          row['Fuel Provided'] = reservation.reserved_vehicles?.[0]?.fuel_provided?.toString() || '0';
        }
        if (selectedColumns.includes('reviewed_at')) {
          row['Reviewed Date'] = reservation.reviewed_at ? format(new Date(reservation.reviewed_at), 'MMM dd, yyyy') : 'N/A';
        }
        if (selectedColumns.includes('rejection_comment')) {
          row['Rejection Comment'] = reservation.rejection_comment || 'N/A';
        }
        
        return row;
      });

      const filtersParts: string[] = [];
      if (filters.searchTerm) filtersParts.push(`Search: ${filters.searchTerm}`);
      if (filters.statusFilter && filters.statusFilter !== "all") filtersParts.push(`Status: ${filters.statusFilter}`);
      if (filters.dateRange?.startDate) filtersParts.push(`From: ${format(filters.dateRange.startDate, "dd/MM/yyyy")}`);
      if (filters.dateRange?.endDate) filtersParts.push(`To: ${format(filters.dateRange.endDate, "dd/MM/yyyy")}`);

      const columns = Object.keys(excelData[0] || {});
      await exportToStyledExcel({
        title: "ImoTrak - Reservations Export",
        sheetName: "Reservations",
        columns,
        data: excelData,
        filename: "reservations_export",
        filters: filtersParts.join("; ") || "(none)",
        statusColumn: "Status",
        statusColors: {
          PAID: "FFC6EFCE", COMPLETED: "FFC6EFCE", APPROVED: "FFC6EFCE",
          PENDING: "FFFFEB9C", REJECTED: "FFFFC7CE", CANCELLED: "FFFFC7CE",
          Accepted: "FFC6EFCE", Approved: "FFC6EFCE", Completed: "FFC6EFCE",
          Pending: "FFFFEB9C", Rejected: "FFFFC7CE", Cancelled: "FFFFC7CE",
        },
        columnWidths: columns.map(() => 20),
      });
    } catch (error) {
      console.error("Export error:", error);
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
    <motion.div
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/40 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
        {/* Header - match dashboard */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Reservations
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage trip requests and vehicle reservations • {filteredReservations.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-100 shadow-md"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString()}
              </span>
            </motion.div>
            {canViewPage && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowExportModal(true)}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-gray-300 h-10"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </Button>
              </motion.div>
            )}
            {canCreate && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowCreate(true)}
                  className="bg-[#0872b3] hover:bg-[#066399] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-colors flex items-center gap-2 h-10"
                >
                  <Plus className="w-4 h-4" />
                  Create Reservation
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards - gradient style + stagger (match dashboard) */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Total</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Car className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">{filteredReservations.length}</p>
            </div>
          </motion.div>
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Under Review</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
                {filteredReservations.filter(r => r.reservation_status === "UNDER_REVIEW").length}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Approved</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
                {filteredReservations.filter(r => r.reservation_status === "APPROVED").length}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="relative rounded-xl shadow-lg p-6 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
            variants={itemVariants}
          >
            <CardDecoration />
            <div className="relative flex flex-col h-full min-h-[100px]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/95 text-sm font-medium uppercase tracking-wider">Completed</p>
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
                {filteredReservations.filter(r => r.reservation_status === "COMPLETED").length}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters card */}
        <motion.div
          className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl relative z-30 overflow-visible"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-white/80">
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
              />
            </div>
            <StatusMultiSelect statusFilters={statusFilters} setStatusFilters={setStatusFilters} />
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-0.5">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setDateFilter("custom"); }}
                  className="h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-0.5">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setDateFilter("custom"); }}
                  className="h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); setDateFilter("all"); }}
                  className="mt-4 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear dates"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {(searchTerm || statusFilters.size > 0 || startDate || endDate) && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-gray-100 text-sm text-gray-600 bg-gray-50/30">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg text-xs font-medium">
                  Search: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
              {statusFilters.size > 0 && [...statusFilters].map((s) => (
                <span key={s} className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  {statusOptions.find((o) => o.id === s)?.name ?? s}
                  <button onClick={() => setStatusFilters((prev) => { const n = new Set(prev); n.delete(s); return n; })} className="hover:text-red-600">×</button>
                </span>
              ))}
              {(startDate || endDate) && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium">
                  Date: {startDate || "…"} → {endDate || "…"}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilters(new Set());
                  setDateFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <SkeletonReservationDetailPage />
        ) : isError ? (
          <ErrorUI
            resource="reservations"
            onBack={() => router.back()}
            onRetry={() => window.location.reload()}
          />
        ) : filteredReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="p-8 text-center border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-gray-100/80">
                  <Calendar className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Reservations Found</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  There are no reservations matching your criteria. Try adjusting your filters or create a new reservation.
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden min-w-0 relative z-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Purpose</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Departure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Return</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                    {canAssignVehicle && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Map</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReservations.map((reservation, idx) => (
                    <tr
                      key={reservation.reservation_id}
                      className="hover:bg-indigo-50/70 cursor-pointer transition-colors duration-150"
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

                      {/* Map — fleet manager only */}
                      {canAssignVehicle && (
                        <td className="py-3 px-4">
                          {reservation.reserved_vehicles && reservation.reserved_vehicles.length > 0 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rv = (reservation.reserved_vehicles as ReservedVehicle[])[0];
                                const vehicleId = rv?.vehicle_id ?? rv?.vehicle?.vehicle_id;
                                const tripId = rv?.reserved_vehicle_id;
                                if (vehicleId) {
                                  const qs = tripId ? `?trip=${encodeURIComponent(tripId)}` : '';
                                  router.push(`/dashboard/shared_pages/vehicles/${vehicleId}/locations${qs}`);
                                }
                              }}
                              title="View trip on map"
                              className="p-2 rounded-lg text-[#0872b3] hover:bg-[#0872b3]/10 transition-colors"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs px-2">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredReservations.length > pageSize && (
              <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Showing {pageIndex * pageSize + 1} to{' '}
                  {Math.min((pageIndex + 1) * pageSize, filteredReservations.length)} of{' '}
                  {filteredReservations.length} reservations
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-gray-200"
                    onClick={() => setPageIndex(0)}
                    disabled={pageIndex === 0}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-gray-200"
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    disabled={pageIndex === 0}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
                    {pageIndex + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-gray-200"
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-gray-200"
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Last
                  </Button>
                  <select
                    className="ml-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
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
            )}
          </motion.div>
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
    </motion.div>
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
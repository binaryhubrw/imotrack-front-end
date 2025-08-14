"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Search,
  Eye,
  Plus,
  MessageSquare,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import {
  useVehicleIssues,
  useCreateVehicleIssue,
  useMyReservations,
  useRespondToVehicleIssue,
} from "@/lib/queries";
import ErrorUI from "@/components/ErrorUI";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import { SkeletonVehiclesTable } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateVehicleIssueDto, Reservation } from "@/types/next-auth";
import { toast } from "sonner";
import { toastStyles } from "@/lib/toast-config";

// Report Issue Modal Component
function ReportIssueModal({
  open,
  onClose,
  reservations,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onSubmit: (data: CreateVehicleIssueDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateVehicleIssueDto>({
    issue_title: "",
    issue_description: "",
    reserved_vehicle_id: "",
    message: "",
    issue_date: new Date().toISOString().split("T")[0],
  });
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get the selected reservation and its reserved vehicle
  const selectedReservation = reservations?.find(
    (r) => r.reservation_id === selectedReservationId
  );
  const selectedReservedVehicle = selectedReservation?.reserved_vehicles?.[0]; // Assuming one vehicle per reservation

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.issue_title.trim())
      newErrors.issue_title = "Issue title is required";
    if (!form.issue_description.trim())
      newErrors.issue_description = "Issue description is required";
    if (!selectedReservationId)
      newErrors.reservation = "Please select a reservation";
    if (!form.issue_date) newErrors.issue_date = "Issue date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Set the reserved_vehicle_id from the selected reservation
    const issueData = {
      ...form,
      reserved_vehicle_id: selectedReservedVehicle?.reserved_vehicle_id || "",
      issue_date: new Date(form.issue_date).toISOString(), // Convert to ISO string
    };

    await onSubmit(issueData);
    setForm({
      issue_title: "",
      issue_description: "",
      reserved_vehicle_id: "",
      message: "",
      issue_date: new Date().toISOString().split("T")[0],
    });
    setSelectedReservationId("");
    setErrors({});
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleReservationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reservationId = e.target.value;
    setSelectedReservationId(reservationId);
    if (errors.reservation) setErrors((prev) => ({ ...prev, reservation: "" }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Report Vehicle Issue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title *
              </label>
              <input
                name="issue_title"
                value={form.issue_title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.issue_title ? "border-red-500" : ""
                }`}
                required
              />
              {errors.issue_title && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.issue_title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description *
              </label>
              <textarea
                name="issue_description"
                value={form.issue_description}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed description of the issue..."
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.issue_description ? "border-red-500" : ""
                }`}
                required
              />
              {errors.issue_description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.issue_description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Reservation *
              </label>
              <select
                value={selectedReservationId}
                onChange={handleReservationChange}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reservation ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Select a reservation</option>
                {reservations
                  ?.filter(
                    (reservation) =>
                      reservation.reserved_vehicles &&
                      reservation.reserved_vehicles.length > 0 &&
                      reservation.reservation_status === "APPROVED"
                  )
                  .map((reservation) => {
                    console.log("Reservation for dropdown:", reservation);
                    console.log(
                      "Reserved vehicles:",
                      reservation.reserved_vehicles
                    );
                    const vehicle = reservation.reserved_vehicles?.[0]?.vehicle;
                    console.log("Vehicle data:", vehicle);
                    return (
                      <option
                        key={reservation.reservation_id}
                        value={reservation.reservation_id}
                      >
                        {reservation.reservation_purpose} -{" "}
                        {vehicle?.plate_number }
                      </option>
                    );
                  })}
              </select>
              {errors.reservation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.reservation}
                </p>
              )}
            </div>

            {/* Show selected vehicle info */}
            {selectedReservedVehicle && (
              <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Vehicle:</strong>{" "}
                  {selectedReservedVehicle.vehicle?.plate_number }
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  <strong>Reservation Purpose:</strong>{" "}
                  {selectedReservation?.reservation_purpose || "Unknown"}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Status:</strong>{" "}
                  {selectedReservation?.reservation_status || "Unknown"}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                name="issue_date"
                type="date"
                value={form.issue_date}
                onChange={handleChange}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.issue_date ? "border-red-500" : ""
                }`}
                required
              />
              {errors.issue_date && (
                <p className="text-xs text-red-500 mt-1">{errors.issue_date}</p>
              )}
            </div>

            {/* Error Message */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  Please fix the errors above
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Reporting..." : "Report Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Response Modal Component
function ResponseModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Response message is required");
      return;
    }
    
    await onSubmit(message);
    setMessage("");
    setError("");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (error) setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Respond to Issue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Response *
              </label>
              <textarea
                value={message}
                onChange={handleChange}
                rows={4}
                placeholder="Type your response to this issue..."
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? "border-red-500" : ""
                }`}
                required
              />
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Response"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VehicleIssuesPage() {
  const { data: issues = [], isLoading, isError } = useVehicleIssues();
  const { data: reservations = [] } = useMyReservations();
  const createIssue = useCreateVehicleIssue();
  const respondToIssue = useRespondToVehicleIssue();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showReportModal, setShowReportModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);
  const router = useRouter();

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicleIssues?.view;
  const canReport = !!user?.position?.position_access?.vehicleIssues?.report;
  const canRespond = !!user?.position?.position_access?.vehicleIssues?.update;

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issue_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && issue.issue_status === "OPEN") ||
        (filter === "closed" && issue.issue_status === "CLOSED");
      return matchesSearch && matchesFilter;
    });
  }, [issues, searchTerm, filter]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleReportIssue = async (data: CreateVehicleIssueDto) => {
    try {
      await createIssue.mutateAsync(data);
      setShowReportModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleRespondToIssue = async (message: string) => {
    try {
      await respondToIssue.mutateAsync({ 
        issueId: selectedIssueId, 
        message 
      });
      setShowResponseModal(false);
      setSelectedIssueId("");
    } catch {
      // Error handled by mutation
    }
  };

  // Excel Export Functions
  const exportVehicleIssuesToExcel = async (filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: {
      startDate?: Date;
      endDate?: Date;
    };
  }, selectedColumns: string[]) => {
    try {
      // Filter data based on current filters
      const filteredData = issues.filter((issue) => {
        const matchesSearch = !filters.searchTerm || 
          issue.issue_title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          issue.issue_description.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        const matchesStatus = !filters.statusFilter || 
          filters.statusFilter === 'all' ||
          (filters.statusFilter === 'open' && issue.issue_status === 'OPEN') ||
          (filters.statusFilter === 'closed' && issue.issue_status === 'CLOSED');
        
        const matchesDateRange = !filters.dateRange?.startDate || !filters.dateRange?.endDate ||
          (new Date(issue.issue_date) >= filters.dateRange.startDate && 
           new Date(issue.issue_date) <= filters.dateRange.endDate);
        
        return matchesSearch && matchesStatus && matchesDateRange;
      });

      // Transform data for Excel
      const excelData = filteredData.map((issue) => {
        const row: Record<string, string> = {};
        
        if (selectedColumns.includes('issue_title')) {
          row['Issue Title'] = issue.issue_title;
        }
        if (selectedColumns.includes('issue_status')) {
          row['Issue Status'] = issue.issue_status;
        }
        if (selectedColumns.includes('issue_description')) {
          row['Issue Description'] = issue.issue_description;
        }
        if (selectedColumns.includes('issue_date')) {
          row['Issue Date'] = format(new Date(issue.issue_date), 'MMM dd, yyyy HH:mm');
        }
        if (selectedColumns.includes('created_at')) {
          row['Created At'] = format(new Date(issue.created_at), 'MMM dd, yyyy HH:mm');
        }
        if (selectedColumns.includes('updated_at')) {
          row['Updated At'] = issue.updated_at ? format(new Date(issue.updated_at), 'MMM dd, yyyy HH:mm') : 'N/A';
        }
        if (selectedColumns.includes('message')) {
          row['Reviewer Message'] = typeof issue.message === 'string' ? issue.message : 'N/A';
        }
        if (selectedColumns.includes('issue_responder')) {
          row['Issue Responder'] = issue.issue_responder || 'N/A';
        }
        if (selectedColumns.includes('vehicle_details')) {
          const vehicleDetails = issue.reserved_vehicle && typeof issue.reserved_vehicle === 'object' && 'vehicle' in issue.reserved_vehicle
            ? (issue.reserved_vehicle.vehicle as Record<string, unknown>)?.plate_number as string || 'N/A'
            : 'N/A';
          row['Vehicle Plate Number'] = vehicleDetails;
        }
        if (selectedColumns.includes('reservation_details')) {
          const reservationDetails = issue.reserved_vehicle && typeof issue.reserved_vehicle === 'object' && 'reservation' in issue.reserved_vehicle
            ? (issue.reserved_vehicle.reservation as Record<string, unknown>)?.reservation_purpose as string || 'N/A'
            : 'N/A';
          row['Reservation Purpose'] = reservationDetails;
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
      worksheet['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: 25 }));

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Issues Report');

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `vehicle_issues_${timestamp}.xlsx`;

      // Save file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);

      toast.success('Vehicle issues exported successfully!', {
        style: toastStyles.success.style,
        duration: toastStyles.success.duration,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export vehicle issues', {
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });
    }
  };

  // Available columns for export
  const availableColumns = [
    { key: 'issue_title', label: 'Issue Title', default: true },
    { key: 'issue_status', label: 'Issue Status', default: true },
    { key: 'issue_description', label: 'Issue Description', default: true },
    { key: 'issue_date', label: 'Issue Date', default: true },
    { key: 'created_at', label: 'Created At', default: true },
    { key: 'updated_at', label: 'Updated At', default: false },
    { key: 'message', label: 'Reviewer Message', default: true },
    { key: 'issue_responder', label: 'Issue Responder', default: false },
    { key: 'vehicle_details', label: 'Vehicle Plate Number', default: true },
    { key: 'reservation_details', label: 'Reservation Purpose', default: true },
  ];

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="vehicle issues" />;
  }

  if (isLoading) {
    return <SkeletonVehiclesTable />;
  }

  if (isError) {
    return (
      <ErrorUI
        resource="vehicle issues"
        onBack={() => router.back()}
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  const openIssuesCount = issues.filter(
    (issue) => issue.issue_status === "OPEN"
  ).length;
  const closedIssuesCount = issues.filter(
    (issue) => issue.issue_status === "CLOSED"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
                {openIssuesCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg border-2 border-white"
                  >
                    {openIssuesCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Vehicle Issues
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    {openIssuesCount} open issues
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    {closedIssuesCount} resolved
                  </span>
                </p>
              </div>
            </div>
            {canReport && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowReportModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Report Issue
                </Button>
              </motion.div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search issues by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm text-gray-900 placeholder-gray-500"
              />
            </div>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium text-gray-900 cursor-pointer hover:bg-white transition-all duration-200"
            >
              <option value="all">All Issues</option>
              <option value="open">Open Issues</option>
              <option value="closed">Closed Issues</option>
            </motion.select>
            {canView && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Issues Table */}
        <AnimatePresence mode="popLayout">
          {filteredIssues.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">
                No issues found
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No vehicle issues have been reported yet"}
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Issue Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Issue Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredIssues.map((issue, idx) => (
                      <tr
                        key={issue.issue_id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => router.push(`/dashboard/shared_pages/vehicle-issues/${issue.issue_id}`)}
                      >
                        {/* Serial Number */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-gray-500 text-sm">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Issue Title */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-blue-800 text-sm max-w-48 truncate" title={issue.issue_title}>
                            {issue.issue_title}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 max-w-64 truncate" title={issue.issue_description}>
                            {issue.issue_description}
                          </div>
                        </td>


                        {/* Issue Date */}
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {new Date(issue.issue_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            issue.issue_status === "OPEN" 
                              ? "bg-red-100 text-red-700 border border-red-200" 
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}>
                            {issue.issue_status}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatTimeAgo(issue.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(issue.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/shared_pages/vehicle-issues/${issue.issue_id}`);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canRespond && issue.issue_status === "OPEN" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIssueId(issue.issue_id);
                                  setShowResponseModal(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                                title="Respond to Issue"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Report Issue Modal */}
      <ReportIssueModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        reservations={reservations as Reservation[]}
        onSubmit={handleReportIssue}
        isLoading={createIssue.isPending}
      />

      {/* Response Modal */}
      <ResponseModal
        open={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedIssueId("");
        }}
        onSubmit={handleRespondToIssue}
        isLoading={respondToIssue.isPending}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportVehicleIssuesToExcel}
        data={issues}
        availableColumns={availableColumns}
        title="Vehicle Issues"
      />
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
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
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
      toast.error('Please select at least one column to export', {
        style: toastStyles.error.style,
        duration: toastStyles.error.duration,
      });
      return;
    }

    setExporting(true);
    try {
      await onExport(filters, selectedColumns);
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
      startDate: undefined,
      endDate: undefined,
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
          {/* Filter Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Term</label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Search in title or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Issues</option>
                  <option value="closed">Closed Issues</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    startDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
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
                <span className="font-medium text-blue-900">Selected columns:</span>
                <span className="text-blue-700 ml-1">{selectedColumns.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Total records:</span>
                <span className="text-blue-700 ml-1">{data.length}</span>
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

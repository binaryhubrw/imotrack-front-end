"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Car,
  Clock,
  Download,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useVehicleIssue,
  useUpdateVehicleIssue,
  useDeleteVehicleIssue,
} from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { FC } from "react";

// All possible status values for vehicle issues
const STATUS_LABELS: Record<string, string> = {
  OPEN: "Reported",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  IN_PROGRESS: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  RESOLVED: "bg-green-100 text-green-800 hover:bg-green-100",
  CLOSED: "bg-gray-200 text-gray-800 hover:bg-gray-200",
};

const VehicleDetailsCard: FC<{
  vehicle: {
    vehicle_photo?: string;
    plate_number?: string;
    vehicle_model?: string;
    vehicle_year?: number;
    vehicle_capacity?: number;
    vehicle_status?: string;
    energy_type?: string;
  };
}> = ({ vehicle }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-600" /> Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {vehicle.vehicle_photo && (
            <img
              src={vehicle.vehicle_photo}
              alt={vehicle.plate_number || "Vehicle Photo"}
              className="w-40 h-28 object-cover rounded-lg border shadow"
            />
          )}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Plate Number</p>
              <p className="font-medium text-gray-900">
                {vehicle.plate_number || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Year</p>
              <p className="font-medium text-gray-900">
                {vehicle.vehicle_year || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="font-medium text-gray-900">
                {vehicle.vehicle_capacity || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-medium text-gray-900">
                {vehicle.vehicle_status || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Energy Type</p>
              <p className="font-medium text-gray-900">
                {vehicle.energy_type || "-"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReservationDetailsCard: FC<{
  reservation: {
    reservation_purpose?: string;
    start_location?: string;
    reservation_destination?: string;
    departure_date?: string;
    expected_returning_date?: string;
    passengers?: number;
    reservation_status?: string;
  };
}> = ({ reservation }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" /> Reservation Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Purpose</p>
            <p className="font-medium text-gray-900">
              {reservation.reservation_purpose || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Start Location</p>
            <p className="font-medium text-gray-900">
              {reservation.start_location || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Destination</p>
            <p className="font-medium text-gray-900">
              {reservation.reservation_destination || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Departure Date</p>
            <p className="font-medium text-gray-900">
              {reservation.departure_date
                ? new Date(reservation.departure_date).toLocaleString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Expected Return</p>
            <p className="font-medium text-gray-900">
              {reservation.expected_returning_date
                ? new Date(reservation.expected_returning_date).toLocaleString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Passengers</p>
            <p className="font-medium text-gray-900">
              {reservation.passengers || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-medium text-gray-900">
              {reservation.reservation_status || "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const {
    data: issue,
    isLoading,
    isError,
    error,
    refetch,
  } = useVehicleIssue(issueId);
  const updateVehicleIssue = useUpdateVehicleIssue();
  const deleteVehicleIssue = useDeleteVehicleIssue();
  const { user, isLoading: authLoading } = useAuth();

  // Debug logging
  console.log("IssueDetailsPage Debug:", {
    issueId,
    issue,
    isLoading,
    isError,
    error: error?.message,
    params: params,
    url: window.location.href,
  });

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicleIssues?.view;
  const canUpdate = !!user?.position?.position_access?.vehicleIssues?.update;
  const canDelete = !!user?.position?.position_access?.vehicleIssues?.delete;
  const hasAnyPermission = canView || canUpdate || canDelete;

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    issue_title: "",
    issue_description: "",
    issued_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize edit form when issue data is available
  useEffect(() => {
    if (issue) {
      // Convert ISO date string to YYYY-MM-DD format for date input
      const formatDateForInput = (dateString: string) => {
        return new Date(dateString).toISOString().split("T")[0];
      };

      setEditForm({
        issue_title: issue.issue_title || "",
        issue_description: issue.issue_description || "",
        issued_date: issue.issue_date
          ? formatDateForInput(issue.issue_date)
          : new Date().toISOString().split("T")[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue]);

  // Status badge component
  const getStatusBadge = (status: string) => (
    <Badge
      className={
        STATUS_BADGE[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      }
    >
      {STATUS_LABELS[status] || status}
    </Badge>
  );

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "RESOLVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "CLOSED":
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Export as text report
  const generateReport = () => {
    if (!issue) return;
    const reportData = `
Issue Report
============

Title: ${issue.issue_title}
Status: ${issue.issue_status}
Date Reported: ${new Date(issue.issue_date).toLocaleString()}

Description:
${issue.issue_description}

---
Generated on: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `issue_report_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit handlers
  const handleEdit = () => {
    if (!canUpdate) {
      toast.error("You do not have permission to update vehicle issues");
      return;
    }
    setShowEditModal(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      toast.error("You do not have permission to update vehicle issues");
      return;
    }
    setSubmitting(true);
    try {
      // Convert date input back to ISO string format
      const updates = {
        issue_title: editForm.issue_title,
        issue_description: editForm.issue_description,
        issued_date: new Date(editForm.issued_date).toISOString(),
      };

      await updateVehicleIssue.mutateAsync({
        issueId,
        updates,
      });
      toast.success("Issue updated successfully!");
      setShowEditModal(false);
      refetch();
    } catch {
      toast.error("Failed to update issue");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const handleDelete = () => {
    if (!canDelete) {
      toast.error("You do not have permission to delete vehicle issues");
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!canDelete) return;
    try {
      await deleteVehicleIssue.mutateAsync({ issueId });
      toast.success("Issue deleted successfully!");
      router.push("/dashboard/shared_pages/vehicle-issues");
    } catch {
      toast.error("Failed to delete issue");
    }
  };

  // Loading and permission states
  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!hasAnyPermission) {
    return <NoPermissionUI resource="vehicle issues" />;
  }
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0872B3]" />
          </div>
        </div>
      </main>
    );
  }
  if (isError || !issue) {
    return (
      <main className="min-h-screen bg-[#e6f2fa] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Issue Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The issue could not be found. Issue ID: {issueId}
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-red-800 font-medium">Error Details:</p>
                  <p className="text-red-600 text-sm">{error.message}</p>
                </div>
              )}
              <Button
                onClick={() =>
                  router.push("/dashboard/shared_pages/vehicle-issues")
                }
                className="bg-[#0872B3] hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Issue History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Main render
  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() =>
              router.push("/dashboard/shared_pages/vehicle-issues")
            }
            variant="ghost"
            className="text-[#0872B3] hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Issues
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={generateReport}
              variant="outline"
              className="border-[#0872B3] text-[#0872B3] hover:bg-[#0872B3] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            {canUpdate && (
              <Button
                onClick={handleEdit}
                className="text-white bg-[#0872B3] hover:bg-[#065d8f]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Issue
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="bg-red-400 hover:bg-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                DisActivate Issue
              </Button>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.issue_status)}
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        {issue.issue_title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Reported {new Date(issue.issue_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(issue.issue_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {issue.issue_description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {"updated_at" in issue && issue.updated_at
                            ? new Date(
                                issue.updated_at as string
                              ).toLocaleString()
                            : issue.created_at
                            ? new Date(issue.created_at).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details Card */}
            {issue.reserved_vehicle &&
            typeof issue.reserved_vehicle === "object" &&
            "vehicle" in issue.reserved_vehicle &&
            issue.reserved_vehicle.vehicle ? (
              <VehicleDetailsCard vehicle={issue.reserved_vehicle.vehicle} />
            ) : null}

            {/* Reservation Details Card */}
            {issue.reserved_vehicle &&
            typeof issue.reserved_vehicle === "object" &&
            "reservation" in issue.reserved_vehicle &&
            issue.reserved_vehicle.reservation ? (
              <ReservationDetailsCard
                reservation={issue.reserved_vehicle.reservation}
              />
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Status Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    {getStatusIcon(issue.issue_status)}
                    <p className="mt-2 font-medium text-gray-900">
                      {STATUS_LABELS[issue.issue_status] || issue.issue_status}
                    </p>
                    <p className="text-sm text-gray-600">
                      {issue.issue_status === "OPEN" &&
                        "Issue has been reported and is awaiting review"}
                      {issue.issue_status === "IN_PROGRESS" &&
                        "Issue is currently being addressed"}
                      {issue.issue_status === "RESOLVED" &&
                        "Issue has been resolved"}
                      {issue.issue_status === "CLOSED" &&
                        "Issue has been closed"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="text-white w-full bg-[#0872B3] hover:bg-[#065d8f]">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    If you need immediate assistance, please contact the fleet
                    management team.
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Emergency Alert */}
            {issue.issue_status === "OPEN" && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  This issue has been reported and is awaiting review. You will
                  be notified once it is being addressed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && canUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleEditSave}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 flex flex-col gap-6"
          >
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Vehicle Issue
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update the issue details below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Issue Title
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
                  value={editForm.issue_title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, issue_title: e.target.value }))
                  }
                  required
                  placeholder="Enter issue title"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Description
                </label>
                <Textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
                  value={editForm.issue_description}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      issue_description: e.target.value,
                    }))
                  }
                  required
                  rows={4}
                  placeholder="Describe the issue in detail"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
                  value={editForm.issued_date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, issued_date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-[#0872B3] text-white rounded-lg hover:bg-[#065d8f] transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && canDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>DisActivate Vehicle Issue</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disactivate &quot;{issue.issue_title}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                DisActivate Issue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}

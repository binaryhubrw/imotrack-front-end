'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, Eye, Clock, Plus, Calendar, } from 'lucide-react';
import { useVehicleIssues, useCreateVehicleIssue, useReservations } from '@/lib/queries';
import ErrorUI from '@/components/ErrorUI';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NoPermissionUI from '@/components/NoPermissionUI';
import Link from 'next/link';
import { SkeletonVehiclesTable } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateVehicleIssueDto, Reservation } from '@/types/next-auth';

// Report Issue Modal Component
function ReportIssueModal({ 
  open, 
  onClose, 
  reservations, 
  onSubmit, 
  isLoading 
}: {
  open: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onSubmit: (data: CreateVehicleIssueDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateVehicleIssueDto>({
    issue_title: '',
    issue_description: '',
    reserved_vehicle_id: '',
    issue_date: new Date().toISOString().split('T')[0]
  });
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get the selected reservation and its reserved vehicle
  const selectedReservation = reservations?.find(r => r.reservation_id === selectedReservationId);
  const selectedReservedVehicle = selectedReservation?.reserved_vehicles?.[0]; // Assuming one vehicle per reservation

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.issue_title.trim()) newErrors.issue_title = 'Issue title is required';
    if (!form.issue_description.trim()) newErrors.issue_description = 'Issue description is required';
    if (!selectedReservationId) newErrors.reservation = 'Please select a reservation';
    if (!form.issue_date) newErrors.issue_date = 'Issue date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Set the reserved_vehicle_id from the selected reservation
    const issueData = {
      ...form,
      reserved_vehicle_id: selectedReservedVehicle?.reserved_vehicle_id || '',
      issue_date: new Date(form.issue_date).toISOString() // Convert to ISO string
    };
    
    await onSubmit(issueData);
    setForm({
      issue_title: '',
      issue_description: '',
      reserved_vehicle_id: '',
      issue_date: new Date().toISOString().split('T')[0]
    });
    setSelectedReservationId('');
    setErrors({});
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleReservationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reservationId = e.target.value;
    setSelectedReservationId(reservationId);
    if (errors.reservation) setErrors(prev => ({ ...prev, reservation: '' }));
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
                  errors.issue_title ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.issue_title && (
                <p className="text-xs text-red-500 mt-1">{errors.issue_title}</p>
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
                  errors.issue_description ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.issue_description && (
                <p className="text-xs text-red-500 mt-1">{errors.issue_description}</p>
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
                  errors.reservation ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Select a reservation</option>
                                 {reservations
                   ?.filter(reservation => reservation.reserved_vehicles && reservation.reserved_vehicles.length > 0)
                   .map(reservation => {
                     console.log('Reservation for dropdown:', reservation);
                     console.log('Reserved vehicles:', reservation.reserved_vehicles);
                     const vehicle = reservation.reserved_vehicles?.[0]?.vehicle;
                     console.log('Vehicle data:', vehicle);
                     return (
                       <option key={reservation.reservation_id} value={reservation.reservation_id}>
                         {reservation.reservation_purpose} - {vehicle?.plate_number || vehicle?.license_plate || 'Unknown Vehicle'}
                       </option>
                     );
                   })}
              </select>
              {errors.reservation && (
                <p className="text-xs text-red-500 mt-1">{errors.reservation}</p>
              )}
            </div>

                         {/* Show selected vehicle info */}
             {selectedReservedVehicle && (
               <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                 <p className="text-sm text-blue-800">
                   <strong>Vehicle:</strong> {selectedReservedVehicle.vehicle?.plate_number || selectedReservedVehicle.vehicle?.license_plate || 'Unknown'}
                 </p>
                  
                 <p className="text-sm text-blue-700 mt-1">
                   <strong>Reservation Purpose:</strong> {selectedReservation?.reservation_purpose || 'Unknown'}
                 </p>
                 <p className="text-sm text-blue-700 mt-1">
                   <strong>Status:</strong> {selectedReservation?.reservation_status || 'Unknown'}
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
                  errors.issue_date ? 'border-red-500' : ''
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
                <p className="text-sm text-red-600">Please fix the errors above</p>
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
                {isLoading ? 'Reporting...' : 'Report Issue'}
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
  const { data: reservations = [] } = useReservations();
  const createIssue = useCreateVehicleIssue();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Permission checks
  const canView = !!user?.position?.position_access?.vehicleIssues?.view;
  const canReport = !!user?.position?.position_access?.vehicleIssues?.report;

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.issue_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'open' && issue.issue_status === 'OPEN') ||
                           (filter === 'closed' && issue.issue_status === 'CLOSED');
      return matchesSearch && matchesFilter;
    });
  }, [issues, searchTerm, filter]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
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
        resource='vehicle issues'
        onBack={() => router.back()}
        onRetry={() => {window.location.reload()}}
      />
    );
  }

  const openIssuesCount = issues.filter(issue => issue.issue_status === 'OPEN').length;
  const closedIssuesCount = issues.filter(issue => issue.issue_status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
                {openIssuesCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                  >
                    {openIssuesCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vehicle Issues</h1>
                <p className="text-gray-600">{openIssuesCount} open issues, {closedIssuesCount} resolved</p>
              </div>
            </div>
            {canReport && (
              <Button
                onClick={() => setShowReportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Report Issue
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Issues</option>
                <option value="open">Open Issues</option>
                <option value="closed">Closed Issues</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Issues Grid */}
        <AnimatePresence mode="popLayout">
          {filteredIssues.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl border border-gray-200"
            >
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No issues found</h3>
              <p className="text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No vehicle issues have been reported yet'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIssues.map((issue, index) => (
                <motion.div
                  key={issue.issue_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge 
                        variant={issue.issue_status === 'OPEN' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {issue.issue_status}
                      </Badge>
                      <Link href={`/dashboard/shared_pages/vehicle-issues/${issue.issue_id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {issue.issue_title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {issue.issue_description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(issue.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(issue.issue_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

             {/* Report Issue Modal */}
               <ReportIssueModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          reservations={reservations}
          onSubmit={handleReportIssue}
          isLoading={createIssue.isPending}
        />
    </div>
  );
}
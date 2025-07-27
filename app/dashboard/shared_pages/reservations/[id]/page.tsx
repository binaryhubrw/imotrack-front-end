"use client";

import { useParams, useRouter } from "next/navigation";
import {  Calendar, MapPin, Users, Car, Clock, CheckCircle, XCircle, AlertTriangle, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/lib/queries";
import { SkeletonEntityDetails } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import NoPermissionUI from "@/components/NoPermissionUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: reservation, isLoading, isError } = useReservation(id);
  const { user, isLoading: authLoading } = useAuth();

  // Permission checks
  const canView = !!user?.position?.position_access?.reservations?.view;

  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!canView) {
    return <NoPermissionUI resource="reservations" />;
  }

  if (isLoading) {
    return <SkeletonEntityDetails />;
  }

  if (isError || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading reservation details</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW':
        return <AlertTriangle className="w-4 h-4" />;
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
                <Badge className={`${getStatusColor(reservation.reservation_status)} flex items-center gap-1 text-sm px-3 py-1`}>
                  {getStatusIcon(reservation.reservation_status)}
                  {reservation.reservation_status}
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              {/* Purpose and Description - Full Width */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">Purpose</div>
                  <div className="font-medium text-gray-900">{reservation.reservation_purpose}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1">Description</div>
                  <div className="font-medium text-gray-900">{reservation.description}</div>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Start Location
                  </div>
                  <div className="font-medium text-gray-900">{reservation.start_location}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Destination
                  </div>
                  <div className="font-medium text-gray-900">{reservation.reservation_destination}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Passengers
                  </div>
                  <div className="font-medium text-gray-900">{reservation.passengers}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Departure Date
                  </div>
                  <div className="font-medium text-gray-900">{formatDate(reservation.departure_date)}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expected Return
                  </div>
                  <div className="font-medium text-gray-900">{formatDate(reservation.expected_returning_date)}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created
                  </div>
                  <div className="font-medium text-gray-900">{formatDate(reservation.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-[#0872b3]" />
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Name
                </div>
                <div className="font-medium text-gray-900">{reservation.user.first_name} {reservation.user.last_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <div className="font-medium text-gray-900">{reservation.user.email}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  User Telephone
                </div>
                <div className="font-medium text-gray-900 text-sm">{reservation.user.user_phone}</div>
              </div>
            </div>
          </div>

          {/* Reserved Vehicles Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Car className="w-6 h-6 text-[#0872b3]" />
                Reserved Vehicles ({reservation.reserved_vehicles.length})
              </h2>
            </div>
            
            {reservation.reserved_vehicles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reservation.reserved_vehicles.map((reservedVehicle) => {
                  const isOccupied = reservedVehicle.vehicle.vehicle_status === 'OCCUPIED';
                  const cardColor = isOccupied ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
                  
                  return (
                    <div
                      key={reservedVehicle.reserved_vehicle_id}
                      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${cardColor}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">{reservedVehicle.vehicle.vehicle_name}</h4>
                        <Badge className={`text-xs ${isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {reservedVehicle.vehicle.vehicle_status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plate Number:</span>
                          <span className="font-medium text-gray-900">{reservedVehicle.vehicle.plate_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium text-gray-900">{reservedVehicle.vehicle.vehicle_capacity}</span>
                        </div>
                        {reservedVehicle.starting_odometer && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Odometer:</span>
                            <span className="font-medium text-gray-900">{reservedVehicle.starting_odometer} km</span>
                          </div>
                        )}
                        {reservedVehicle.fuel_provided && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fuel Provided:</span>
                            <span className="font-medium text-gray-900">{reservedVehicle.fuel_provided} L</span>
                          </div>
                        )}
                        {reservedVehicle.returned_odometer && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return Odometer:</span>
                            <span className="font-medium text-gray-900">{reservedVehicle.returned_odometer} km</span>
                          </div>
                        )}
                        {reservedVehicle.returned_date && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600 text-xs">Returned:</span>
                            <div className="font-medium text-gray-900 text-xs">{formatDate(reservedVehicle.returned_date)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No Vehicles Assigned</p>
                <p className="text-sm">No vehicles have been assigned to this reservation yet.</p>
              </div>
            )}
          </div>

          {/* Additional Information Card */}
          {(reservation.reviewed_at || reservation.rejection_comment) && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <AlertTriangle className="w-6 h-6 text-[#0872b3]" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservation.reviewed_at && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Reviewed At</div>
                    <div className="font-medium text-gray-900">{formatDate(reservation.reviewed_at)}</div>
                  </div>
                )}
                {reservation.rejection_comment && (
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <div className="text-xs text-cyan-600 uppercase font-medium mb-1">Approve/Reject Reason</div>
                    <div className="font-medium text-orange-900">{reservation.rejection_comment}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetFMVehicle } from '@/lib/queries';
import {
  Car,
  History,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  Award,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseType: string;
  experience: string;
  totalTrips: number;
  totalDistance: string;
  status: "Active" | "Inactive";
  phone: string;
  email: string;
  rating: number;
}

interface Trip {
  id: string;
  date: string;
  driver: string;
  requester: string;
  from: string;
  to: string;
  startOdometer: number;
  endOdometer: number;
  distance: number;
  providedFuel: string;
  returnedOn: string;
  reason: string;
  status: "Completed" | "In Progress" | "Cancelled";
}

const VehicleDetails: React.FC = () => {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { data: vehicle, isLoading, isError } = useGetFMVehicle(vehicleId);
  const [activeTab, setActiveTab] = useState<"info" | "trips" | "drivers">(
    "info"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [tripsPerPage] = useState(5);
  const [driversPerPage] = useState(6);

  // Replace mock vehicleInfo with real data
  const vehicleInfo = useMemo(() => vehicle
    ? {
        id: vehicle.id,
        type: vehicle.model, // No explicit type field, use model/manufacturer
        model: vehicle.model,
        capacity: vehicle.capacity ?? '-',
        plateNo: vehicle.plate_number,
        status: vehicle.status,
        initialOdometer: vehicle.odometer, // No initial, just odometer
        currentOdometer: vehicle.odometer,
        inUseSince: vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : '-',
        lastUsed: vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : '-',
        lastTripInitial: '-', // TODO: from trips API
        lastTripFinal: '-', // TODO: from trips API
        fuelType: vehicle.fuel_type ?? '-',
        insurance: '-', // TODO: from insurance API/field
        nextMaintenance: '-', // TODO: from maintenance API/field
      }
    : null, [vehicle]);

  const drivers = useMemo<Driver[]>(() => [
    {
      id: "D-001",
      name: "John Smith",
      licenseNumber: "DL-12345",
      licenseType: "Class B",
      experience: "7 years",
      totalTrips: 156,
      totalDistance: "12,450 km",
      status: "Active",
      phone: "+1-234-567-8901",
      email: "john.smith@company.com",
      rating: 4.8,
    },
    {
      id: "D-002",
      name: "Maria Garcia",
      licenseNumber: "DL-23456",
      licenseType: "Class A",
      experience: "10 years",
      totalTrips: 243,
      totalDistance: "18,750 km",
      status: "Active",
      phone: "+1-234-567-8902",
      email: "maria.garcia@company.com",
      rating: 4.9,
    },
    {
      id: "D-003",
      name: "David Johnson",
      licenseNumber: "DL-34567",
      licenseType: "Class B",
      experience: "5 years",
      totalTrips: 89,
      totalDistance: "7,230 km",
      status: "Inactive",
      phone: "+1-234-567-8903",
      email: "david.johnson@company.com",
      rating: 4.6,
    },
    {
      id: "D-004",
      name: "Sarah Wilson",
      licenseNumber: "DL-45678",
      licenseType: "Class A",
      experience: "12 years",
      totalTrips: 301,
      totalDistance: "25,890 km",
      status: "Active",
      phone: "+1-234-567-8904",
      email: "sarah.wilson@company.com",
      rating: 4.7,
    },
  ], []);

  const trips = useMemo<Trip[]>(() => [
    {
      id: "T-10023",
      date: "15/05/2025",
      driver: "John Smith",
      requester: "John Smith",
      from: "Office HQ",
      to: "Client Site A",
      startOdometer: 670,
      endOdometer: 700,
      distance: 30,
      providedFuel: "30 L",
      returnedOn: "15/05/2025",
      reason: "Business Trip",
      status: "Completed",
    },
    {
      id: "T-10022",
      date: "10/05/2025",
      driver: "Jane Doe",
      requester: "Jane Doe",
      from: "Warehouse",
      to: "Distribution Center",
      startOdometer: 620,
      endOdometer: 670,
      distance: 50,
      providedFuel: "25 L",
      returnedOn: "11/05/2025",
      reason: "Delivery",
      status: "Completed",
    },
    {
      id: "T-10021",
      date: "05/05/2025",
      driver: "Robert Johnson",
      requester: "Robert Johnson",
      from: "Head Office",
      to: "Branch Office",
      startOdometer: 590,
      endOdometer: 620,
      distance: 30,
      providedFuel: "15 L",
      returnedOn: "06/05/2025",
      reason: "Personal Use",
      status: "Completed",
    },
    {
      id: "T-10020",
      date: "01/05/2025",
      driver: "Maria Garcia",
      requester: "Alex Brown",
      from: "Airport",
      to: "Hotel Conference",
      startOdometer: 550,
      endOdometer: 590,
      distance: 40,
      providedFuel: "20 L",
      returnedOn: "02/05/2025",
      reason: "Business Trip",
      status: "Completed",
    },
    {
      id: "T-10019",
      date: "28/04/2025",
      driver: "Sarah Wilson",
      requester: "Mike Davis",
      from: "Factory",
      to: "Port Terminal",
      startOdometer: 500,
      endOdometer: 550,
      distance: 50,
      providedFuel: "35 L",
      returnedOn: "29/04/2025",
      reason: "Delivery",
      status: "Completed",
    },
  ], []);

  const [tripFilters, setTripFilters] = useState({
    date: "",
    plate: "",
    requester: "",
    reason: "",
  });

  const [driverFilters, setDriverFilters] = useState({
    name: "",
    licenseType: "",
    status: "",
  });

  // Filtered and paginated data
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      return (
        (!tripFilters.date || trip.date.includes(tripFilters.date)) &&
        (!tripFilters.plate ||
          vehicleInfo?.plateNo
            .toLowerCase()
            .includes(tripFilters.plate.toLowerCase())) &&
        (!tripFilters.requester ||
          trip.requester
            .toLowerCase()
            .includes(tripFilters.requester.toLowerCase())) &&
        (!tripFilters.reason ||
          trip.reason.toLowerCase().includes(tripFilters.reason.toLowerCase()))
      );
    });
  }, [trips, tripFilters, vehicleInfo]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      return (
        (!driverFilters.name ||
          driver.name
            .toLowerCase()
            .includes(driverFilters.name.toLowerCase())) &&
        (!driverFilters.licenseType ||
          driver.licenseType === driverFilters.licenseType) &&
        (!driverFilters.status || driver.status === driverFilters.status)
      );
    });
  }, [drivers, driverFilters]);

  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * tripsPerPage;
    return filteredTrips.slice(startIndex, startIndex + tripsPerPage);
  }, [filteredTrips, currentPage, tripsPerPage]);

  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * driversPerPage;
    return filteredDrivers.slice(startIndex, startIndex + driversPerPage);
  }, [filteredDrivers, currentPage, driversPerPage]);

  const totalPages = useMemo(() => {
    if (activeTab === "trips") {
      return Math.ceil(filteredTrips.length / tripsPerPage);
    } else if (activeTab === "drivers") {
      return Math.ceil(filteredDrivers.length / driversPerPage);
    }
    return 1;
  }, [
    filteredTrips.length,
    filteredDrivers.length,
    activeTab,
    tripsPerPage,
    driversPerPage,
  ]);

  const handleTripFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTripFilters({ ...tripFilters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleDriverFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setDriverFilters({ ...driverFilters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleTripFilterReset = () => {
    setTripFilters({ date: "", plate: "", requester: "", reason: "" });
    setCurrentPage(1);
  };

  const handleDriverFilterReset = () => {
    setDriverFilters({ name: "", licenseType: "", status: "" });
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "maintenance":
      case "in progress":
        return "bg-orange-100 text-orange-800";
      case "inactive":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderVehicleInfo = () => (
    <div className="space-y-6">
      {/* Vehicle Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0872B3] px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Car className="w-6 h-6 mr-3" />
              Vehicle Information
            </h3>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                vehicleInfo?.status || ''
              )}`}
            >
              {vehicleInfo?.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Vehicle ID
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.id}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Vehicle Type
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.type}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Vehicle Model
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.model}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Capacity
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.capacity}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Plate No
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.plateNo}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Fuel Type
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.fuelType}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Initial Odometer (km)
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.initialOdometer.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Current Odometer (km)
              </div>
              <div className="font-bold text-lg text-[#0872B3]">
                {vehicleInfo?.currentOdometer.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                In use since
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.inUseSince}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Recently used on
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.lastUsed}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Last Trip Initial (km)
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.lastTripInitial.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Last Trip Final (km)
              </div>
              <div className="font-bold text-lg text-gray-900">
                {vehicleInfo?.lastTripFinal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-8 h-8 text-[#0872B3] mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Next Maintenance
                  </div>
                  <div className="text-lg font-bold text-[#0872B3]">
                    {vehicleInfo?.nextMaintenance}
                  </div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <Award className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Insurance Status
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {vehicleInfo?.insurance}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Request Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0872B3] px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <History className="w-6 h-6 mr-3" />
            Vehicle Request Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0872B3] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Vehicle Plate Nbr
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Name of Requester
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Reason for Request
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Initial Odometer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Final Odometer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Provided Fuel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Returned On
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTrips.map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {vehicleInfo?.plateNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.requester}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.startOdometer} km
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.endOdometer} km
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.providedFuel}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.returnedOn}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="flex items-center px-3 py-1.5 bg-blue-100 text-[#0872B3] rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Trips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={tripFilters.date}
              onChange={handleTripFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Plate Number
            </label>
            <input
              type="text"
              name="plate"
              value={tripFilters.plate}
              onChange={handleTripFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter plate number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of Requester
            </label>
            <input
              type="text"
              name="requester"
              value={tripFilters.requester}
              onChange={handleTripFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Request
            </label>
            <select
              name="reason"
              value={tripFilters.reason}
              onChange={handleTripFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All reasons</option>
              <option value="Business Trip">Business Trip</option>
              <option value="Personal Use">Personal Use</option>
              <option value="Delivery">Delivery</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleTripFilterReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#0872B3] transition-colors">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0872B3] px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <History className="w-6 h-6 mr-3" />
            Vehicle Request Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0872B3] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Vehicle Plate Nbr
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Name of Requester
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Reason for Request
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Initial Odometer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Final Odometer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Provided Fuel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Returned On
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTrips.map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {vehicleInfo?.plateNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.requester}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.startOdometer} km
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.endOdometer} km
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.providedFuel}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.returnedOn}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Search & Filter Drivers
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver Name
            </label>
            <input
              type="text"
              name="name"
              value={driverFilters.name}
              onChange={handleDriverFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
              placeholder="Search driver name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Type
            </label>
            <select
              name="licenseType"
              value={driverFilters.licenseType}
              onChange={handleDriverFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
            >
              <option value="">All License Types</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={driverFilters.status}
              onChange={handleDriverFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0872B3] focus:border-[#0872B3] transition-colors"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleDriverFilterReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button className="px-4 py-2 bg-[#0872B3] text-white rounded-lg hover:bg-[#0872B3] transition-colors">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0872B3] px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Drivers List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0872B3] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Driver Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  License Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  License Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Experience
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Total Trips
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Total Distance
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.licenseType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.experience}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.totalTrips}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.totalDistance}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        driver.status
                      )}`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {driver.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0872B3] font-semibold">
                    {driver.rating}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="flex items-center px-3 py-1.5 bg-blue-100 text-[#0872B3] rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Loading and error states
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  if (isError || !vehicleInfo) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Vehicle not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${
            activeTab === "info"
              ? "bg-[#0872B3] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("info");
            setCurrentPage(1);
          }}
        >
          Vehicle Info
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${
            activeTab === "trips"
              ? "bg-[#0872B3] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("trips");
            setCurrentPage(1);
          }}
        >
          Trip History
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${
            activeTab === "drivers"
              ? "bg-[#0872B3] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("drivers");
            setCurrentPage(1);
          }}
        >
          Drivers
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && renderVehicleInfo()}
      {activeTab === "trips" && renderTrips()}
      {activeTab === "drivers" && renderDrivers()}

      {/* Pagination */}
      {(activeTab === "trips" || activeTab === "drivers") && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded border bg-white text-blue-600 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border bg-white text-blue-600 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;

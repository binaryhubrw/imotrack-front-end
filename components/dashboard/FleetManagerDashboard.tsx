import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Car, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useFMVehicles, useFmRequests } from "@/lib/queries";
import type { Vehicle } from '@/types/next-auth';

// Add a type for StatCard props
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ icon: Icon, title, value, bgColor, textColor }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col justify-between min-h-[110px] flex-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function FleetManagerDashboard() {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useFMVehicles();
  const { data: requests = [], isLoading: isLoadingRequests } = useFmRequests();

  // Compute stats
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v: Vehicle) => v.status?.toUpperCase() === 'AVAILABLE').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status?.toUpperCase() === 'PENDING').length;

  // Recent requests (up to 5)
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">

          <Link href={"/dashboard/fleet-manager/vehicles-info"}>
            <StatCard
              icon={Car}
              title="Total Vehicles"
              value={isLoadingVehicles ? '...' : totalVehicles.toString()}
              bgColor="bg-[#0872B3]"
              textColor="text-[#0872B3]"
            />
          </Link>
          <StatCard
            icon={Car}
            title="Available Vehicles"
            value={isLoadingVehicles ? '...' : availableVehicles.toString()}
            bgColor="bg-green-600"
            textColor="text-green-100"
          />
          <Link href={"/dashboard/fleet-manager/request-overview"}>
            <StatCard
              icon={BarChart3}
              title="Total Requests"
              value={isLoadingRequests ? '...' : totalRequests.toString()}
              bgColor="bg-[#0872B3]"
              textColor="text-[#0872B3]"
            />
          </Link>
          <StatCard
            icon={FileText}
            title="Pending Requests"
            value={isLoadingRequests ? '...' : pendingRequests.toString()}
            bgColor="bg-yellow-500"
            textColor="text-yellow-100"
          />
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Vehicle Requests
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
              This Week
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600">Request made</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded"></div>
              <span className="text-sm text-gray-600">Approved Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span className="text-sm text-gray-600">Declined Request</span>
            </div>
          </div>

          {/* Charts Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-96">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vehicles}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  domain={[0, totalVehicles]}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="status"
                  fill="#16a34a"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={vehicles}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  domain={[0, totalVehicles]}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="status"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Request ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Purpose</th>
                  <th className="px-4 py-2 text-left font-semibold">Destination</th>
                  <th className="px-4 py-2 text-left font-semibold">Passengers</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-400">No recent requests.</td></tr>
                ) : (
                  recentRequests.map((req) => (
                    <tr key={req.id} className="border-t cursor-pointer border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{req.id}</td>
                      <td className="px-4 py-2">{new Date(req.requested_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{req.trip_purpose}</td>
                      <td className="px-4 py-2">{req.end_location}</td>
                      <td className="px-4 py-2 text-center">{req.passengers_number}</td>
                      <td className="px-4 py-2">{req.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

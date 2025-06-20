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
import { Car, User, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";

// Add a type for StatCard props
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ icon: Icon, title, value, bgColor, textColor }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
  const chartData = [
    { day: "Monday", requested: 850, approved: 150, declined: 750 },
    { day: "Tuesday", requested: 720, approved: 200, declined: 480 },
    { day: "Wednesday", requested: 720, approved: 480, declined: 200 },
    { day: "Thursday", requested: 840, approved: 480, declined: 320 },
    { day: "Friday", requested: 980, approved: 480, declined: 480 },
    { day: "Saturday", requested: 840, approved: 150, declined: 720 },
    { day: "Sunday", requested: 720, approved: 200, declined: 480 },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      date: "2024-03-10",
      vehicle: "Toyota Camry",
      activity: "Maintenance Check",
      status: "Completed",
      notes: "Regular service and oil change",
    },
    {
      id: 2,
      date: "2024-03-09",
      vehicle: "Ford F-150",
      activity: "Fuel Refill",
      status: "Completed",
      notes: "Full tank refill",
    },
    {
      id: 3,
      date: "2024-03-08",
      vehicle: "Tesla Model 3",
      activity: "Battery Check",
      status: "Pending",
      notes: "Scheduled maintenance",
    },
    {
      id: 4,
      date: "2024-03-07",
      vehicle: "Honda Civic",
      activity: "Tire Rotation",
      status: "Completed",
      notes: "Regular maintenance",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Link href={"/dashboard/fleet-manager/vehicles-info"}>
            <StatCard
              icon={Car}
              title="Vehicles"
              value="24 Total"
              bgColor="bg-[#0872B3]"
              textColor="text-[#0872B3]"
            />
          </Link>
          <StatCard
            icon={User}
            title="Drivers"
            value="18 Active"
            bgColor="bg-[#0872B3]"
            textColor="text-[#0872B3]"
          />
          <Link href={"/dashboard/fleet-manager/issue-management"}>
            <StatCard
              icon={FileText}
              title="Issue Management"
              value="5 Pending"
              bgColor="bg-[#0872B3]"
              textColor="text-[#0872B3]"
            />
          </Link>
          <Link href={"/dashboard/fleet-manager/request-overview"}>
            <StatCard
              icon={BarChart3}
              title="Request Overview"
              value="156 Total"
              bgColor="bg-[#0872B3]"
              textColor="text-[#0872B3]"
            />
          </Link>
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
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  domain={[0, 1000]}
                  ticks={[0, 250, 500, 750, 1000]}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="requested"
                  fill="#16a34a"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="approved"
                  fill="#15803d"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="declined"
                  fill="#ea580c"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  domain={[0, 1000]}
                  ticks={[0, 250, 500, 750, 1000]}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#15803d"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="declined"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
            <p className="text-gray-600 mt-1">Latest updates from your fleet</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.activity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          activity.status === "Completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { Users, Building2, TrendingUp, Shield } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";
import { useOrganizations, useUsers } from "@/lib/queries";
import { UserRole, UserListItem } from "@/types/next-auth";

// Define types for Recharts Tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; dataKey: string }>;
  label?: string;
}

// Sample data for charts and statistics
const userGrowthData = [
  { month: "Jan", users: 65 },
  { month: "Feb", users: 78 },
  { month: "Mar", users: 90 },
  { month: "Apr", users: 81 },
  { month: "May", users: 56 },
  { month: "Jun", users: 55 },
];

// Organization distribution data for bar chart - Placeholder for now
const orgDistributionData = [
  { sector: "Education", count: 12 },
  { sector: "Healthcare", count: 19 },
  { sector: "Government", count: 8 },
  { sector: "Private", count: 15 },
  { sector: "NGO", count: 7 },
];

// Custom bar colors for organization chart
const barColors = ["#0872B3", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40"];

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-600">{`${label}`}</p>
        <p className="text-blue-600 font-semibold">
          {`${payload[0].name}: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-600">{`${label}`}</p>
        <p className="text-blue-600 font-semibold">
          {`Count: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SuperAdminDashboard() {
  const { data: organizations, isLoading: isLoadingOrg, isError: isErrorOrg } = useOrganizations();
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useUsers();

  const isLoading = isLoadingOrg || isLoadingUsers;
  const isError = isErrorOrg || isErrorUsers;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-600">
        Error loading dashboard data.
      </div>
    );
  }

  const totalOrganizations = organizations?.length || 0;
  const totalUsers = users?.length || 0;

  // Calculate user role distribution
  const userRoleCounts = (users as UserListItem[])?.reduce((acc, user) => {
    const roleName = user.role as UserRole;
    if (roleName) {
      acc[roleName] = (acc[roleName] || 0) + 1;
    }
    return acc;
  }, {} as Record<UserRole, number>);

  const userRoleData = userRoleCounts ? Object.entries(userRoleCounts).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count,
    color: getColorForRole(role as UserRole),
  })) : [];

  // Helper function to assign colors to roles
  function getColorForRole(role: UserRole): string {
    switch (role) {
      case 'admin': return '#0872B3';
      case 'fleetmanager': return '#FFC107'; // Yellow
      case 'hr': return '#28A745'; // Green
      case 'staff': return '#DC3545'; // Red
      default: return '#6C757D'; // Gray
    }
  }

  // Placeholder for other stats until more APIs are integrated
  const userGrowth = 15; 
  const orgGrowth = 5;
  const activeAlerts = 12;

  return (
    <main className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Users Card */}
          <Link href="/dashboard/admin/users">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Total Users</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                    {totalUsers}
                  </h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-xs sm:text-sm ml-1">
                      +{userGrowth}% this month
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0872B3]" />
                </div>
              </div>
            </div>
          </Link>

          {/* Organizations Card */}
          <Link href="/dashboard/admin/organizations">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Total Organizations</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                    {totalOrganizations}
                  </h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-xs sm:text-sm ml-1">
                      +{orgGrowth}% this month
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0872B3]" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              User Growth Trend
            </h3>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#0872B3"
                    strokeWidth={3}
                    fill="rgba(8, 114, 179, 0.1)"
                    fillOpacity={0.6}
                    dot={{ fill: "#0872B3", strokeWidth: 2, r: 5 }}
                    activeDot={{
                      r: 7,
                      stroke: "#0872B3",
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Organization Distribution Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Organization Distribution
            </h3>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orgDistributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="sector"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {orgDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={barColors[index % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Role Distribution and System Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* User Role Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              User Role Distribution
            </h3>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconSize={12}
                    wrapperStyle={{
                      paddingLeft: "20px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                System Alerts
              </h3>
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-600 text-xs sm:text-sm font-medium">
                  {activeAlerts} active
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {[ // Placeholder alerts
                {
                  type: "Security",
                  message: "Multiple failed login attempts detected",
                },
                { type: "System", message: "Database backup required" },
                { type: "Performance", message: "High server load detected" },
              ].map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="bg-red-100 p-2 rounded-full">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">{alert.type} Alert</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

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

// Sample data for charts and statistics
const stats = {
  totalUsers: 1250,
  totalOrganizations: 45,
  activeAlerts: 12,
  userGrowth: 15,
  orgGrowth: 5,
};

// User growth data for line chart
const userGrowthData = [
  { month: "Jan", users: 65 },
  { month: "Feb", users: 78 },
  { month: "Mar", users: 90 },
  { month: "Apr", users: 81 },
  { month: "May", users: 56 },
  { month: "Jun", users: 55 },
];

// Organization distribution data for bar chart
const orgDistributionData = [
  { sector: "Education", count: 12 },
  { sector: "Healthcare", count: 19 },
  { sector: "Government", count: 8 },
  { sector: "Private", count: 15 },
  { sector: "NGO", count: 7 },
];

// User role distribution for doughnut chart
const userRoleData = [
  { name: "Admin", value: 300, color: "#0872B3" },
  { name: "Staff", value: 450, color: "#36A2EB" },
  { name: "Viewer", value: 500, color: "#4BC0C0" },
];

// Custom bar colors for organization chart
const barColors = ["#0872B3", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40"];

const CustomTooltip = ({ active, payload, label }) => {
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

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-gray-600">{`${label}`}</p>
        <p className="text-blue-600 font-semibold">
          {`Organizations: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Users Card */}
          <Link href="/dashboard/users">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.totalUsers}
                  </h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm ml-1">
                      +{stats.userGrowth}% this month
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-[#0872B3]" />
                </div>
              </div>
            </div>
          </Link>

          <Link href={"/dashboard/organizations"}>
            {/* Organizations Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Organizations</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.totalOrganizations}
                  </h3>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm ml-1">
                      +{stats.orgGrowth}% this month
                    </span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              User Growth Trend
            </h3>
            <div className="h-64">
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Organization Distribution
            </h3>
            <div className="h-64">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              User Role Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                System Alerts
              </h3>
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-600 text-sm font-medium">
                  {stats.activeAlerts} active
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {[
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
                    <p className="text-sm font-medium text-gray-800">
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

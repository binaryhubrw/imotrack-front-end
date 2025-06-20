

import React, { useState } from "react";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Cell,
} from "recharts";
import { Users, Car, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function StaffAdminDashboard() {
  const [performanceFilter, setPerformanceFilter] = useState("Last Month");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");

  // Performance trends data
  const performanceData = [
    { month: "Jan", staff: 4.2, driver: 4.5 },
    { month: "Feb", staff: 4.3, driver: 4.4 },
    { month: "Mar", staff: 4.0, driver: 4.6 },
    { month: "Apr", staff: 4.1, driver: 4.4 },
    { month: "May", staff: 4.4, driver: 4.7 },
    { month: "Jun", staff: 4.2, driver: 4.5 },
  ];

  // Department performance data
  const departmentData = [
    { name: "Transport", value: 4.5 },
    { name: "Administration", value: 4.2 },
    { name: "Finance", value: 4.3 },
    { name: "IT", value: 4.4 },
  ];

  const departmentColors = {
    HR: "#FF6384",
    Sales: "#36A2EB",
    Marketing: "#FFCE56",
    IT: "#4BC0C0",
    Finance: "#9966FF",
    // fallback will be #0872B3
  };

  const performanceFilterOptions = [
    "Last Month",
    "Last 3 Months",
    "Last 6 Months",
    "Last Year",
  ];
  const departmentFilterOptions = [
    "All Departments",
    "Transport",
    "Administration",
    "Finance",
    "IT",
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Staff */}
          <Link href="/dashboard/staff-management" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Staff
                    </p>
                    <p className="text-2xl font-bold text-[#0872B3]">
                      156 Employees
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Active Drivers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Drivers
                  </p>
                  <p className="text-2xl font-bold text-[#0872B3]">
                    24 Drivers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests */}
          <Link href="/dashboard/vehicle-requests" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#FFC107]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Leave Requests
                    </p>
                    <p className="text-2xl font-bold text-[#0872B3]">
                      12 Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">
                Performance Trends
              </h3>
              <div className="relative">
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm text-gray-600 cursor-pointer hover:border-[#0872B3] focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
                >
                  {performanceFilterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Staff Performance
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Driver Performance
                  </span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient
                      id="staffGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="driverGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#10B981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                      <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[3.0, 5.0]}
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="staff"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#staffGradient)"
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="driver"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#driverGradient)"
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">
                Department Performance
              </h3>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm text-gray-600 cursor-pointer hover:border-[#0872B3] focus:outline-none focus:border-[#0872B3] focus:ring-1 focus:ring-[#0872B3]"
                >
                  {departmentFilterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[3.0, 5.0]}
                    axisLine={{ stroke: "#ccc", strokeWidth: 1 }}
                    tickLine={{ stroke: "#ccc" }}
                    tick={{ fontSize: 12 }}
                  />

                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={departmentColors[entry.name] || "#0872B3"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Legend */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: departmentColors[dept.name] }}
                  ></div>
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <span className="text-sm font-medium text-cyan-700">
                    {dept.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

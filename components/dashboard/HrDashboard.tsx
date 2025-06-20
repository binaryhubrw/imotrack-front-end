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
import { useHrUsers } from "@/lib/queries";
import { HrUser } from "@/types/next-auth";



export default function HrDashboard() {
  const [performanceFilter, setPerformanceFilter] = useState("Last Month");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");

  // Fetch HR users using your existing hook
  const { data: hrUsers, isLoading, isError } = useHrUsers();

  // Calculate counts from API data
  const staffCount = hrUsers?.filter((user: HrUser) => 
    user.role?.toLowerCase() === 'staff' && user.status === 'active'
  ).length || 0;

  const fleetManagerCount = hrUsers?.filter((user: HrUser) => 
    user.role?.toLowerCase() === 'fleetmanager' && user.status === 'active'
  ).length || 0;
  // Calculate performance data based on role distribution
  const performanceData = [
    { month: "Jan", staff: 4.2, fleetmanager: 4.5 },
    { month: "Feb", staff: 4.3, fleetmanager: 4.4 },
    { month: "Mar", staff: 4.0, fleetmanager: 4.6 },
    { month: "Apr", staff: 4.1, fleetmanager: 4.4 },
    { month: "May", staff: 4.4, fleetmanager: 4.7 },
    { month: "Jun", staff: 4.2, fleetmanager: 4.5 },
  ];

  // Department performance based on actual data
  const departmentData = [
    { name: "Staff", value: staffCount, color: "#3B82F6" },
    { name: "Fleet Manager", value: fleetManagerCount, color: "#10B981" },
    { name: "Transport", value: 4.5, color: "#F59E0B" },
    { name: "Administration", value: 4.2, color: "#EF4444" },
  ];

  const performanceFilterOptions = [
    "Last Month",
    "Last 3 Months", 
    "Last 6 Months",
    "Last Year",
  ];

  const departmentFilterOptions = [
    "All Departments",
    "Staff",
    "Fleet Manager",
    "Transport",
    "Administration",
  ];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    bgColor, 
    textColor, 
    href 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    href?: string;
  }) => {
    const CardContent = (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${textColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : isError ? (
                <span className="text-red-500">Error</span>
              ) : (
                value
              )}
            </p>
          </div>
        </div>
      </div>
    );

    return href ? (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    ) : (
      CardContent
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Staff"
            value={`${staffCount} Staffs`}
            icon={Users}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
            href="/dashboard/hr/staff-management"
          />
          
          <StatCard
            title="Fleet Managers"
            value={`${fleetManagerCount} Active`}
            icon={Car}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          
          <StatCard
            title="Leave Requests"
            value="12 Pending"
            icon={Clock}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
            href="/dashboard/leave-requests"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Trends
              </h3>
              <div className="relative">
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  {performanceFilterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Staff Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fleet Manager Performance</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="staffGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fleetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    domain={[3.5, 5.0]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
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
                    dataKey="fleetmanager"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#fleetGradient)"
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Department Overview
              </h3>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  {departmentFilterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {typeof dept.value === 'number' && dept.value < 10 ? dept.value : dept.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/staff-management" className="block">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-900">Manage Staff</p>
              </div>
            </Link>
            <Link href="/dashboard/fleet-management" className="block">
              <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <Car className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-900">Fleet Management</p>
              </div>
            </Link>
            <Link href="/dashboard/leave-requests" className="block">
              <div className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
                <Clock className="w-6 h-6 text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-900">Leave Requests</p>
              </div>
            </Link>
            <Link href="/dashboard/reports" className="block">
              <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-purple-900">Reports</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
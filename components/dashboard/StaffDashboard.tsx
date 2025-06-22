"use client";
import { useStaffRequests } from "@/lib/queries";
import { StaffRequestStatus } from "@/types/next-auth";
import { BarChart, CheckCircle, AlertTriangle, Ban, Eye, Pencil } from "lucide-react";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const STATUS_LABELS: Record<StaffRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
};

const STATUS_COLORS: Record<StaffRequestStatus, string> = {
  PENDING: '#fde047',
  APPROVED: '#4ade80',
  REJECTED: '#f87171',
  COMPLETED: '#60a5fa',
  ACTIVE: '#a78bfa',
};

function statusBadge(status: StaffRequestStatus) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "PENDING":
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    case "APPROVED":
      return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
    case "COMPLETED":
      return <span className={`${base} bg-blue-100 text-blue-800`}>Completed</span>;
    case "REJECTED":
      return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
    case "ACTIVE":
      return <span className={`${base} bg-purple-100 text-purple-800`}>Active</span>;
    default:
      return <span className={base}>{status}</span>;
  }
}

export default function DashboardPage() {
  const { data: requests = [], isLoading } = useStaffRequests();

  // Compute stats
  const stats = [
    {
      label: "Pending Requests",
      value: requests.filter(r => r.status === "PENDING").length,
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    },
    {
      label: "Approved Requests",
      value: requests.filter(r => r.status === "APPROVED").length,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    {
      label: "Completed Trips",
      value: requests.filter(r => r.status === "COMPLETED").length,
      icon: <BarChart className="w-6 h-6 text-blue-500" />,
    },
    {
      label: "Rejected Requests",
      value: requests.filter(r => r.status === "REJECTED").length,
      icon: <Ban className="w-6 h-6 text-red-500" />,
    },
  ];

  // Chart data: group by month for line chart
  const lineData = (() => {
    const monthMap: Record<string, number> = {};
    requests.forEach(r => {
      const month = new Date(r.requested_at).toLocaleString('default', { month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    return Object.entries(monthMap).map(([month, requests]) => ({ month, requests }));
  })();

  // Donut chart: status distribution
  const donutData = Object.entries(STATUS_LABELS).map(([status, label]) => ({
    name: label,
    value: requests.filter(r => r.status === status).length,
    color: STATUS_COLORS[status as StaffRequestStatus],
  }));

  // Recent requests (show up to 5)
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="font-semibold text-gray-700 mb-4">Monthly Trip Requests</div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  domain={[0, 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#2563eb', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="font-semibold text-gray-700 mb-4">Request Status Distribution</div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconSize={12}
                  wrapperStyle={{
                    paddingLeft: '20px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-lg text-gray-800">Recent Vehicle Requests</div>
          <button className="text-blue-600 hover:underline text-sm font-medium">+ New Request</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-2 text-left font-semibold">Request ID</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Purpose</th>
                <th className="px-4 py-2 text-left font-semibold">Destination</th>
                <th className="px-4 py-2 text-left font-semibold">Passengers</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Start Date</th>
                <th className="px-4 py-2 text-left font-semibold">End Date</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{req.id}</td>
                  <td className="px-4 py-2">{new Date(req.requested_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{req.trip_purpose}</td>
                  <td className="px-4 py-2">{req.end_location}</td>
                  <td className="px-4 py-2 text-center">{req.passengers_number}</td>
                  <td className="px-4 py-2">{statusBadge(req.status)}</td>
                  <td className="px-4 py-2">{new Date(req.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(req.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="p-1 rounded hover:bg-gray-100" aria-label="View">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100" aria-label="Edit">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
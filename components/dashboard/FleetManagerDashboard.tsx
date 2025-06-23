import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Car, FileText, BarChart3, TrendingUp, Calendar, MapPin, Users, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useFMVehicles, useFmRequests } from '@/lib/queries';

const StatCard = ({ icon: Icon, title, value, subtitle, bgColor, textColor, trend, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${textColor}`} />
          <p className="text-gray-600 text-sm font-medium">{title}</p>
        </div>
        <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    'CANCELLED': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    'AVAILABLE': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'OCCUPIED': { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle },
    'MAINTENANCE': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
    'OUT_OF_SERVICE': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  };
  
  const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function FleetManagerDashboard() {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useFMVehicles();
  const { data: requests = [], isLoading: isLoadingRequests } = useFmRequests();

  // Process data for visualizations
  const dashboardData = useMemo(() => {
    // Vehicle stats
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length;
    const occupiedVehicles = vehicles.filter(v => v.status?.toUpperCase() === 'OCCUPIED').length;
    const maintenanceVehicles = vehicles.filter(v => v.status?.toUpperCase() === 'MAINTENANCE').length;
    const outOfServiceVehicles = vehicles.filter(v => v.status?.toUpperCase() === 'OUT_OF_SERVICE').length;

    // Request stats
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status?.toUpperCase() === 'PENDING').length;
    const approvedRequests = requests.filter(r => r.status?.toUpperCase() === 'APPROVED').length;
    const rejectedRequests = requests.filter(r => r.status?.toUpperCase() === 'REJECTED').length;
    const cancelledRequests = requests.filter(r => r.status?.toUpperCase() === 'CANCELLED').length;

    // Vehicle status chart data
    const vehicleStatusData = [
      { name: 'Available', value: availableVehicles, color: '#10b981' },
      { name: 'Occupied', value: occupiedVehicles, color: '#3b82f6' },
      { name: 'Maintenance', value: maintenanceVehicles, color: '#f59e0b' },
      { name: 'Out of Service', value: outOfServiceVehicles, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Request status chart data
    const requestStatusData = [
      { name: 'Approved', value: approvedRequests, color: '#10b981' },
      { name: 'Pending', value: pendingRequests, color: '#f59e0b' },
      { name: 'Rejected', value: rejectedRequests, color: '#ef4444' },
      { name: 'Cancelled', value: cancelledRequests, color: '#6b7280' },
    ].filter(item => item.value > 0);

    // Weekly trend data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRequests = requests.filter(r => 
        r.requested_at?.startsWith(dateStr)
      ).length;
      
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        requests: dayRequests,
        date: dateStr
      });
    }

    // Vehicle type distribution
    const vehicleTypeData = vehicles.reduce((acc, vehicle) => {
      const type = vehicle.vehicle_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const vehicleTypeChartData = Object.entries(vehicleTypeData).map(([type, count], index) => ({
      name: type,
      value: count,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }));

    // Recent requests
    const recentRequests = [...requests]
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))
      .slice(0, 5);

    return {
      totalVehicles,
      availableVehicles,
      occupiedVehicles,
      totalRequests,
      pendingRequests,
      vehicleStatusData,
      requestStatusData,
      vehicleTypeChartData,
      weeklyData,
      recentRequests
    };
  }, [vehicles, requests]);

  if (isLoadingVehicles || isLoadingRequests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
            <p className="text-gray-600 mt-1">Monitor your fleet performance and requests</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Car}
            title="Total Vehicles"
            value={dashboardData.totalVehicles.toString()}
            subtitle={`${dashboardData.availableVehicles} available`}
            bgColor="bg-blue-600"
            textColor="text-blue-600"
            trend="+2 this month"
          />
          <StatCard
            icon={Car}
            title="Occupied Vehicles"
            value={dashboardData.occupiedVehicles.toString()}
            subtitle="Currently in use"
            bgColor="bg-blue-600"
            textColor="text-blue-600"
          />
          <StatCard
            icon={FileText}
            title="Total Requests"
            value={dashboardData.totalRequests.toString()}
            subtitle="All time"
            bgColor="bg-purple-600"
            textColor="text-purple-600"
            trend="+12 this week"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending"
            value={dashboardData.pendingRequests.toString()}
            subtitle="Needs attention"
            bgColor="bg-orange-600"
            textColor="text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Vehicle Status Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {dashboardData.vehicleStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Requests Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.weeklyData}>
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
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Types</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.vehicleTypeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.vehicleTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {dashboardData.vehicleTypeChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          
          {dashboardData.recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Requester</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trip Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Passengers</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentRequests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-blue-600">
                          {req.id.split('-')[0]}...
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(req.requested_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{req.full_name}</div>
                          <div className="text-gray-500">{req.requester?.first_name} {req.requester?.last_name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{req.trip_purpose}</div>
                          <div className="text-gray-500">{req.start_location} → {req.end_location}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          {req.passengers_number}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}